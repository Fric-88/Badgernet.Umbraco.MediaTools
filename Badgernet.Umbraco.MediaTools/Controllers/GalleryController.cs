using System.IO.Compression;
using Asp.Versioning;
using Badgernet.Umbraco.MediaTools.Helpers;
using Badgernet.Umbraco.MediaTools.Models;
using Badgernet.Umbraco.MediaTools.Services.FileManager;
using Badgernet.Umbraco.MediaTools.Services.ImageProcessing;
using Badgernet.Umbraco.MediaTools.Services.ImageProcessing.Metadata;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SixLabors.ImageSharp;
using Size = SixLabors.ImageSharp.Size;
using SixLabors.ImageSharp.Metadata.Profiles.Exif;
using System.Security.Permissions;
using System.Threading;
using System.Collections.Concurrent;
using K4os.Compression.LZ4.Internal;
using Microsoft.Extensions.Caching.Distributed;
using Umbraco.Cms.Core.Models;


namespace Badgernet.Umbraco.MediaTools.Controllers;

[ApiVersion("1.0")]
[ApiExplorerSettings(GroupName = "mediatools")]
[Route("gallery")]
public class GalleryController(ILogger<SettingsController> logger, IMediaHelper mediaHelper, IFileManager fileManager, IImageProcessor imageProcessor, IMetadataProcessor metadataProcessor, IDistributedCache distributedCache) : ControllerBase
{
    private const int MAX_WIDTH = 10000;
    private const int MIN_WIDTH = 1;
    private const int MAX_HEIGHT = 10000;
    private const int MIN_HEIGHT = 1;

