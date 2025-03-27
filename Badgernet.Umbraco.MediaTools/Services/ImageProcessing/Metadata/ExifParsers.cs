using System.Text;
using J2N;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Metadata.Profiles.Exif;

namespace Badgernet.Umbraco.MediaTools.Services.ImageProcessing.Metadata;

public static class ExifParsers
{
    public static ParsedTag FromValue(this IExifValue tagVal)
    {
        var tagName = tagVal.Tag.ToString();
        return new ParsedTag(tagName, tagVal?.ToString() ?? string.Empty);
    }
    public static ParsedTag FromNumber(this IExifValue tagVal, string prefix, string suffix)
    {
        var tagName = tagVal.Tag.ToString();
        var tagValue = tagVal.GetValue();

        if (tagValue is not Number)
            return new ParsedTag(tagName, tagValue?.ToString() ?? string.Empty);//Default 

        return new ParsedTag(tagName, $"{prefix}{tagValue}{suffix}");
    }
    public static ParsedTag FromRational(this IExifValue tagVal, string prefix, string suffix, bool toSingle = false)
    {
        var tagName = tagVal.Tag.ToString();
        var tagValue = tagVal.GetValue();
        
        if(tagValue is not Rational value)
            return new ParsedTag(tagName, tagValue?.ToString() ?? string.Empty);

        if (toSingle)
        {
            return new  ParsedTag(tagName, $"{prefix}{value.ToSingle()}{suffix}");
        }
        return new ParsedTag(tagName, $"{prefix}{value.Numerator}/{value.Denominator}{suffix}");
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
    public static ParsedTag FromUndefinedArray(this IExifValue exifValue, Encoding? encoding)
    {
        var tagName = exifValue.Tag.ToString();
    
        if (exifValue.GetValue() is not byte[] tagArr)
            return new ParsedTag(tagName, "");

        encoding ??= DetectEncoding(tagArr);

        try
        {
            return new ParsedTag(tagName, encoding.GetString(tagArr));
        }
        catch
        {
            return new ParsedTag(tagName, "Unable to parse");
        }
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

    }
    public static ParsedTag FromComponentConfiguration(this IExifValue exifValue)
    {
        var tagName = exifValue.Tag.ToString();
        var tagValue = exifValue.GetValue();
    
        if (exifValue.GetValue() is not byte[] tagArr)
            return new ParsedTag(tagName, tagValue?.ToString() ?? string.Empty);


        var value = string.Empty;
        foreach (var arrItem in tagArr)
        {
            if (ComponentsConfigurationMap.TryGetValue(arrItem, out var tag))
            {
                value += tag;
            }
        }
        return new ParsedTag(tagName, value);
    }
    
    public static ParsedTag FromSubjectArea(this IExifValue exifValue)
    {
        var tagName = exifValue.Tag.ToString();
        var tagValue = exifValue.GetValue();
    
        if (exifValue.GetValue() is not ushort[] tagArr)
            return new ParsedTag(tagName, tagValue?.ToString() ?? string.Empty);

        return tagArr.Length switch
        {
            2 => new ParsedTag(tagName, $"X:{tagArr[0]}, Y:{tagArr[1]}"),
            3 => new ParsedTag(tagName, $"X:{tagArr[0]}, Y:{tagArr[1]}, Diameter:{tagArr[2]}"),
            4 => new ParsedTag(tagName, $"X:{tagArr[0]}, Y:{tagArr[1]}, Width:{tagArr[2]}, Height:{tagArr[3]}"),
            _ => new ParsedTag(tagName, "Unable to parse")
        };
    }
    
    public static ParsedTag FromSubjectLocation(this IExifValue exifValue)
    {
        var tagName = exifValue.Tag.ToString();
        var tagValue = exifValue.GetValue();
    
        if (exifValue.GetValue() is not ushort[] tagArr)
            return new ParsedTag(tagName, tagValue?.ToString() ?? string.Empty);

        return tagArr.Length switch
        {
            2 => new ParsedTag(tagName, $"X:{tagArr[0]}, Y:{tagArr[1]}"),
            _ => new ParsedTag(tagName, "Unable to parse")
        };
    }
    
    public static ParsedTag FromLensSpecification(this IExifValue exifValue)
    {
        var tagName = exifValue.Tag.ToString();
        var tagValue = exifValue.GetValue();
    
        if (exifValue.GetValue() is not Rational[] tagArr)
            return new ParsedTag(tagName, tagValue?.ToString() ?? string.Empty);

        if (tagArr.Length == 4)
        {
            return new ParsedTag(tagName, $"{tagArr[0]} - {tagArr[1]}mm, f/{tagArr[2]} - f/{tagArr[3]}");
        }
        return new ParsedTag(tagName, "Unable to parse");
    }

    public static ParsedTag FromNoise(this IExifValue exifValue)
    {
        //NOT IMPLEMENTED
        var tagName = exifValue.Tag.ToString();
        return new ParsedTag(tagName, "[...]");
    }

    public static ParsedTag FromGpsCoordinate(this IExifValue exifValue)
    {
        var tagName = exifValue.Tag.ToString();
        var tagValue = exifValue.GetValue();
    
        if (exifValue.GetValue() is not Rational[] arr)
            return new ParsedTag(tagName, tagValue?.ToString() ?? string.Empty);

        if (arr.Length == 3)
        {
            return new ParsedTag(tagName, $"{arr[0]}°{arr[1]}'{arr[2]}''");
        }
        
        return new ParsedTag(tagName, tagValue?.ToString() ?? string.Empty);
    }
    
    public static ParsedTag FromGpsTimestamp(this IExifValue exifValue)
    {
        var tagName = exifValue.Tag.ToString();
        var tagValue = exifValue.GetValue();
    
        if (exifValue.GetValue() is not Rational[] arr)
            return new ParsedTag(tagName, tagValue?.ToString() ?? string.Empty);

        if (arr.Length == 3)
        {
            return new ParsedTag(tagName, $"{arr[0]}:{arr[1]}:{arr[2]} UTC");
        }
        
        return new ParsedTag(tagName, tagValue?.ToString() ?? string.Empty);
    }

    private static readonly Dictionary<byte, string> ComponentsConfigurationMap = new()
    {
        { 1, "Y " }, { 2, "Cb " }, { 3, "Cr " },
        { 4, "R " }, { 5, "G " }, { 6, "B " }
    };
    
    static Encoding DetectEncoding(byte[] bytes)
    {
        if (bytes.Length >= 3 && bytes[0] == 0xEF && bytes[1] == 0xBB && bytes[2] == 0xBF)
            return Encoding.UTF8; // UTF-8 with BOM

        if (bytes.Length >= 2)
        {
            if (bytes[0] == 0xFF && bytes[1] == 0xFE)
                return Encoding.Unicode; // UTF-16 LE

            if (bytes[0] == 0xFE && bytes[1] == 0xFF)
                return Encoding.BigEndianUnicode; // UTF-16 BE
        }

        if (bytes.Length >= 4)
        {
            if (bytes[0] == 0x00 && bytes[1] == 0x00 && bytes[2] == 0xFE && bytes[3] == 0xFF)
                return Encoding.UTF32; // UTF-32 BE

            if (bytes[0] == 0xFF && bytes[1] == 0xFE && bytes[2] == 0x00 && bytes[3] == 0x00)
                return Encoding.UTF32; // UTF-32 LE
        }

        return Encoding.ASCII; // ASCII Default
    }


}