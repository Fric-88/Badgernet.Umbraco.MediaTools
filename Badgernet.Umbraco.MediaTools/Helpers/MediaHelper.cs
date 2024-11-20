using SixLabors.ImageSharp;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.Services;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Badgernet.Umbraco.MediaTools.Core;
using Umbraco.Extensions;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Web;
using Badgernet.Umbraco.MediaTools.Core.Helpers;

namespace Badgernet.WebPicAuto.Helpers
{
    public class MediaHelper : IMediaHelper
    {
        private readonly MediaUrlGeneratorCollection _mediaUrlGeneratorCollection;
        private readonly IMediaService _mediaService;
        private readonly ILogger<MediaHelper> _logger;
        private readonly IUmbracoContextAccessor _contextAccessor;


        public MediaHelper (MediaUrlGeneratorCollection mediaUrlGeneratorCollection, IUmbracoContextAccessor contextAccessor, IMediaService mediaService, ILogger<MediaHelper> logger)
        {
            _mediaUrlGeneratorCollection = mediaUrlGeneratorCollection;
            _mediaService = mediaService;
            _contextAccessor = contextAccessor;
            _logger = logger;
        }

        public IEnumerable<string> ListFolders()
        {
            if (_contextAccessor .TryGetUmbracoContext(out var context) == false)
                return [];

            if (context.Content == null)
                return [];

            var mediaRoot = context.Media!.GetAtRoot();
            return mediaRoot.DescendantsOrSelf<IPublishedContent>().OfTypes("Folder").Select(x => x.Name);
        }

        public IEnumerable<IPublishedContent> GetAllMedia()
        {
            if (_contextAccessor .TryGetUmbracoContext(out var context) == false)
                return [];

            if (context.Content == null)
                return [];

            var mediaRoot = context.Media!.GetAtRoot();
            return mediaRoot.DescendantsOrSelf<IPublishedContent>();
        }

        public IMedia? GetMediaById(int id)
        {
            return _mediaService.GetById(id);
        }

        public IEnumerable<IMedia> GetMediaByIds(int[] ids)
        {
            var medias = _mediaService.GetByIds(ids);
            return medias; 
        }
        
        public IEnumerable<IPublishedContent> GetMediaByType(string type)
        {
            return GetAllMedia().OfTypes(type);
        }

        public IEnumerable<ImageMediaDto> GetMediaDtoByType(string type)
        {
            return GetMediaByType("Image")
                .Select(i => new ImageMediaDto()
                {
                    Id =i.Id,
                    Name = i.Name,
                    Path = i.GetProperty("UmbracoFile")?.GetValue("Src")?.ToString() ?? string.Empty,
                    Width = Convert.ToInt32(i.GetProperty("umbracoWidth")?.GetValue() ?? 0),
                    Height = Convert.ToInt32(i.GetProperty("umbracoHeight")?.GetValue() ?? 0),
                    Extension = (string) (i.GetProperty("umbracoExtension")?.GetValue() ?? string.Empty),
                    Size = ExtensionMethods.ToReadableFileSize(Convert.ToInt64(i.GetProperty("umbracoBytes")?.GetValue() ?? 0)) 
                });
        }

        public IEnumerable<IPublishedContent> GetMediaByFolderName(string folderName)
        {
            if(string.IsNullOrEmpty(folderName)) return[];
            if (_contextAccessor .TryGetUmbracoContext(out var context) == false) return [];
            if (context.Content == null) return [];

            var mediaRoot = context.Media!.GetAtRoot();
            var folder = mediaRoot.DescendantsOrSelf<IPublishedContent>().OfTypes("Folder").SingleOrDefault(x => x.Name == folderName);

            if(folder == null) return [];        
            var images = folder.Descendants<IPublishedContent>().OfTypes("Image");

            return images;
        }

