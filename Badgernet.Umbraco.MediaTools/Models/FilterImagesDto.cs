using System;

namespace Badgernet.Umbraco.MediaTools.Core.Models;

public class FilterImagesDto
{
    public string? FolderName { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public string NameLike { get; set; } = string.Empty;
    public string ExtensionLike { get; set; } = string.Empty;
    public SizeFilter SizeFilter { get; set; } = SizeFilter.AllSizes;
}

public enum SizeFilter{
    AllSizes, BiggerThan, SmallerThan
}


