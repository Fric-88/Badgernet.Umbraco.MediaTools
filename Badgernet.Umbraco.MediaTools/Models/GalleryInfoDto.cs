using System;

namespace Badgernet.Umbraco.MediaTools.Core.Models;

public class GalleryInfoDto
{
    public int MediaCount { get; set; } = 0;
    public int FolderCount {get; set; } = 0;
    public List<KeyValuePair<string,int>> CountByExtension { get; set; } = [];

}