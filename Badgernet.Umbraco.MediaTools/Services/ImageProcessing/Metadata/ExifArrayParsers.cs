using System.Text;
using J2N;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Metadata.Profiles.Exif;

namespace Badgernet.Umbraco.MediaTools.Services.ImageProcessing.Metadata;

public static class ExifArrayParsers
{
    
    public static ParsedTag TryParseUshortArray(this IExifValue exifValue, string separator = " ")
    {
        var tagName = exifValue.Tag.ToString();

        if (exifValue.GetValue() is not ushort[] tagArr)
            return new ParsedTag(tagName, "");

        try
        {
            return new ParsedTag(tagName, string.Join(separator, tagArr));
        }
        catch
        {
            return new ParsedTag(tagName, "Unable to parse");
        }
    }
    
    public static ParsedTag TryParseUndefinedArray(this IExifValue exifValue)
    {
        var tagName = exifValue.Tag.ToString();
    
        if (exifValue.GetValue() is not byte[] tagArr)
            return new ParsedTag(tagName, "");

        try
        {
            return new ParsedTag(tagName, Encoding.ASCII.GetString(tagArr));
        }
        catch
        {
            return new ParsedTag(tagName, "Unable to parse");
        }
    }

    public static ParsedTag TryParseGpsCoordinate(this IExifValue exifValue)
    {
        var tagName = exifValue.Tag.ToString();
        if(exifValue.GetValue() is not Rational[] tagArr)
            return new ParsedTag(tagName, "");

        try
        {
            var degrees = tagArr[0].Numerator / tagArr[0].Denominator;
            var minutes = tagArr[1].Numerator / tagArr[1].Denominator;
            var seconds = tagArr[2].Numerator / tagArr[2].Denominator;
                
            return new ParsedTag(tagName, string.Join(" ", degrees, "\u00b0", minutes,"'", seconds,"\""));
            
        }
        catch
        {
            return new ParsedTag(tagName, "Unable to parse");
        }
    }
    
    public static ParsedTag TryParseLensSpecification(this IExifValue exifValue)
    {
        var tagName = exifValue.Tag.ToString();

        if (exifValue.GetValue() is not Rational[] { Length: 4 } lensSpec)
            return new ParsedTag(tagName, ""); 

        try
        {
            var minFocal = lensSpec[0].ToDouble();
            var maxFocal = lensSpec[1].ToDouble();
            var minApertureWide = lensSpec[2].ToDouble();
            var minApertureTele = lensSpec[3].ToDouble();

            var formatted = $"{minFocal}-{maxFocal}mm";

            if (!minApertureWide.IsNaN() && !minApertureTele.IsNaN())
            {
                var aperture = $" {minApertureWide}-{minApertureWide}mm";
                formatted += aperture;
            }

            return new ParsedTag(tagName, formatted);
        }
        catch
        {
            return new ParsedTag(tagName, "Error Parsing");
        }
    }

}