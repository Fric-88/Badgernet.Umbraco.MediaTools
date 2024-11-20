﻿using Microsoft.Extensions.Hosting;
using SixLabors.ImageSharp;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.Services;


namespace Badgernet.Umbraco.MediaTools.Core;

public interface IMediaHelper
{
        IEnumerable<string> ListFolders();
        IEnumerable<IPublishedContent> GetAllMedia();
        IMedia? GetMediaById(int id);
        IEnumerable<IMedia> GetMediaByIds(int[] ids);
        IEnumerable<IPublishedContent> GetMediaByFolderName(string folderName);
        IEnumerable<ImageMediaDto> GetMediaDtoByFolderName(string folderName);
        IEnumerable<IPublishedContent> GetMediaByType(string type);
        IEnumerable<ImageMediaDto> GetMediaDtoByType(string type);
        void SaveMedia(IMedia media);
        void TrashMedia(int mediaId);
        string GetRelativePath(IMedia media);
        Size GetUmbResolution(IMedia media);
        void SetUmbResolution(IMedia media, Size size);
        string GetUmbExtension(IMedia media);
        void SetUmbExtension(IMedia media, string extension);
        long GetUmbBytes(IMedia media);
        void SetUmbBytes(IMedia media, long value);
        void SetUmbFilename(IMedia media, string filename);

}

