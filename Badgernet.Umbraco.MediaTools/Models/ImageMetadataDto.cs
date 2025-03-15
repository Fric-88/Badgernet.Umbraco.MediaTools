using Badgernet.Umbraco.MediaTools.Services.ImageProcessing.Metadata;

namespace Badgernet.Umbraco.MediaTools.Models;

public class ImageMetadataDto
{
    public double VerticalResolution { get; set; } = 0;
    public double HorizontalResolution { get; set; } = 0;
    public string DecodedImageFormat { get; set; } = string.Empty;
    public string ResolutionUnits { get; set; } = string.Empty;
    public List<ParsedTag> ExifValues { get; set; } = [];
    public string XmpProfile {get; set; } = string.Empty;
     
}