using Badgernet.Umbraco.MediaTools.Models;
using SixLabors.ImageSharp;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.PublishedContent;

namespace Badgernet.Umbraco.MediaTools.Helpers;

public interface IMediaHelper
{
        Task<IEnumerable<MediaFolderDto>> GetFoldersAsync();
        Task<IEnumerable<IPublishedContent>> GetAllMediaAsync();
        IMedia? GetMediaById(int id);
        IEnumerable<IMedia> GetMediaByIds(int[] ids);
        Task<IEnumerable<IPublishedContent>> GetMediaByFolderNameAsync(string folderName);
        Task<IEnumerable<ImageMediaDto>> GetMediaDtoByFolderName(string folderName);
        Task<IEnumerable<IPublishedContent>> GetMediaByTypeAsync(string type);
        Task<IEnumerable<ImageMediaDto>> GetMediaDtoByTypeAsync(string type);
        void SaveMedia(IMedia media);
        void SaveMedia(IEnumerable<IMedia> media);
        void TrashMedia(int mediaId);
        bool RenameMedia(IMedia media, string newName);
        string GetRelativePath(IMedia media);
        Size GetUmbResolution(IMedia media);
        void SetUmbResolution(IMedia media, Size size);
        string GetUmbExtension(IMedia media);
        void SetUmbExtension(IMedia media, string extension);
        long GetUmbBytes(IMedia media);
        void SetUmbBytes(IMedia media, long value);
        void SetUmbFilename(IMedia media, string filename);

}


