﻿using Microsoft.Extensions.Logging;
using SixLabors.ImageSharp;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Scoping;
using Size = SixLabors.ImageSharp.Size;
using File = System.IO.File;
using System.Text.Json.Nodes;
using Badgernet.Umbraco.MediaTools.Core.Services.Settings;
using Umbraco.Cms.Core.Security;
using Badgernet.Umbraco.MediaTools.Core.Services.ImageProcessing;
using Badgernet.Umbraco.MediaTools.Core.Services.FileManager;

namespace Badgernet.Umbraco.MediaTools.Core;


public class MediaToolsUploadHandler : INotificationHandler<MediaSavingNotification>
    {
        private readonly ISettingsService _settingsService;
        private readonly IMediaHelper _mediaHelper;
        private readonly IImageProcessor _imageProcessor;
        private readonly IFileManager _fileManager;
        private readonly ICoreScopeProvider _scopeProvider;
        private readonly ILogger<MediaToolsUploadHandler> _logger;
        private readonly IBackOfficeSecurityAccessor _backOfficeSecurity; 

        public MediaToolsUploadHandler
        (
            ISettingsService settingsService,
            IMediaHelper mediaHelper,
            IImageProcessor imageProcessor,
            IFileManager fileManager,
            ICoreScopeProvider scopeProvider,
            ILogger<MediaToolsUploadHandler> logger, 
            IBackOfficeSecurityAccessor backOfficeSecurity)
        {
            _settingsService = settingsService;
            _mediaHelper = mediaHelper;
            _imageProcessor = imageProcessor;
            _fileManager = fileManager;
            _scopeProvider = scopeProvider;
            _logger = logger;
            _backOfficeSecurity = backOfficeSecurity ?? throw new System.ArgumentNullException(nameof(backOfficeSecurity));
        }



        public void Handle(MediaSavingNotification notification)
        {
            //Try to get current current backoffice user, bail if none found
            if (_backOfficeSecurity.BackOfficeSecurity == null) return;
            var user = _backOfficeSecurity.BackOfficeSecurity.CurrentUser;
            if(user == null) return;

            //Get user settings from a file
            var userKey = user.Key.ToString();
            var settings = _settingsService.GetUserSettings(userKey);

            //Read settings object 
            bool resizingEnabled = settings.ResizerEnabled;
            bool convertingEnabled = settings.ConverterEnabled;
            int convertQuality = settings.ConvertQuality;
            bool ignoreAspectRatio = settings.IgnoreAspectRatio;
            int targetWidth = settings.TargetWidth;
            int targetHeight = settings.TargetHeight;
            bool keepOriginals = settings.KeepOriginals;
            ConvertMode convertMode = settings.ConvertMode;
            string ignoreKeyword = settings.IgnoreKeyword;

            //Prevent Options being out of bounds 
            if (targetHeight < 1) targetHeight = 1;
            if (targetWidth < 1) targetWidth = 1;
            if (convertQuality < 1) convertQuality = 1;
            if (convertQuality > 100) convertQuality = 100;


            foreach(var media in notification.SavedEntities)
            {
                if (media == null) continue;

                //Skip if not an image
                if (string.IsNullOrEmpty(media.ContentType.Alias) || !media.ContentType.Alias.Equals("image", StringComparison.CurrentCultureIgnoreCase)) continue;  
                
                //Skip any not-new images
                if (media.Id > 0) continue;
                
                string originalFilepath = _mediaHelper.GetRelativePath(media);
                string alternativeFilepath = _fileManager.GetFreePath(originalFilepath);
                Size originalSize = new();

                //Skip if paths not good
                if (string.IsNullOrEmpty(originalFilepath) || string.IsNullOrEmpty(alternativeFilepath)) continue;

                //Skip if image name contains "ignoreKeyword"
                if (Path.GetFileNameWithoutExtension(originalFilepath).Contains(ignoreKeyword,StringComparison.CurrentCultureIgnoreCase)) 
                {
                    // alternativeFilepath = originalFilepath.Replace(ignoreKeyword, string.Empty);
                    // File.Move(originalFilepath, alternativeFilepath, true);

                    // var jsonString = media.GetValue<string>("umbracoFile");

                    // if (jsonString == null) continue;

                    // var propNode = JsonNode.Parse((string)jsonString);
                    // string? path = propNode!["src"]!.GetValue<string>();
                    // path = path.Replace(ignoreKeyword, string.Empty);

                    // propNode["src"] = path;

                    // media.SetValue("umbracoFile", propNode.ToJsonString());
                    // if(media.Name != null)
                    // {
                    //     media.Name = media.Name.Replace(ignoreKeyword, string.Empty,StringComparison.CurrentCultureIgnoreCase);
                    // }

                    continue;
                }
                
                using var scope = _scopeProvider.CreateCoreScope(autoComplete: true);
                using var _ = scope.Notifications.Suppress();

                //Read resolution      
                try
                {
                    originalSize.Width = int.Parse(media.GetValue<string>("umbracoWidth")!);
                    originalSize.Height = int.Parse(media.GetValue<string>("umbracoHeight")!);
                }
                catch
                {
                    continue; //Skip if resolution cannot be parsed 
                }

                //Override appsettings targetSize if provided in image filename
                var parsedTargetSize = ParseSizeFromFilename(Path.GetFileNameWithoutExtension(originalFilepath));
                if(parsedTargetSize != null)
                {
                    targetWidth = parsedTargetSize.Value.Width;
                    targetHeight = parsedTargetSize.Value.Height;
                }

                //READ FILE INTO A STREAM THAT NEEDS TO BE MANUALLY DISPOSED
                var imageStream = _fileManager.ReadFile(originalFilepath);
                var finalSavingPath = string.Empty;

                //Skip if image can not be read 
                if(imageStream == null) 
                {
                    _logger.LogError("Could not read file: {originalFilepath}", originalFilepath);
                    continue;
                }

                //Image resizing part
                var wasResizedFlag = false;
                var needsDownsizing = originalSize.Width > targetWidth || originalSize.Height > targetHeight;
                if(needsDownsizing && resizingEnabled)
                {
                    var targetSize = new Size(targetWidth, targetHeight);
                    var newSize = _imageProcessor.CalculateResolution(originalSize, targetSize);

                    using var convertedImageStream = _imageProcessor.Resize(imageStream, newSize);

                    if(convertedImageStream == null){
                        _logger.LogError("Could not convert image {originalFilepath}",originalFilepath);
                        imageStream.Dispose();
                        continue;
                    }

                    //Calculate file size difference
                    var bytesSaved = _fileManager.CompareFileSize(originalFilepath, alternativeFilepath);
                    // settings.BytesSavedResizing += bytesSaved;
                    // settings.ResizerCounter++;

                    //Adjust media properties
                    var newFilename = Path.GetFileName(alternativeFilepath);
                    _mediaHelper.SetUmbFilename(media, newFilename);
                    _mediaHelper.SetUmbResolution(media, newSize);

                    //Save new file size
                    _mediaHelper.SetUmbBytes(media,convertedImageStream.Length);
                    wasResizedFlag = true; 

                    //Reassign imageStream
                    imageStream.Position = 0;
                    imageStream.SetLength(0);
                    convertedImageStream.CopyTo(imageStream);
                    imageStream.Position = 0;
                    
                    //Reassign where to save the image 
                    finalSavingPath = alternativeFilepath;

                }

                //Image converting part
                var wasConvertedFlag = false;
                if(convertingEnabled && !originalFilepath.EndsWith(".webp", StringComparison.OrdinalIgnoreCase))
                {
                    var sourceFilePath = string.Empty;
                    var pathWithOldExtension = string.Empty;

                    //Assign sourcePath depending on if image was resized previously
                    sourceFilePath = wasResizedFlag ? alternativeFilepath : originalFilepath;

                    pathWithOldExtension = alternativeFilepath;
                    alternativeFilepath = Path.ChangeExtension(alternativeFilepath, ".webp");

                    using var convertedImageStream = _imageProcessor.ConvertToWebp(imageStream, convertMode, convertQuality);

                    if(convertedImageStream != null)
                    {
                        //Calculate size difference after converting
                        var bytesSaved = imageStream.Length - convertedImageStream.Length;
                        // settings.BytesSavedConverting += bytesSaved;
                        // settings.ConverterCounter++;

                        _fileManager.DeleteFile(pathWithOldExtension);

                        //Adjust medias src property
                        if(!wasResizedFlag)
                        {
                            var newFilename = Path.GetFileNameWithoutExtension(alternativeFilepath);

                            _mediaHelper.SetUmbFilename(media, newFilename);
                            _mediaHelper.SetUmbExtension(media, ".webp");
                        }
                        else
                        {
                            _mediaHelper.SetUmbExtension(media, ".webp");
                        }

                        media.SetValue("umbracoBytes", convertedImageStream.Length);

                        //Reassign where to save the image and the image itself
                        finalSavingPath = alternativeFilepath;
                        imageStream.Position = 0;
                        imageStream.SetLength(0);
                        convertedImageStream.CopyTo(imageStream);
                        imageStream.Position = 0;

                        wasConvertedFlag = true;
                    }
                    
                }

                //Finally writing modified image back to file
                if(finalSavingPath != string.Empty)
                {
                    _fileManager.WriteFile(finalSavingPath, imageStream);
                    imageStream.Dispose();
                }


                //Deleting original files
                if (!keepOriginals && wasResizedFlag || wasConvertedFlag)
                {
                    _fileManager.DeleteFile(originalFilepath);
                }
            }

            //Write settings to file to preserve saved bytes values   
            _settingsService.SaveUserSettings(userKey, settings);
        }

        private Size? ParseSizeFromFilename(string fileName)
        {
            if (!fileName.StartsWith("wparesize_")) return null;
            if (fileName.Length < 11) return null;

            try
            {
                var size = new Size(int.MaxValue, int.MaxValue);

                var buffer = string.Empty;
                for (var i = 10; i < fileName.Length; i++)
                {
                    if (fileName[i] == '_')
                    {
                        if (size.Width == int.MaxValue)
                        {
                            size.Width = int.Parse(buffer);
                            buffer = string.Empty;
                        }
                        else
                        {
                            size.Height = int.Parse(buffer);
                            return size;
                        }
                    }
                    else
                    {
                        buffer += fileName[i];
                    }
                }
                return null;
            }
            catch (Exception e)
            {
                _logger.LogError("Error parsing resolution from a filename: {Message}", e.Message);
                return null;
            }
        }
    }

