﻿using System;
using Badgernet.Umbraco.MediaTools.Helpers;
using Badgernet.Umbraco.MediaTools.Models;
using Badgernet.Umbraco.MediaTools.Services.FileManager;
using Badgernet.Umbraco.MediaTools.Services.ImageProcessing;
using Badgernet.Umbraco.MediaTools.Services.ImageProcessing.Metadata;
using Badgernet.Umbraco.MediaTools.Services.Settings;
using Microsoft.Extensions.Logging;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Scoping;
using Umbraco.Cms.Core.Security;
using MemoryStream = System.IO.MemoryStream;
using Size = SixLabors.ImageSharp.Size;

namespace Badgernet.Umbraco.MediaTools.Handlers;


public class MediaToolsUploadHandler : INotificationHandler<MediaSavingNotification>
    {
        private const int MAX_WIDTH = 10000;
        private const int MIN_WIDTH = 1;
        private const int MAX_HEIGHT = 10000;
        private const int MIN_HEIGHT = 1;
        
        private readonly ISettingsService _settingsService;
        private readonly IMediaHelper _mediaHelper;
        private readonly IImageProcessor _imageProcessor;
        private readonly IMetadataProcessor _metadataProcessor;
        private readonly IFileManager _fileManager;
        private readonly ICoreScopeProvider _scopeProvider;
        private readonly ILogger<MediaToolsUploadHandler> _logger;
        private readonly IBackOfficeSecurityAccessor _backOfficeSecurity; 

        public MediaToolsUploadHandler
        (
            ISettingsService settingsService,
            IMediaHelper mediaHelper,
            IImageProcessor imageProcessor,
            IMetadataProcessor metadataProcessor,
            IFileManager fileManager,
            ICoreScopeProvider scopeProvider,
            ILogger<MediaToolsUploadHandler> logger, 
            IBackOfficeSecurityAccessor backOfficeSecurity)
        {

            
            _settingsService = settingsService;
            _mediaHelper = mediaHelper;
            _imageProcessor = imageProcessor;
            _metadataProcessor = metadataProcessor;
            _fileManager = fileManager;
            _scopeProvider = scopeProvider;
            _logger = logger;
            _backOfficeSecurity = backOfficeSecurity ?? throw new ArgumentNullException(nameof(backOfficeSecurity));
        }

        public void Handle(MediaSavingNotification notification)
        {
            //Try to get current backoffice user, bail if none found
            var user = _backOfficeSecurity.BackOfficeSecurity?.CurrentUser;
            if(user == null) return;

            //Get user settings from a file
            var userKey = user.Key.ToString();
            var settings = _settingsService.GetUserSettings(userKey);

            //Read settings object 

            var convertQuality = settings.Converter.ConvertQuality;
            var targetWidth = settings.Resizer.TargetWidth;
            var targetHeight = settings.Resizer.TargetHeight;
            var keepOriginals = settings.General.KeepOriginals;
            var convertMode = settings.Converter.ConvertMode;
            var ignoreKeyword = settings.General.IgnoreKeyword;

            //Prevent Options being out of bounds 
            targetWidth = Math.Clamp(targetWidth, MIN_WIDTH, MAX_WIDTH);
            targetHeight = Math.Clamp(targetHeight, MIN_HEIGHT, MAX_HEIGHT);
            convertQuality = Math.Clamp(convertQuality, 1, 100);

            
            using var imageStream = new MemoryStream();

            foreach(var media in notification.SavedEntities)
            {
                //Re-read settings because they might get overwritten (settings for folders)
                var resizingEnabled = settings.Resizer.Enabled;
                var convertingEnabled = settings.Converter.Enabled;
                
                //Skip if not an image
                if (string.IsNullOrEmpty(media.ContentType.Alias) || !media.ContentType.Alias.Equals("image", StringComparison.CurrentCultureIgnoreCase)) continue;  
                
                //Skip any not-new images
                if (media.Id > 0) continue;
                
                var originalPath = _mediaHelper.GetRelativePath(media);
                var tempSavingPath = _fileManager.GetFreePath(originalPath);
                Size originalResolution = new();

                //Skip if paths not good
                if (string.IsNullOrEmpty(originalPath) || string.IsNullOrEmpty(tempSavingPath)) continue;

                //Skip if image name contains "ignoreKeyword"
                if (Path.GetFileNameWithoutExtension(originalPath).Contains(ignoreKeyword,StringComparison.CurrentCultureIgnoreCase)) 
                {
                    continue;
                }
                
                using var scope = _scopeProvider.CreateCoreScope(autoComplete: true);
                using var _ = scope.Notifications.Suppress();

                //Read resolution      
                try
                {
                    originalResolution.Width = int.Parse(media.GetValue<string>("umbracoWidth")!);
                    originalResolution.Height = int.Parse(media.GetValue<string>("umbracoHeight")!);
                }
                catch
                {
                    continue; //Skip if resolution cannot be parsed 
                }
                
                //Read user resizer folder settings
                var parentFolder = _mediaHelper.GetMediaById(media.ParentId);
                if (parentFolder is { ContentType.Alias: "Folder" })
                {
                    var folderSetting = settings.Resizer.FolderOverrides.SingleOrDefault(x => x.Key == parentFolder.Key);
                    if (folderSetting != null)
                    {
                        targetHeight = Math.Clamp(folderSetting.TargetHeight, MIN_WIDTH, MAX_WIDTH);
                        targetWidth = Math.Clamp(folderSetting.TargetWidth, MIN_WIDTH, MAX_WIDTH);
                        resizingEnabled = folderSetting.ResizerEnabled;
                    }
                }
                
                
                //Override user settings resolution if provided in image filename
                var parsedTargetSize = ParseSizeFromFilename(Path.GetFileNameWithoutExtension(originalPath));
                if(parsedTargetSize != null)
                {
                    targetWidth = parsedTargetSize.Value.Width;
                    targetHeight = parsedTargetSize.Value.Height;
                }
                
                
                //Reset stream and read new image
                var fileReadSuccess = _fileManager.ReadToStream(originalPath, imageStream, true);
                if(!fileReadSuccess) 
                {
                    _logger.LogError("Could not read file: {originalFilepath}", originalPath);
                    continue;
                }
                
                //Load image from stream
                using var image = Image.Load(imageStream);


                var finalSavingPath = originalPath;
                var newResolution = originalResolution;

                //Image resizing part
                var wasResizedFlag = false;
                var needsDownsizing = originalResolution.Width > targetWidth || originalResolution.Height > targetHeight;
                if(needsDownsizing && resizingEnabled)
                {
                    var targetResolution = new Size(targetWidth, targetHeight);
                    var resolution = _imageProcessor.CalculateResolution(originalResolution, targetResolution);

                    var resizingSuccess = _imageProcessor.Resize(image, resolution);
                    if (resizingSuccess)
                    {
                        newResolution = resolution;
                        finalSavingPath = tempSavingPath;
                        wasResizedFlag = true;
                    }
                    else
                    {
                        _logger.LogError("Could not resize image {originalFilepath}",originalPath);
                    }
                }

                //Image converting part
                var wasConvertedFlag = false;
                if(convertingEnabled && !originalPath.EndsWith(".webp", StringComparison.OrdinalIgnoreCase))
                {
                    var convertingSuccess = _imageProcessor.ConvertToWebp(image, convertMode, convertQuality);

                    if(convertingSuccess)
                    {
                        var pathWithOldExtension = tempSavingPath;
                        tempSavingPath = Path.ChangeExtension(tempSavingPath, ".webp");
                        _fileManager.DeleteFile(pathWithOldExtension);

                        //Reassign where to save the image
                        finalSavingPath = tempSavingPath;
                        wasConvertedFlag = true;
                    }
                    
                }
                
                //Metadata remover part
                var metadataProcessedFlag = false;
                if (settings.MetadataRemover.Enabled)
                {
                    //Orient image beforehand, in case of deletion of the "Orientation" Tag. 
                    image.Mutate(img => img.AutoOrient());
                    
                    //Remove entire profiles
                    if (settings.MetadataRemover.RemoveXmpProfile)
                        image.Metadata.XmpProfile = null;
                    if (settings.MetadataRemover.RemoveIptcProfile)
                        image.Metadata.IptcProfile = null;

                    //Remove Exif Tag groups 
                    if (settings.MetadataRemover.RemoveCameraInfo)
                        _metadataProcessor.RemoveExifDeviceTags(image);
                    if (settings.MetadataRemover.RemoveDateTime)
                        _metadataProcessor.RemoveExifDateTimeTags(image);
                    if (settings.MetadataRemover.RemoveGpsInfo)
                        _metadataProcessor.RemoveExifGpsTags(image);
                    if (settings.MetadataRemover.RemoveShootingSituationInfo)
                        _metadataProcessor.RemoveExifSettingTags(image);
                    
                    //Remove single exif tags
                    var tagsToRemove = settings.MetadataRemover.MetadataTagsToRemove.ToList();
                    foreach (var tagName in tagsToRemove)
                    {
                        var tagFound = ExifTagsHelper.StringToExifMap.TryGetValue(tagName, out var tag);
                        if (tagFound)
                        {
                            image.Metadata.ExifProfile?.RemoveValue(tag!);
                        }
                    }

                    //TODO Handle non exif profiles

                    finalSavingPath = tempSavingPath;
                    metadataProcessedFlag = true;
                }

                //Finally writing modified image back to file
                if(wasConvertedFlag || wasResizedFlag || metadataProcessedFlag)
                {
                    var encoder = _imageProcessor.GetEncoder(finalSavingPath);
                   
                    imageStream.Position = 0;
                    imageStream.SetLength(0);

                    image.Save(imageStream, encoder);
                    _fileManager.WriteFile(finalSavingPath, imageStream);

                    //Adjust media properties
                    var newFilename = Path.GetFileNameWithoutExtension(finalSavingPath);
                    var newExtension = Path.GetExtension(finalSavingPath); 
                        
                    _mediaHelper.SetUmbBytes(media,imageStream.Length);
                    _mediaHelper.SetUmbFilename(media, newFilename);
                    _mediaHelper.SetUmbExtension(media, "." + newExtension);
                    _mediaHelper.SetUmbResolution(media, newResolution);
                } 
                
                //Deleting original files
                if (!keepOriginals && wasResizedFlag || wasConvertedFlag || metadataProcessedFlag)
                {
                    _fileManager.DeleteFile(originalPath);
                }
            }
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


