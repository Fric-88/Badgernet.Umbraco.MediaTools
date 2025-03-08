using System.Collections;
using Polly.Caching;
using SixLabors.ImageSharp.Metadata.Profiles.Exif;

namespace Badgernet.Umbraco.MediaTools.Services.ImageProcessing.Metadata;

public static class MetadataParser
{
    public static ParsedTag ParseIExifValue(IExifValue exifValue)
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
                ExifTags.GPSLatitude => exifValue.TryParseGpsCoordinate(),
                ExifTags.GPSLongitude=> exifValue.TryParseGpsCoordinate(), 
                _ => new ParsedTag(tagName, "Array value")
            };
        }

        return new ParsedTag(tagName, tagValue.ToString() ?? "");

    }
}



