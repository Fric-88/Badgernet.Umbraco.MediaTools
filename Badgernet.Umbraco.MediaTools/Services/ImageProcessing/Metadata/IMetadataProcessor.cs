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
    
    

}