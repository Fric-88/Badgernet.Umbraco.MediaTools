
using SixLabors.ImageSharp.Metadata.Profiles.Exif;
using SixLabors.ImageSharp.Metadata.Profiles.Icc;
using SixLabors.ImageSharp.Metadata.Profiles.Iptc;
using SixLabors.ImageSharp.Metadata.Profiles.Xmp;

namespace Badgernet.Umbraco.MediaTools.Models;

public class ImageMetadataDto
{
    public List<Tuple<string, string>> Exif { get; set; } = new();
}