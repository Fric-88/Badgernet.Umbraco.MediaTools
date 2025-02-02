using System.Text.Json.Nodes;
using Badgernet.Umbraco.MediaTools.Models;
using SixLabors.ImageSharp;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.PublishedCache;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Services.Navigation;
using Umbraco.Cms.Core.Web;

namespace Badgernet.Umbraco.MediaTools.Helpers;

public class MediaHelperV15(
    MediaUrlGeneratorCollection mediaUrlGeneratorCollection, 
    IMediaCacheService mediaCacheService,
    IMediaNavigationQueryService mediaQueryService,
    IMediaService mediaService) : IMediaHelper
{
    private async Task<IEnumerable<IPublishedContent>> GetMediaContent(IEnumerable<Guid> keys)
    {
        var medias = new List<IPublishedContent>();
        foreach (var key in keys)
        {
            var content = await mediaCacheService.GetByKeyAsync(key).ConfigureAwait(false);
            if (content == null) continue;
            medias.Add(content);
        }
        return medias;
    }

    public IEnumerable<IPublishedContent> GetAllMedia()
    {
        var keys = new List<Guid>();
        
        mediaQueryService.TryGetRootKeys(out var rootKeys);

        if (rootKeys.Any())
        {
            keys.AddRange(rootKeys);
        }
        
        foreach (var key in rootKeys)
        {
            mediaQueryService.TryGetDescendantsKeys(key, out var descendantKeys);
            keys.AddRange(descendantKeys);
        }

        return Task.Run(() => GetMediaContent(keys)).GetAwaiter().GetResult();
    }
    
    public IEnumerable<string> ListFolders()
    {
        var allMedia = GetAllMedia();
        return allMedia.OfTypes("Folder").Select(x => x.Name);
    }

    public IMedia? GetMediaById(int id)
    {
        return mediaService.GetById(id);
    }

    public IEnumerable<IMedia> GetMediaByIds(int[] ids)
    {
        var medias = mediaService.GetByIds(ids);
        return medias; 
    }
        
    public IEnumerable<IPublishedContent> GetMediaByType(string type)
    {
        return GetAllMedia().OfTypes(type);
    }

    public IEnumerable<ImageMediaDto> GetMediaDtoByType(string type)
    {
        try
        {
            return GetMediaByType("Image")
                .Select(i => new ImageMediaDto
                {
                    Id = i.Id,
                    Name = i.Name,
                    Path = i.GetProperty("UmbracoFile")?.GetValue("Src")?.ToString() ?? string.Empty,
                    Width = Convert.ToInt32(i.GetProperty("umbracoWidth")?.GetValue() ?? 0),
                    Height = Convert.ToInt32(i.GetProperty("umbracoHeight")?.GetValue() ?? 0),
                    Extension = (string)(i.GetProperty("umbracoExtension")?.GetValue() ?? string.Empty),
                    Size = ExtensionMethods.ToReadableFileSize(
                        Convert.ToInt64(i.GetProperty("umbracoBytes")?.GetValue() ?? 0))
                });
        }
        catch (Exception)
        {
            return []; //Return empty List
        }

    }

    public IEnumerable<IPublishedContent> GetMediaByFolderName(string folderName)
    {
        if(string.IsNullOrEmpty(folderName)) return[];
        var medias = GetAllMedia();
        var folder = medias.OfTypes("Folder").SingleOrDefault(x => x.Name == folderName);

        if(folder == null) return [];        
        var images = folder.Descendants<IPublishedContent>().OfTypes("Image");

        return images;
    }

    public IEnumerable<ImageMediaDto> GetMediaDtoByFolderName(string folderName)
    {
        return  GetMediaByFolderName(folderName)
            .Select(i => new ImageMediaDto
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
        var mediaPath = media.GetUrl("umbracoFile", mediaUrlGeneratorCollection);
        return mediaPath ?? "";
    }

    /// <summary>
    /// Parses image size (resolution) from IMedia item
    /// </summary>
    /// <param name="media">IMedia item</param>
    /// <returns>Returns Size or Size.Empty if error occurred</returns>
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
        if (umbracoFileJson == null) return string.Empty;
        
        var umbracoFile = JsonNode.Parse((string)umbracoFileJson);
        var srcProp = umbracoFile!["src"]!.GetValue<string>();
        var extension = Path.GetExtension(srcProp);

        extension = extension.TrimStart('.');
        return extension;

    }
    public void SetUmbExtension(IMedia media, string extension)
    {
        var umbracoFileJson = media.GetValue("umbracoFile");
        if (umbracoFileJson == null) return;
        
        //Remove starting dots like in '.webp'
        extension = extension.TrimStart('.');    

        var umbracoFile = JsonNode.Parse((string)umbracoFileJson);
        var srcProp = umbracoFile!["src"]!.GetValue<string>();
        umbracoFile["src"] = Path.ChangeExtension(srcProp, extension);
        media.SetValue("umbracoFile", umbracoFile.ToJsonString());
        media.SetValue("umbracoExtension", extension);
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
        if (umbracoFileJson == null) return;
        
        var umbracoFile = JsonNode.Parse((string)umbracoFileJson);
        var srcProp = umbracoFile!["src"]!.GetValue<string>();
        var directory = Path.GetDirectoryName(srcProp)!;
        var path = Path.Combine(directory, filename);
        path = path.Replace('\\', '/');
        umbracoFile["src"] = path;

        media.SetValue("umbracoFile", umbracoFile.ToJsonString());
    }

    public void SaveMedia(IMedia media)
    {
        mediaService.Save(media);
    }

    public void TrashMedia(int mediaId)
    {
        var media = GetMediaById(mediaId) ?? throw new Exception("Media could not be found");
        mediaService.MoveToRecycleBin(media);
    }

    public bool RenameMedia(IMedia media, string newName)
    {
        try
        {
            media.Name = newName;
            SaveMedia(media);
            return true;
        }
        catch (Exception)
        {
            return false; 
        }
    }

}