using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Metadata;
using SixLabors.ImageSharp.Metadata.Profiles.Exif;

namespace Badgernet.Umbraco.MediaTools.Services.ImageProcessing.Metadata;

public class MetadataProcessor: IMetadataProcessor
{
    public ImageMetadata ReadMetadata(MemoryStream imageStream)
    {
        using var img = Image.Load(imageStream);
        var data = img.Metadata;
        return data;
    }
    public void CopyMetadata(Image sourceImage, Image destinationImage)
    {
        destinationImage.Metadata.ExifProfile = sourceImage.Metadata.ExifProfile?.DeepClone();
        destinationImage.Metadata.CicpProfile = sourceImage.Metadata.CicpProfile?.DeepClone();
        destinationImage.Metadata.IccProfile = sourceImage.Metadata.IccProfile?.DeepClone();
        destinationImage.Metadata.IptcProfile = sourceImage.Metadata.IptcProfile?.DeepClone();
        destinationImage.Metadata.HorizontalResolution = destinationImage.Width;
        destinationImage.Metadata.VerticalResolution = destinationImage.Height;
    }
    public  ParsedTag ParseIExifValue(IExifValue exifValue)
    {
        var tagName = exifValue.Tag.ToString();
        var tagValue = exifValue.GetValue() ?? string.Empty;

        if (exifValue.IsArray)
        {
            return tagName switch
            {
                ExifTags.ISOSpeedRatings => exifValue.TryParseUshortArray(", "),
                ExifTags.FlashpixVersion => exifValue.TryParseUndefinedArray(),
                ExifTags.ExifVersion => exifValue.TryParseUndefinedArray(),
                ExifTags.BitsPerSample => exifValue.TryParseUshortArray(", "),
                ExifTags.LensSpecification => exifValue.TryParseLensSpecification(),
                ExifTags.ComponentsConfiguration => exifValue.TryParseUndefinedArray(),
                ExifTags.GPSTimestamp => exifValue.TryParseGpsTimestamp(),
                ExifTags.GPSVersionID => exifValue.TryParseUndefinedArray(),
                ExifTags.GPSLatitude => exifValue.TryParseGpsCoordinate(),
                ExifTags.GPSLongitude=> exifValue.TryParseGpsCoordinate(), 
                _ => new ParsedTag(tagName, "Array value")
            };
        }

        return new ParsedTag(tagName, tagValue.ToString() ?? "");

    }

    public void SetResolutionTags(Image image, int width, int height)
    {
        image.Metadata.ExifProfile?.SetValue(ExifTag.ImageWidth, width);
        image.Metadata.ExifProfile?.SetValue(ExifTag.ImageLength, height );
        image.Metadata.ExifProfile?.SetValue(ExifTag.PixelXDimension, width);
        image.Metadata.ExifProfile?.SetValue(ExifTag.PixelYDimension, height);
    }
    
}