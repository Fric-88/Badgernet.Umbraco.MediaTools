using System.Text;
using J2N;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Metadata.Profiles.Exif;

namespace Badgernet.Umbraco.MediaTools.Services.ImageProcessing.Metadata;

public static class ExifParsers
{
    public static ParsedTag FromAscii(this IExifValue tagVal)
    {
        var tagName = tagVal.Tag.ToString();
        var tagValue = tagVal.GetValue();
        return new ParsedTag(tagName, tagValue?.ToString() ?? string.Empty);
    }
    public static ParsedTag FromUShort(this IExifValue tagVal, string prefix, string suffix)
    {
        var tagName = tagVal.Tag.ToString();
        var tagValue = tagVal.GetValue();
        
        if (tagValue is not ushort)
            return new ParsedTag(tagName, tagValue?.ToString() ?? string.Empty);//Default 

        return new ParsedTag(tagName, $"{prefix}{tagValue}{suffix}");
    }
    public static ParsedTag FromULong(this IExifValue tagVal, string prefix, string suffix)
    {
        var tagName = tagVal.Tag.ToString();
        var tagValue = tagVal.GetValue();

        if (tagValue is not SixLabors.ImageSharp.Number)
            return new ParsedTag(tagName, tagValue?.ToString() ?? string.Empty);//Default 

        return new ParsedTag(tagName, $"{prefix}{tagValue}{suffix}");
    }
    public static ParsedTag FromRational(this IExifValue tagVal, string prefix, string suffix)
    {
        var tagName = tagVal.Tag.ToString();
        var tagValue = tagVal.GetValue();
        
        if(tagValue is not Rational)
            return new ParsedTag(tagName, tagValue?.ToString() ?? string.Empty);
        
        return new ParsedTag(tagName, $"{prefix}{tagValue}{suffix}");
    }
    public static ParsedTag FromRationalArray(this IExifValue tagVal, string separator)
    {
        var tagName = tagVal.Tag.ToString();
        var tagValue = tagVal.GetValue();
        
        if(tagValue is not Rational[] arr)
            return new ParsedTag(tagName, tagValue?.ToString() ?? string.Empty);
        
        return new ParsedTag(tagName, string.Join(separator, arr));
    }
    public static ParsedTag FromUshortArray(this IExifValue exifValue, string separator = " ")
    {
        var tagName = exifValue.Tag.ToString();

        if (exifValue.GetValue() is not ushort[] tagArr)
            return new ParsedTag(tagName, exifValue?.GetValue()?.ToString() ?? string.Empty);

        return new ParsedTag(tagName, string.Join(separator, tagArr));
        
    }
    public static ParsedTag FromUndefinedArray(this IExifValue exifValue)
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
    public static ParsedTag FromCompression(this IExifValue exifValue)
    {
        var tagName = exifValue.Tag.ToString();
        var tagValue = exifValue.GetValue();

        if (tagValue is not ushort)
            return new ParsedTag(tagName, tagValue?.ToString() ?? string.Empty);
        
        return tagValue switch
        {
            1 => new ParsedTag(tagName, "uncompressed"),
            6 => new ParsedTag(tagName, "JPEG"),
            _ => new ParsedTag(tagName, "other")
        };

    }
    public static ParsedTag FromYCbCrPositioning(this IExifValue exifValue)
    {
        var tagName = exifValue.Tag.ToString();
        var tagValue = exifValue.GetValue();

        if (tagValue is not ushort)
            return new ParsedTag(tagName, tagValue?.ToString() ?? string.Empty);
        
        return tagValue switch
        {
            1 => new ParsedTag(tagName, "centered"),
            2 => new ParsedTag(tagName, "co-sited"),
            _ => new ParsedTag(tagName, "other")
        };
    }
    public static ParsedTag FromYCbCrSubsampling(this IExifValue exifValue)
    {
        var tagName = exifValue.Tag.ToString();
        var tagValue = exifValue.GetValue();

        if (tagValue is not ushort[] values)
            return new ParsedTag(tagName, tagValue?.ToString() ?? string.Empty);
        
        if(values.Length != 2)
            return new ParsedTag(tagName, values?.ToString() ?? string.Empty);
        
        if(values[0] == 2 && values[1] == 1 )
            return new ParsedTag(tagName, "YCbCr4:2:2");
        if(values[0] == 2 && values[1] == 2 )
            return new ParsedTag(tagName, "YCbCr4:2:0");
        
        return new ParsedTag(tagName, "other");
        
        
        
        return tagValue switch
        {
            1 => new ParsedTag(tagName, "centered"),
            2 => new ParsedTag(tagName, "co-sited"),
            _ => new ParsedTag(tagName, "other")
        };
    }
    public static ParsedTag FromOrientation(this IExifValue exifValue)
    {
        var tagName = exifValue.Tag.ToString();
        var tagValue = exifValue.GetValue();

        if (tagValue is not ushort)
            return new ParsedTag(tagName, tagValue?.ToString() ?? string.Empty);


        return tagValue switch
        {
            1 => new ParsedTag(tagName, "top left"),
            2 => new ParsedTag(tagName, "top right"),
            3 => new ParsedTag(tagName, "bottom right"),
            4 => new ParsedTag(tagName, "bottom left"),
            5 => new ParsedTag(tagName, "left top"),
            6 => new ParsedTag(tagName, "right top"),
            7 => new ParsedTag(tagName, "right bottom"),
            8 => new ParsedTag(tagName, "left bottom"),
            _ => new ParsedTag(tagName, "other")
        };
    } 
    public static ParsedTag FromPlanarConfiguration(this IExifValue exifValue)
    {
        var tagName = exifValue.Tag.ToString();
        var tagValue = exifValue.GetValue();

        if (tagValue is not ushort)
            return new ParsedTag(tagName, tagValue?.ToString() ?? string.Empty);


        return tagValue switch
        {
            1 => new ParsedTag(tagName, "chunky"),
            2 => new ParsedTag(tagName, "planar"),
            _ => new ParsedTag(tagName, "other")
        };
    } 
    public static ParsedTag FromResolutionUnit(this IExifValue exifValue)
    {
        var tagName = exifValue.Tag.ToString();
        var tagValue = exifValue.GetValue();

        if (tagValue is not ushort)
            return new ParsedTag(tagName, tagValue?.ToString() ?? string.Empty);


        return tagValue switch
        {
            2 => new ParsedTag(tagName, "inches"),
            3 => new ParsedTag(tagName, "centimeters"),
            _ => new ParsedTag(tagName, "other")
        };
    } 
    public static ParsedTag FromPhotometricInterpretation(this IExifValue exifValue)
    {
        var tagName = exifValue.Tag.ToString();
        var tagValue = exifValue.GetValue();

        if (tagValue is not ushort)
            return new ParsedTag(tagName, tagValue?.ToString() ?? string.Empty);

        return tagValue switch
        {
            2 => new ParsedTag(tagName, "RGB"),
            6 => new ParsedTag(tagName, "YCbCr"),
            _ => new ParsedTag(tagName, "other")
        };
    }
    public static ParsedTag FromExposureTime(this IExifValue exifValue)
    {
        var tagName = exifValue.Tag.ToString();
        var tagValue = exifValue.GetValue();

        if (tagValue is not Rational value)
            return new ParsedTag(tagName, tagValue?.ToString() ?? string.Empty);
        
        return new ParsedTag(tagName, $"{value.Numerator}/{value.Denominator} sec");
    }
    
