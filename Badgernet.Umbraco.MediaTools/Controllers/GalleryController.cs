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


namespace Badgernet.Umbraco.MediaTools.Controllers;

[ApiVersion("1.0")]
[ApiExplorerSettings(GroupName = "mediatools")]
[Route("gallery")]
public class GalleryController(ILogger<SettingsController> logger, IMediaHelper mediaHelper, IFileManager fileManager, IImageProcessor imageProcessor, IMetadataProcessor metadataProcessor) : ControllerBase
{

    [HttpGet("get-info")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(GalleryInfoDto))]
    public GalleryInfoDto GetGalleryInfo()
    {
        var response = new GalleryInfoDto();
        var allMedia = mediaHelper.GetAllMedia();

        response.FolderCount = allMedia.OfTypes("Folder").Count(); //Count Folders 
        response.MediaCount = allMedia.Count() - response.FolderCount; //The rest should be media files

        var extensionCounts = allMedia
            .Where(media => media.HasValue("UmbracoExtension"))
            .GroupBy(media => media.Value("UmbracoExtension")?.ToString() ?? string.Empty)
            .Select(group => new KeyValuePair<string, int>(group.Key, group.Count()))
            .ToList();

        response.CountByExtension = extensionCounts;

        return response;
    }

    [HttpGet("list-folders")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string[]))]
    public string[] ListFolders()
    {
        var response = mediaHelper.ListFolders();
        return response.ToArray();
    }

    [HttpGet("mediaInfo")]
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
            Name = media.Name ?? "Name missing",
            Path = mediaHelper.GetRelativePath(media),
            Width = mediaHelper.GetUmbResolution(media).Width,
            Height = mediaHelper.GetUmbResolution(media).Height,
            Extension = mediaHelper.GetUmbExtension(media),
            Size = ExtensionMethods.ToReadableFileSize(mediaHelper.GetUmbBytes(media))
        };
        
        return Ok(mediaInfo);
        
    }
    
    [HttpPost("filter")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ImageMediaDto[]))]
    public IActionResult FilterGallery(FilterImagesDto requestData)
    {
        IEnumerable<ImageMediaDto> images;

        if(string.IsNullOrEmpty(requestData.FolderName))  
        {
            images = mediaHelper.GetMediaDtoByType("Image");
        }
        else
        {
            images = mediaHelper.GetMediaDtoByFolderName(requestData.FolderName);
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
                images = images.Where(x => x.Width > requestData.Width || x.Height > requestData.Height).Where(x => !x.Extension.EndsWith("svg"));
                break;
            case SizeFilter.SmallerThan:
                //Get all images that are smaller than provided size, ignore .svg images
                images = images.Where(x => x.Width < requestData.Width || x.Height < requestData.Height).Where(x => !x.Extension.EndsWith("svg"));
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

    [HttpPost("rename")]
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

    [HttpPost("process")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(OperationResponse))]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(OperationResponse))]
    public IActionResult ProcessImages(ProcessImagesDto requestData)
    {
        var response = new OperationResponse();

        //Validate request
        var ids = requestData.Ids;
        
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

        //Clamp convertQuality to 1 -> 100
        Math.Clamp(requestData.ConvertQuality, 1, 100);


        var converterCounter = 0;
        var resizerCounter = 0;
        var processedMedias = new List<ImageMediaDto>();
        

        foreach(var id in ids)
        {
            try
            {
                var imageMedia = mediaHelper.GetMediaById(id);

                if(imageMedia == null)
                {
                    logger.LogError("Could not find media with id: {id}", id);
                    response.Status = ResponseStatus.Warning; //Indicates that log messages were generated
                    continue;
                }

                var originalResolution = mediaHelper.GetUmbResolution(imageMedia);
                if(originalResolution == Size.Empty)
                {
                    logger.LogError("Could not read resolution of media with id: {id}", id);
                    response.Status = ResponseStatus.Warning; //Indicates that log messages were generated
                    continue;
                } 
                
                var preserveAspectRatio = requestData.ResizeMode == ResizeMode.FitInside;
                var targetResolution = new Size(requestData.Width,requestData.Height);
                var newResolution =imageProcessor.CalculateResolution(originalResolution, targetResolution, preserveAspectRatio);

                var mediaPath = mediaHelper.GetRelativePath(imageMedia);
                var newMediaPath = fileManager.GetFreePath(mediaPath);
                var filename = Path.GetFileName(newMediaPath);

                //READ FILE INTO A STREAM THAT NEEDS TO BE MANUALLY DISPOSED
                
                var imgStream = new MemoryStream();
                imgStream = fileManager.TryReadFile(mediaPath);
                if(imgStream == null)
                {
                    logger.LogError("Image with id: {id} could not be read.", id);
                    response.Status = ResponseStatus.Warning; //Indicates that log messages were generated
                    continue;
                }

                using var image = Image.Load(imgStream);
                imgStream.Dispose();

                //Image will be saved under this path if processing succeeds
                var finalSavingPath = string.Empty;

                //Resizing part
                if(requestData.Resize) {
                    var resizingSuccess = imageProcessor.Resize(image,newResolution);
                    if(resizingSuccess)//If resizing succeeded
                    {
                        //Set properties
                        mediaHelper.SetUmbFilename(imageMedia, filename);
                        mediaHelper.SetUmbResolution(imageMedia, newResolution);

                        //Delete old image File
                        fileManager.DeleteFile(mediaPath);

                        //Reassign path
                        mediaPath = newMediaPath;
                        finalSavingPath = mediaPath;
                        resizerCounter++;
                        //SUCCESS
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
                    var convertMode = requestData.ConvertMode;   
                    var convertQuality = requestData.ConvertQuality; 

                    if(!mediaPath.EndsWith(".webp", StringComparison.OrdinalIgnoreCase) &&
                       !mediaPath.EndsWith(".svg", StringComparison.OrdinalIgnoreCase))
                    {
                        newMediaPath = Path.ChangeExtension(newMediaPath, ".webp");

                        var convertingSuccess = imageProcessor.ConvertToWebp(image, convertMode, convertQuality);
                        
                        if(convertingSuccess)//If converting succeeded
                        {
                            mediaHelper.SetUmbFilename(imageMedia, filename);
                            mediaHelper.SetUmbExtension(imageMedia, ".webp" );

                            //Delete original image (before extension change)
                            fileManager.DeleteFile(mediaPath);
                            finalSavingPath = newMediaPath;
                            converterCounter++;
                            //SUCCESS
                        }
                        
                    }
                    else
                    {
                        logger.LogInformation("Image with id: {id} already in correct format, skipping converting.", id);
                        response.Status = ResponseStatus.Warning; //Indicates that log messages were generated
                    }
                }

                //If finalSavingPath is empty, there was no work done
                if(finalSavingPath != string.Empty)
                {
                    var writtenToDisk = false;
                    
                    try{
                        
                        var encoder = imageProcessor.GetEncoder(finalSavingPath);
                        
                        //Write image stream to file system  
                        using (var imageStream = new MemoryStream())
                        {
                            image.Save(imageStream, encoder);
                            fileManager.WriteFile(finalSavingPath, imageStream);
                            mediaHelper.SetUmbBytes(imageMedia, imageStream.Length);
                        }

                        writtenToDisk = true;
                    }
                    catch(Exception ex)
                    {
                        logger.LogError("Image with id: {id} could not be saved to file system.", id);
                        logger.LogError(ex.Message);
                    }

                    if (writtenToDisk)
                    {
                        //Save processed media back to database
                        mediaHelper.SaveMedia(imageMedia);

                        try
                        {
                            var imgResolution = mediaHelper.GetUmbResolution(imageMedia);
                            
                            processedMedias.Add(new ImageMediaDto
                            {
                                Id = imageMedia.Id,
                                Name = imageMedia.Name ?? string.Empty,
                                Path = mediaHelper.GetRelativePath(imageMedia),
                                Extension = mediaHelper.GetUmbExtension(imageMedia),
                                Width = imgResolution.Width,
                                Height = imgResolution.Height,
                                Size = ExtensionMethods.ToReadableFileSize(mediaHelper.GetUmbBytes(imageMedia))
                            });

                        }
                        catch
                        {
                            //Ignore
                        }
                    }
                        
                }
            }
            catch (Exception ex)
            {
                logger.LogError("Error processing image: {Message}", ex.Message);
                response.Status = ResponseStatus.Warning; //Indicates that log messages were generated
            }
            
        }

        //Build response message
        response.Payload = processedMedias; 
        
        if(requestData.Resize && requestData.Convert)
        {
            response.Message = $"{resizerCounter} images resized \n\n {converterCounter} images converted.";
        }
        else if(requestData.Resize)
        {
            response.Message += $"{resizerCounter} images resized.";
        }
        else if(requestData.Convert)
        {
            response.Message += $"{converterCounter} images converted.";
        }

        return Ok(response);
    }

    [HttpPost("trash")]
    [ProducesResponseType(typeof(OperationResponse),200)]
    public OperationResponse RecycleMedia(int[] ids)
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

    [HttpPost("download")]
    [ProducesResponseType(typeof(Stream), 200, "application/zip")]
    [Produces("application/zip")]
    public IActionResult DownloadMedia(int[] ids)
    {
        var images = mediaHelper.GetMediaByIds(ids);
        var zipStream = new MemoryStream();
        using (var zipArchive = new ZipArchive(zipStream, ZipArchiveMode.Create, true))
        {
            foreach (var imageMedia in images)
            {
                //Read physical file into a stream
                var relativePath = mediaHelper.GetRelativePath(imageMedia);
                using var fileStream = fileManager.TryReadFile(relativePath);

                //Add it to the zip archive if it was successfully read 
                if (fileStream == null) continue;
                
                var zipEntry = zipArchive.CreateEntry(imageMedia.Name! + Path.GetExtension(relativePath));
                using (var entryStream = zipEntry.Open()){
                    fileStream.CopyTo(entryStream);
                }
                    
                //Stop if resulting archive exceeds 300MB
                if(zipStream.Length > 314572800)
                {
                    break;
                }
            }
        }

        zipStream.Position = 0;
        return File(zipStream, "application/zip", "download.zip");
    }

    [HttpPost("replace")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(OperationResponse))]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(OperationResponse))]
    [Consumes("multipart/form-data")]
    public IActionResult ReplaceImage(int id, IFormFile imageFile, string? saveAs)
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
        
        
        using var oldImageStream =  fileManager.TryReadFile(oldFilePath);
        if (oldImageStream == null)
        {
            response.Message = $"Image with id {id}  cannot be read";
            response.Status = ResponseStatus.Error;
            logger.LogError("Image with id {id} cannot be read.", id);
            return BadRequest(response);
        }
        
        using var oldImage = Image.Load(oldImageStream);
        using var fileStream = imageFile.OpenReadStream();
        using var newImage =Image.Load(fileStream);
        
        //Copy metadata from old image and change resolution values
        metadataProcessor.CopyMetadata(oldImage, newImage);
        metadataProcessor.SetResolutionTags(newImage, newImage.Width, newImage.Height);
        
        using var converted = new MemoryStream();
        
        newImage.Save(converted, encoder);
        converted.Position = 0;
        
        var writeSuccess = fileManager.WriteFile(newFilePath, converted);

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

    [HttpGet("getMetadata")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ImageMetadataDto))]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public IActionResult GetMetadata(int id)
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
            using var imageStream = fileManager.TryReadFile(filepath);

            if (imageStream == null)
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








