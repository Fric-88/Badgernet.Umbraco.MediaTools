using Asp.Versioning;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Umbraco.Extensions;
using Badgernet.Umbraco.MediaTools.Core.Models;
using System.IO.Compression;
using Badgernet.Umbraco.MediaTools.Core.Services.FileManager;
using Badgernet.Umbraco.MediaTools.Core.Services.ImageProcessing;
using Size = SixLabors.ImageSharp.Size;
using Badgernet.Umbraco.MediaTools.Core.Helpers;
using Umbraco.Cms.Core.Models;
using Org.BouncyCastle.Crypto;
namespace Badgernet.Umbraco.MediaTools.Core.Controllers;

[ApiVersion("1.0")]
[ApiExplorerSettings(GroupName = "mediatools")]
public class GalleryController(ILogger<SettingsController> logger, IMediaHelper mediaHelper, IFileManager fileManager, IImageProcessor imageProcessor) : ControllerBase
{
    private readonly IMediaHelper _mediaHelper = mediaHelper;
    private readonly IFileManager _fileManager = fileManager;
    private readonly IImageProcessor _imageProcessor = imageProcessor;
    private readonly ILogger<SettingsController> _logger = logger;


    [HttpGet("gallery/get-info")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(GalleryInfoDto))]
    public GalleryInfoDto GetGalleryInfo()
    {
        var response = new GalleryInfoDto();
        var allMedia = _mediaHelper.GetAllMedia();

        
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

    [HttpGet("gallery/list-folders")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string[]))]
    public string[] ListFolders()
    {
        var response = _mediaHelper.ListFolders();
        return response.ToArray();
    }


    [HttpPost("gallery/filter")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ImageMediaDto[]))]
    public IActionResult FilterGallery(FilterImagesDto requestData)
    {
        IEnumerable<ImageMediaDto> images;

        if(string.IsNullOrEmpty(requestData.FolderName))  
        {
            images = _mediaHelper.GetMediaDtoByType("Image");
        }
        else
        {
            images = _mediaHelper.GetMediaDtoByFolderName(requestData.FolderName);
        }

        if (images == null)
        {
            _logger.LogWarning("No existing images found");
            return NoContent();
        }

        switch(requestData.SizeFilter)
        {
            case SizeFilter.AllSizes:
                //Do nothing
                break;
            case SizeFilter.BiggerThan:
                //Get all images that are bigger than provided size, ignore .svg images
                images = images.Where(x => x.Width > requestData.Width || x.Height > requestData.Height).Where(x => !x.Extension.EndsWith("svg"));
                break;
            case SizeFilter.SmallerThan:
                //Get all images that are smaller than provided size, ignore .svg images
                images = images.Where(x => x.Width < requestData.Width || x.Height < requestData.Height).Where(x => !x.Extension.EndsWith("svg"));
                break;
        }
        
        //If NameLike provided, filter after Name 
        if(requestData.NameLike != string.Empty && requestData.NameLike != null)
        {
            images = images.Where((x) => x.Name.IndexOf(requestData.NameLike, StringComparison.OrdinalIgnoreCase) > -1);
        } 

        //If ExtensionLike provided, filter after extension
        if(requestData.ExtensionLike != string.Empty && requestData.ExtensionLike != null)
        {
            images = images.Where((x) => x.Extension.IndexOf(requestData.ExtensionLike, StringComparison.OrdinalIgnoreCase) > -1);
        }

        return Ok(images.ToArray());
    }



    [HttpPost("gallery/process")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ImageProcessingResponse))]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ImageProcessingResponse))]
    public IActionResult ProcessImages(ProcessImagesDto requestData)
    {
        var response = new ImageProcessingResponse();

        //Validate request
        var ids = requestData.Ids;
        if(ids == null || ids.Length == 0)
        {
            _logger.LogError("No media ids provided.");

            response.Message = "No media ids provided";
            response.Status = ResponseStatus.Error;
            return BadRequest(response);
        }

        if(requestData.Width < 1 || requestData.Width > 7680 || requestData.Height < 1 || requestData.Height > 4320)
        {
            _logger.LogWarning("Skipping processing, requested resolution is out of bounds.");
            response.Message = "Skipping processing, requested resolution is out of bounds.";
            response.Status = ResponseStatus.Error;
            return BadRequest(response);
        }

        //Clamp convertQuality to 1 -> 100
        if(requestData.ConvertQuality > 100) requestData.ConvertQuality = 100;
        if(requestData.ConvertQuality < 1) requestData.ConvertQuality = 1; 


        var converterCounter = 0;
        var resizerCounter = 0;

        foreach(var id in ids)
        {
            try
            {
                var imageMedia = _mediaHelper.GetMediaById(id);

                if(imageMedia == null)
                {
                    _logger.LogError("Could not find media with id: {id}", id);
                    response.Status = ResponseStatus.Warning; //Indicates that log messages were generated
                    continue;
                }

                var originalResolution = _mediaHelper.GetUmbResolution(imageMedia);
                if(originalResolution == Size.Empty)
                {
                    _logger.LogError("Could not read resolution of media with id: {id}", id);
                    response.Status = ResponseStatus.Warning; //Indicates that log messages were generated
                    continue;
                } 
                
                var preserveAspectRatio = requestData.ResizeMode == ResizeMode.FitInside;
                var targetResolution = new Size(requestData.Width,requestData.Height);
                var newResolution =_imageProcessor.CalculateResolution(originalResolution, targetResolution, preserveAspectRatio);

                var mediaPath = _mediaHelper.GetRelativePath(imageMedia);
                var newMediaPath = _fileManager.GetFreePath(mediaPath);
                var filename = Path.GetFileName(newMediaPath);

                //READ FILE INTO A STREAM THAT NEEDS TO BE MANUALLY DISPOSED
                var imageStream = _fileManager.ReadFile(mediaPath);

                if(imageStream == null)
                {
                    _logger.LogError("Image with id: {id} could not be read.", id);
                    response.Status = ResponseStatus.Warning; //Indicates that log messages were generated
                    continue;
                }

                //Image will be saved under this path if processing succeeds
                var finalSavingPath = string.Empty;

                //Resizing part
                if(requestData.Resize) {
                    using var resizedImageStream = _imageProcessor.Resize(imageStream,newResolution);
                    if(resizedImageStream != null)//If resizing succeeded
                    {
                        //Set properties
                        _mediaHelper.SetUmbFilename(imageMedia, filename);
                        _mediaHelper.SetUmbResolution(imageMedia, newResolution);

                        //Delete old image File
                        _fileManager.DeleteFile(mediaPath);

                        //Reassign path
                        mediaPath = newMediaPath;

                        //Copy resized image to image stream
                        imageStream.ClearAndReassign(resizedImageStream);

                        finalSavingPath = mediaPath;

                        resizerCounter++;
                        //SUCCESS
                    }
                    else
                    {
                        _logger.LogError("Resizing image with id: {id} failed.", id);
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

                        using (var convertedImage = _imageProcessor.ConvertToWebp(imageStream, convertMode, convertQuality))
                        {
                            if(convertedImage != null)//If converting succeeded
                            {
                                _mediaHelper.SetUmbFilename(imageMedia, filename);
                                _mediaHelper.SetUmbExtension(imageMedia, ".webp" );
                                _mediaHelper.SetUmbBytes(imageMedia, convertedImage.Length);

                                //Delete original image (before extension change)
                                _fileManager.DeleteFile(mediaPath);

                                //Reassign image stream
                                imageStream.ClearAndReassign(convertedImage);

                                finalSavingPath = newMediaPath;

                                converterCounter++;
                                //SUCCESS
                            }
                        }
                    }
                    else
                    {
                        _logger.LogInformation("Image with id: {id} already in correct format, skipping converting.", id);
                        response.Status = ResponseStatus.Warning; //Indicates that log messages were generated
                    }
                }

                //If finalSavingPath is empty, there was no work done
                if(finalSavingPath != string.Empty)
                {
                    var writtenToDisk = false;
                    try{
                        //Write image stream to file system  
                        _fileManager.WriteFile(finalSavingPath,imageStream);
                        writtenToDisk = true;
                    }
                    catch
                    {
                        _logger.LogError("Image with id: {id} could not be saved to file system.", id);
                    }

                    if(writtenToDisk)
                        _mediaHelper.SaveMedia(imageMedia);

                }

                //Dispose the stream
                imageStream.Dispose();
                imageStream  = null;

                //SEND SUCCESS NOTIFICATION

            }
            catch (Exception ex)
            {
                _logger.LogError("Error processing image: {Message}", ex.Message);
                response.Status = ResponseStatus.Warning; //Indicates that log messages were generated
                continue;
            }
            
        }

        //Build response message
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

    [HttpPost("gallery/trash")]
    [ProducesResponseType(typeof(RecycleMediaResponse),200)]
    public RecycleMediaResponse RecycleMedia(int[] ids)
    {
        int trashedCount = 0;
        int errorCount = 0;
        var trashedIds = new List<int>();  

        foreach (int id in ids)
        {
            try
            {
                _mediaHelper.TrashMedia(id);
                trashedIds.Add(id);
                trashedCount++;
            }
            catch (Exception ex)
            {
                _logger.LogError($"{ex.Message}", ex);
                errorCount++;
            }
        }

        if(trashedCount == ids.Length)//All media trashed successfully 
        {
            return new RecycleMediaResponse
            {
                Status = ResponseStatus.Success,
                Message = $"{trashedCount} media items were moved to recycle bin.",
                Payload = trashedIds.ToArray()

            };
        }
        else if(errorCount == ids.Length)//All media failed to trash
        {
            return new RecycleMediaResponse
            {
                Status = ResponseStatus.Error,
                Message = $"{errorCount} items could not be recycled.",
                Payload = trashedIds.ToArray()
            };
        }
        else//Some succeeded some failed
        {
            return new RecycleMediaResponse
            { 
                Status = ResponseStatus.Warning,
                Message = $"{trashedCount} media items were moved to recycle bin. {errorCount} items could not be recycled.",
                Payload = trashedIds.ToArray()
            };
        }
    }

    [HttpPost("gallery/download")]
    [ProducesResponseType(typeof(Stream), 200, "application/zip")]
    [Produces("application/zip")]
    public IActionResult DownloadMedia(int[] ids)
    {
        var images = _mediaHelper.GetMediaByIds(ids);
        var zipStream = new MemoryStream();
        using (var zipArchive = new ZipArchive(zipStream, ZipArchiveMode.Create, true))
        {
            foreach (var imageMedia in images)
            {
                //Read physical file into a stream
                var relativePath = _mediaHelper.GetRelativePath(imageMedia);
                using var fileStream = _fileManager.ReadFile(relativePath);

                //Add it to the zip archive if it was successfully read 
                if(fileStream != null){
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
        }

        zipStream.Position = 0;
        return File(zipStream, "application/zip", "download.zip");
    }


}