    [HttpGet("get-media-folders")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(MediaFolderDto[]))]
    public async Task<MediaFolderDto[]> GetMediaFolders()
    {
        var response =await mediaHelper.GetFoldersAsync();
        return response.ToArray();
    }

    [HttpGet("get-media-info")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ImageMediaDto))]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ImageMediaDto))]
    public IActionResult GetMediaInfo(int mediaId)
    {
        Response.Headers.CacheControl = "no-store, no-cache, must-revalidate, max-age=0";
        Response.Headers.Pragma = "no-cache";
        Response.Headers.Expires = "0";
        
        var media = mediaHelper.GetMediaById(mediaId);
        
        if (media == null) return BadRequest("Media not found");
        
        var mediaInfo = new ImageMediaDto
        {
            Id = media.Id,
            Key = media.Key,
            Name = media.Name ?? "Name missing",
            Path = mediaHelper.GetRelativePath(media),
            Width = mediaHelper.GetUmbResolution(media).Width,
            Height = mediaHelper.GetUmbResolution(media).Height,
            Extension = mediaHelper.GetUmbExtension(media),
            Size = ExtensionMethods.ToReadableFileSize(mediaHelper.GetUmbBytes(media))
        };
        
        return Ok(mediaInfo);
        
    }
    
    [HttpPost("search-media")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ImageMediaDto[]))]
    public async Task<IActionResult> SearchMedia(FilterImagesDto requestData)
    {
        IEnumerable<ImageMediaDto> images;

        if(string.IsNullOrEmpty(requestData.FolderName))  
        {
            images = await mediaHelper.GetMediaDtoByTypeAsync("Image");
        }
        else
        {
            images = await mediaHelper.GetMediaDtoByFolderName(requestData.FolderName);
        }

        if (!images.Any())
        {
            logger.LogWarning("No existing images found");
            return NoContent();
        }

        switch(requestData.SizeFilter)
        {
            case SizeFilter.BiggerThan:
                //Get all images that are bigger than provided size, ignore .svg images
                images = images.Where(x => x.Width > requestData.Width && x.Height > requestData.Height).Where(x => !x.Extension.EndsWith("svg"));
                break;
            case SizeFilter.SmallerThan:
                //Get all images that are smaller than provided size, ignore .svg images
                images = images.Where(x => x.Width < requestData.Width && x.Height < requestData.Height).Where(x => !x.Extension.EndsWith("svg"));
                break;
            case SizeFilter.AllSizes:
            default:
                //No filter
                break;
        }
        
        //If NameLike provided, filter after Name 
        if(requestData.NameLike != string.Empty)
        {
            images = images.Where((x) => x.Name.IndexOf(requestData.NameLike, StringComparison.OrdinalIgnoreCase) > -1);
        } 

        //If ExtensionLike provided, filter after extension
        if(requestData.ExtensionLike != string.Empty)
        {
            images = images.Where((x) => x.Extension.IndexOf(requestData.ExtensionLike, StringComparison.OrdinalIgnoreCase) > -1);
        }

        return Ok(images.ToArray());
    }

    [HttpPost("rename-media")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(OperationResponse))]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(OperationResponse))]
    public IActionResult RenameMedia(int mediaId, string newName)
    {
        if (string.IsNullOrEmpty(newName))
        {
            logger.LogError("New name cannot be empty");
            return BadRequest(new OperationResponse(ResponseStatus.Error,"New name cannot be empty"));
        }
        
        var imageMedia = mediaHelper.GetMediaById(mediaId);

        if (imageMedia == null)
        {
            logger.LogError("Media not found");
            return BadRequest(new OperationResponse(ResponseStatus.Error, "Media not found"));
        }

        var renameOperation = mediaHelper.RenameMedia(imageMedia, newName);

        if (renameOperation) 
            return Ok(new OperationResponse(ResponseStatus.Success, "Media renamed"));
        
        logger.LogError("Could not rename media.");
        return BadRequest(new OperationResponse(ResponseStatus.Error, "Could not rename media"));

    }

    [HttpPost("process-images")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(OperationResponse))]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(OperationResponse))]
    public async Task<IActionResult> ProcessImages([FromBody]ProcessImagesDto requestData)
    {
        var response = new OperationResponse();

        //Validate request
        var ids = requestData.Ids;
        requestData.ConvertQuality = Math.Clamp(requestData.ConvertQuality, 1, 100);
        requestData.Width = Math.Clamp(requestData.Width, MIN_WIDTH, MAX_WIDTH);
        requestData.Height = Math.Clamp(requestData.Height, MIN_HEIGHT, MAX_HEIGHT);
        
        
        if(ids.Length == 0)
        {
            logger.LogError("No media ids provided.");

            response.Message = "No media ids provided";
            response.Status = ResponseStatus.Error;
            return BadRequest(response);
        }

        if(requestData.Width < 1 || requestData.Width > 7680 || requestData.Height < 1 || requestData.Height > 4320)
        {
            logger.LogWarning("Skipping processing, requested resolution is out of bounds.");
            response.Message = "Skipping processing, requested resolution is out of bounds.";
            response.Status = ResponseStatus.Error;
            return BadRequest(response);
        }

        var resizerCounter = 0;
        var converterCounter = 0;
        var processedMedias = new ConcurrentBag<ImageMediaDto>();
        var mediasToSave = new ConcurrentBag<IMedia>();

        //Batch fetch media items first to avoid concurrent calls to IMediaService inside the loop
        var mediaItems = mediaHelper.GetMediaByIds(ids).ToList();
        
        await Parallel.ForEachAsync(mediaItems, new ParallelOptions { MaxDegreeOfParallelism = Environment.ProcessorCount }, async (imageMedia, ct) =>
        {
            var id = imageMedia.Id;
            
            try
            {
                
                var originalResolution = mediaHelper.GetUmbResolution(imageMedia);
                if(originalResolution == Size.Empty)
                {
                    logger.LogError("Could not read resolution of media with id: {id}", id);
                    response.Status = ResponseStatus.Warning; 
                    return;
                } 
                
                var preserveAspectRatio = requestData.ResizeMode == ResizeMode.FitInside;
                var targetResolution = new Size(requestData.Width,requestData.Height);
                var newResolution = imageProcessor.CalculateResolution(originalResolution, targetResolution, preserveAspectRatio);

                var mediaPath = mediaHelper.GetRelativePath(imageMedia);
                var newMediaPath = fileManager.GetFreePath(mediaPath);
                var filename = Path.GetFileName(newMediaPath);

                using var imageStream = new MemoryStream();
                var fileReadSuccess = await fileManager.ReadToStreamAsync(mediaPath, imageStream, true);
                if(!fileReadSuccess)
                {
                    logger.LogError("Image with id: {id} could not be read.", id);
                    response.Status = ResponseStatus.Warning; 
                    return;
                }

                using var image = Image.Load(imageStream);

                var workDone = false;
                var currentNewMediaPath = newMediaPath;
                var currentFilename = filename;

                //Resizing part
                if(requestData.Resize) {
                    var resizingSuccess = imageProcessor.Resize(image, newResolution);
                    if(resizingSuccess)
                    {
                        mediaHelper.SetUmbFilename(imageMedia, currentFilename);
                        mediaHelper.SetUmbResolution(imageMedia, newResolution);
                        workDone = true;
                        Interlocked.Increment(ref resizerCounter);
                    }
                    else
                    {
                        logger.LogError("Resizing image with id: {id} failed.", id);
                        response.Status = ResponseStatus.Warning;
                    }
                }

                //Converting part
                if(requestData.Convert)
                {
                    if(!mediaPath.EndsWith(".webp", StringComparison.OrdinalIgnoreCase) &&
                       !mediaPath.EndsWith(".svg", StringComparison.OrdinalIgnoreCase))
                    {
                        var convertingSuccess = imageProcessor.ConvertToWebp(image, requestData.ConvertMode, requestData.ConvertQuality);
                        
                        if(convertingSuccess)
                        {
                            currentNewMediaPath = Path.ChangeExtension(currentNewMediaPath, ".webp");
                            currentFilename = Path.GetFileName(currentNewMediaPath);
                            
                            mediaHelper.SetUmbFilename(imageMedia, currentFilename);
                            mediaHelper.SetUmbExtension(imageMedia, ".webp" );
                            workDone = true;
                            Interlocked.Increment(ref converterCounter);
                        }
                    }
                    else
                    {
                        logger.LogInformation("Image with id: {id} already in correct format, skipping converting.", id);
                        response.Status = ResponseStatus.Warning; 
                    }
                }

                if(workDone)
                {
                    try{
                        var encoder = imageProcessor.GetEncoder(currentNewMediaPath, false, requestData.ConvertQuality, requestData.ConvertMode);
                        
                        using var saveStream = new MemoryStream();
                        image.Save(saveStream, encoder);
                        var writtenToDisk = await fileManager.WriteFileAsync(currentNewMediaPath, saveStream);
                        
                        if (writtenToDisk)
                        {
                            mediaHelper.SetUmbBytes(imageMedia, saveStream.Length);
                            fileManager.DeleteFile(mediaPath);
                            mediasToSave.Add(imageMedia);
                            distributedCache.Refresh(imageMedia.Key.ToString());

                            processedMedias.Add(new ImageMediaDto
                            {
                                Id = imageMedia.Id,
                                Key = imageMedia.Key,
                                Name = imageMedia.Name ?? string.Empty,
                                Path = mediaHelper.GetRelativePath(imageMedia),
                                Extension = mediaHelper.GetUmbExtension(imageMedia),
                                Width = mediaHelper.GetUmbResolution(imageMedia).Width,
                                Height = mediaHelper.GetUmbResolution(imageMedia).Height,
                                Size = ExtensionMethods.ToReadableFileSize(saveStream.Length)
                            });
                        }
                    }
                    catch(Exception ex)
                    {
                        logger.LogError("Image with id: {id} could not be saved to file system: {Message}", id, ex.Message);
                        response.Status = ResponseStatus.Warning;
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError("Error processing image with id {id}: {Message}", id, ex.Message);
                response.Status = ResponseStatus.Warning; 
            }
        });

        if (!mediasToSave.IsEmpty)
        {
            mediaHelper.SaveMedia(mediasToSave);
        }

        //Build response message
        response.Payload = processedMedias.ToArray(); 
        
        var messages = new List<string>();
        if (resizerCounter > 0) messages.Add($"{resizerCounter} images resized");
        if (converterCounter > 0) messages.Add($"{converterCounter} images converted");
        
        response.Message = string.Join("\n", messages);
        if (string.IsNullOrEmpty(response.Message) && response.Status != ResponseStatus.Error)
        {
            response.Message = "No images were processed.";
        }

        return Ok(response);
    }

    [HttpPost("trash-media")]
    [ProducesResponseType(typeof(OperationResponse),200)]
    public OperationResponse TrashMedia(int[] ids)
    {
        var trashedCount = 0;
        var errorCount = 0;
        var trashedIds = new List<int>();  

        foreach (var id in ids)
        {
            try
            {
                
                mediaHelper.TrashMedia(id);
                trashedIds.Add(id);
                trashedCount++;
            }
            catch (Exception ex)
            {
                logger.LogError($"{ex.Message}", ex);
                errorCount++;
            }
        }

        if(trashedCount == ids.Length)//All media trashed successfully 
        {
            return new OperationResponse()
            {
                Status = ResponseStatus.Success,
                Message = $"{trashedCount} media items were moved to recycle bin.",
                Payload = trashedIds.ToArray()

            };
        }

        if(errorCount == ids.Length)//All media failed to trash
        {
            return new OperationResponse()
            {
                Status = ResponseStatus.Error,
                Message = $"{errorCount} items could not be recycled.",
                Payload = trashedIds.ToArray()
            };
        }
        //Some succeeded some failed
        return new OperationResponse()
        { 
            Status = ResponseStatus.Warning,
            Message = $"{trashedCount} media items were moved to recycle bin. {errorCount} items could not be recycled.",
            Payload = trashedIds.ToArray()
        };
        
    }

    [HttpPost("download-media")]
    [ProducesResponseType(typeof(Stream), 200, "application/zip")]
    [Produces("application/zip")]
    public async Task<IActionResult> DownloadMedia(int[] ids)
    {
        var images = mediaHelper.GetMediaByIds(ids);
        
        var zipStream = new MemoryStream();
        
        using (var zipArchive = new ZipArchive(zipStream, ZipArchiveMode.Create, true))
        {
            foreach (var imageMedia in images)
            {
                //Read physical file into a stream
                var relativePath = mediaHelper.GetRelativePath(imageMedia);
                
                using var fileStream = new MemoryStream();
                var readSuccess = await fileManager.ReadToStreamAsync(relativePath, fileStream, true);

                //Add it to the zip archive if it was successfully read 
                if (!readSuccess) continue;
                
                var zipEntry = zipArchive.CreateEntry(imageMedia.Name! + Path.GetExtension(relativePath));
                using (var entryStream = zipEntry.Open()){
                    await fileStream.CopyToAsync(entryStream);
                }
                    
                //Stop if resulting archive exceeds 300MB
                if(zipStream.Length > 314572800)
                {
                    break;
                }
            }
        } // zipArchive is disposed here, finalizing the ZIP structure

        zipStream.Position = 0;
        return File(zipStream, "application/zip", "download.zip");
    }

    [HttpPost("replace-image")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(OperationResponse))]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(OperationResponse))]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> ReplaceImage(int id, IFormFile imageFile, string? saveAs)
    {
        var response = new OperationResponse();

        if (id < 0)
        {
            response.Message = "Image id is not valid";
            response.Status = ResponseStatus.Error;
            logger.LogError("Image id is not valid.");
            return BadRequest(response);
        }
        
        var imageMedia = mediaHelper.GetMediaById(id);
        
        if (imageMedia == null)
        {
            response.Message = $"Image with id {id}  cannot be found";
            response.Status = ResponseStatus.Error;
            logger.LogError("Image with id {id} cannot be found.", id);
            return BadRequest(response);
        }
        
        var oldFilePath = mediaHelper.GetRelativePath(imageMedia);
        var newFilePath = fileManager.GetFreePath(oldFilePath, Path.GetExtension(oldFilePath));
        
        var checkFileExtensionString = saveAs == null ?  oldFilePath : "dummyName." + saveAs.Replace(".", "");

        var fileExtension = Path.GetExtension(checkFileExtensionString);
        newFilePath = Path.ChangeExtension(newFilePath, fileExtension);
        var encoder = imageProcessor.GetEncoder(checkFileExtensionString);


        using var oldImageStream = new MemoryStream();
        var readSuccess = await fileManager.ReadToStreamAsync(oldFilePath, oldImageStream, true);
        if (!readSuccess)
        {
            response.Message = $"Image with id {id}  cannot be read";
            response.Status = ResponseStatus.Error;
            logger.LogError("Image with id {id} cannot be read.", id);
            return BadRequest(response);
        }
        
        using var oldImage = Image.Load(oldImageStream);
        using var fileStream = imageFile.OpenReadStream();
        using var newImage = Image.Load(fileStream);
        
        //Copy metadata from old image and change resolution values
        metadataProcessor.CopyMetadata(oldImage, newImage);
        metadataProcessor.SetResolutionTags(newImage, newImage.Width, newImage.Height);
        
        using var converted = new MemoryStream();
        
        newImage.Save(converted, encoder);
        converted.Position = 0;
        
        var writeSuccess = await fileManager.WriteFileAsync(newFilePath, converted);

        if (writeSuccess)
        {
            mediaHelper.SetUmbFilename(imageMedia, newFilePath);
            mediaHelper.SetUmbResolution(imageMedia, new Size(newImage.Width, newImage.Height));
            mediaHelper.SetUmbBytes(imageMedia,converted.Length);
            mediaHelper.SaveMedia(imageMedia);
            fileManager.DeleteFile(oldFilePath);
        }

        response.Message = $"Replaced image with id {id}";
        response.Status = ResponseStatus.Success;
        return Ok(response);

    }

    [HttpGet("get-metadata")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ImageMetadataDto))]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public async Task<IActionResult> GetMetadata(int id)
    {
        
        var imageMedia = mediaHelper.GetMediaById(id);
        if (imageMedia == null)
        {
            logger.LogError("Image with id {id} cannot be found.", id);
            return BadRequest();
        }

        try
        {
            var filepath = mediaHelper.GetRelativePath(imageMedia);

            using var imageStream = new MemoryStream();
            var readSuccess = await fileManager.ReadToStreamAsync(filepath, imageStream, true);

            if (!readSuccess)
            {
                logger.LogError("Could not read image with id {id}.", id);
                return BadRequest();
            }

            var imgMetadata = metadataProcessor.ReadMetadata(imageStream);
            var metadataDto = new ImageMetadataDto
            {
                VerticalResolution = imgMetadata.VerticalResolution,
                HorizontalResolution = imgMetadata.HorizontalResolution,
                DecodedImageFormat = imgMetadata.DecodedImageFormat?.ToString() ?? string.Empty,
                ResolutionUnits = imgMetadata.ResolutionUnits.ToString()
            };

            // Parsing EXIF Profile 
            if (imgMetadata.ExifProfile != null)
            {
                foreach (var exifValue in imgMetadata.ExifProfile.Values)   
                {
                    metadataDto.ExifTags.Add(metadataProcessor.ParseIExifValue(exifValue));    
                }                
            }
            //IPTC Profile
            if (imgMetadata.IptcProfile != null)
            {
                foreach (var iptcValue in imgMetadata.IptcProfile.Values)
                {
                    metadataDto.IptcTags.Add(new ParsedTag(){ Tag = iptcValue.Tag.ToString(), Value = iptcValue.Value });
                }
            }

            //Add XMP as a string
            if (imgMetadata.XmpProfile != null)
            {
                metadataDto.XmpProfile = imgMetadata.XmpProfile.GetDocument()?.ToString() ?? "XMP profile not present.";
            }
            

            return Ok(metadataDto);
        }
        catch (Exception ex)
        {
            logger.LogError(ex.Message, ex);
            return BadRequest(ex.Message);
        }
    }
    
}