        public IEnumerable<ImageMediaDto> GetMediaDtoByFolderName(string folderName)
        {
            return  GetMediaByFolderName(folderName)
                .Select(i => new ImageMediaDto()
                {
                    Id =i.Id,
                    Name = i.Name,
                    Path = i.GetProperty("UmbracoFile")?.GetValue("Src")?.ToString() ?? string.Empty,
                    Width = Convert.ToInt32(i.GetProperty("umbracoWidth")?.GetValue() ?? 0),
                    Height = Convert.ToInt32(i.GetProperty("umbracoHeight")?.GetValue() ?? 0),
                    Extension = (string) (i.GetProperty("umbracoExtension")?.GetValue() ?? string.Empty),
                    Size = ExtensionMethods.ToReadableFileSize(Convert.ToInt64(i.GetProperty("umbracoBytes")?.GetValue() ?? 0)) 
                });
        }

        //Returns path of the Image file on disk
        public string GetRelativePath(IMedia media)
        {
            var mediaPath = media.GetUrl("umbracoFile", _mediaUrlGeneratorCollection);
            return mediaPath ?? "";
        }

        /// <summary>
        /// Parses image size (resolution) from IMedia item
        /// </summary>
        /// <param name="media">IMedia item</param>
        /// <returns>Returns Size or "Size.Empty if error occurred</returns>
        public Size GetUmbResolution(IMedia media)
        {
            try
            {
                return new Size {
                    Width = Convert.ToInt32(media.GetValue<object>("umbracoWidth")),
                    Height = Convert.ToInt32(media.GetValue<object>("umbracoHeight"))
                };
            }
            catch
            {
                return Size.Empty;
            }
        } 
        
        public void SetUmbResolution(IMedia media, Size size)
        {
            media.SetValue("umbracoWidth", size.Width);
            media.SetValue("umbracoHeight",size.Height);
        }
        

        public string GetUmbExtension(IMedia media)
        {
            var umbracoFileJson = media.GetValue("umbracoFile");
            if(umbracoFileJson != null)
            {
                var umbracoFile = JsonNode.Parse((string)umbracoFileJson);
                var srcProp = umbracoFile!["src"]!.GetValue<string>();
                var extension = Path.GetExtension(srcProp);

                extension = extension.TrimStart('.');
                return extension;
            }

            return string.Empty;
        }
        public void SetUmbExtension(IMedia media, string extension)
        {
            var umbracoFileJson = media.GetValue("umbracoFile");
            if (umbracoFileJson != null)
            {
                //Remove starting dots like in '.webp'
                extension = extension.TrimStart('.');    

                var umbracoFile = JsonNode.Parse((string)umbracoFileJson);
                var srcProp = umbracoFile!["src"]!.GetValue<string>();
                umbracoFile["src"] = Path.ChangeExtension(srcProp, extension);
                media.SetValue("umbracoFile", umbracoFile.ToJsonString());
                media.SetValue("umbracoExtension", extension);
            }
        }

        public long GetUmbBytes(IMedia media){
                return media.GetValue<long>("umbracoBytes");
        }

        public void SetUmbBytes(IMedia media, long value)
        {
            media.SetValue("umbracoBytes", value);
        }

        public void SetUmbFilename(IMedia media, string filename)
        {
            var umbracoFileJson = media.GetValue("umbracoFile");
            if (umbracoFileJson != null)
            {
                var umbracoFile = JsonNode.Parse((string)umbracoFileJson);
                var srcProp = umbracoFile!["src"]!.GetValue<string>();
                var directory = Path.GetDirectoryName(srcProp)!;
                var path = Path.Combine(directory, filename);
                path = path.Replace('\\', '/');
                umbracoFile["src"] = path;

                media.SetValue("umbracoFile", umbracoFile.ToJsonString());
            }
        }

        public void SaveMedia(IMedia media)
        {
            _mediaService.Save(media);
        }

        public void TrashMedia(int mediaId)
        {
            var media = GetMediaById(mediaId) ?? throw new Exception("Media could not be found");
            _mediaService.MoveToRecycleBin(media);
        }


    }
}
