
using Badgernet.Umbraco.MediaTools.Services.ImageProcessing;
using SixLabors.ImageSharp.Metadata.Profiles.Exif;
using SixLabors.ImageSharp.Metadata.Profiles.Icc;
using SixLabors.ImageSharp.Metadata.Profiles.Iptc;
using SixLabors.ImageSharp.Metadata.Profiles.Xmp;

namespace Badgernet.Umbraco.MediaTools.Models;

public class ImageMetadataDto
{
    public double VerticalResolution { get; set; } = 0;
    public double HorizontalResolution { get; set; } = 0;
    public string DecodedImageFormat { get; set; } = string.Empty;
    public string ResolutionUnits { get; set; } = string.Empty;
    public List<ParsedExifTag> ExifValues { get; set; } = [];
}