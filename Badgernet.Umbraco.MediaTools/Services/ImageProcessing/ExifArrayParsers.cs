using System.Text;
using SixLabors.ImageSharp.Metadata.Profiles.Exif;

namespace Badgernet.Umbraco.MediaTools.Services.ImageProcessing;

public static class ExifArrayParsers
{
    
    public static ParsedExifTag TryParseIsoSpeedRatings(this IExifValue exifValue)
    {
        var tagName = exifValue.Tag.ToString();
        var tagValue = exifValue.GetValue();
        
        try
        {
            if (tagValue == null) return new ParsedExifTag(tagName, "");
            
            var tagArr = (ushort[])tagValue;

            var builtVal = string.Empty;
            foreach (var item in tagArr)
            {
                builtVal += item + " ";
            }
                
            return new ParsedExifTag(tagName, builtVal);

        }
        catch
        {
            return new ParsedExifTag(tagName, "Error Parsing");
        }
    }
    
    public static ParsedExifTag TryParseExifVersion(this IExifValue exifValue)
    {
        var tagName = exifValue.Tag.ToString();
        var tagValue = exifValue.GetValue();
        
        try
        {
            if (tagValue == null) return new ParsedExifTag(tagName, "");
            var tagArr = (byte[])tagValue;
            return new ParsedExifTag(tagName, Encoding.ASCII.GetString(tagArr));
        }
        catch
        {
            return new ParsedExifTag(tagName, "Error Parsing");
        }
    }
}