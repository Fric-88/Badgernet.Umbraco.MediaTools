using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Metadata;
using SixLabors.ImageSharp.Metadata.Profiles.Exif;

namespace Badgernet.Umbraco.MediaTools.Services.ImageProcessing.Metadata;

public interface IMetadataProcessor
{
    ImageMetadata ReadMetadata(MemoryStream imageStream);
    public void CopyMetadata(Image sourceImage, Image destinationImage);
    public ParsedTag ParseIExifValue(IExifValue exifValue);
    public void SetResolutionTags(Image image, int width, int height );
    public bool RemoveExifTags(Image image, ExifTag tagName);
    public int RemoveExifDateTimeTags(Image image);
    public int RemoveExifGpsTags(Image image);
    public int RemoveExifDeviceTags(Image image);
    public int RemoveExifSettingTags(Image image); 

}