    public static ParsedTag FromExposureProgram(this IExifValue exifValue)
    {
        var tagName = exifValue.Tag.ToString();
        var tagValue = exifValue.GetValue();

        if (tagValue is not ushort)
            return new ParsedTag(tagName, tagValue?.ToString() ?? string.Empty);

        return tagValue switch
        {
            0 => new ParsedTag(tagName, "Not defined"),
            1 => new ParsedTag(tagName, "Manual"),
            2 => new ParsedTag(tagName, "Normal program"),
            3 => new ParsedTag(tagName, "Aperture priority"),
            4 => new ParsedTag(tagName, "Shutter priority"),
            5 => new ParsedTag(tagName, "Creative program"),
            6 => new ParsedTag(tagName, "Action program"),
            7 => new ParsedTag(tagName, "Portrait mode"),
            8 => new ParsedTag(tagName, "Landscape mode"),
            _ => new ParsedTag(tagName, "other")
        };
    }
    
    public static ParsedTag FromSensitivityType(this IExifValue exifValue)
    {
        var tagName = exifValue.Tag.ToString();
        var tagValue = exifValue.GetValue();

        if (tagValue is not ushort)
            return new ParsedTag(tagName, tagValue?.ToString() ?? string.Empty);

        return tagValue switch
        {
            0 => new ParsedTag(tagName, "Unknown"),
            1 => new ParsedTag(tagName, "SOS"),
            2 => new ParsedTag(tagName, "REI"),
            3 => new ParsedTag(tagName, "ISO speed"),
            4 => new ParsedTag(tagName, "SOS + REI"),
            5 => new ParsedTag(tagName, "SOS + ISO"),
            6 => new ParsedTag(tagName, "REI + ISO"),
            7 => new ParsedTag(tagName, "SOS + REI + ISO"),
            _ => new ParsedTag(tagName, "other")
        };
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
    public static ParsedTag TryParseGpsTimestamp(this IExifValue exifValue)
    {
        var tagName = exifValue.Tag.ToString();
        if(exifValue.GetValue() is not Rational[] tagArr)
            return new ParsedTag(tagName, "");

        try 
        {
            var hour = (tagArr[0].Numerator / tagArr[0].Denominator).ToString("D2");
            var minute = (tagArr[1].Numerator / tagArr[1].Denominator).ToString("D2");
            var second = (tagArr[2].Numerator / tagArr[2].Denominator).ToString("D2");
            
            return new ParsedTag(tagName, string.Join(hour, ":", minute,":", second));
            
        }
        catch
        {
            return new ParsedTag(tagName, "00:00:00");
        }
    }
}