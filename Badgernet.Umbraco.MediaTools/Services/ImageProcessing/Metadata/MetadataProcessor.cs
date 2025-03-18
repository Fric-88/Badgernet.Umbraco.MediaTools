using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Metadata;
using SixLabors.ImageSharp.Metadata.Profiles.Exif;

namespace Badgernet.Umbraco.MediaTools.Services.ImageProcessing.Metadata;

public class MetadataProcessor: IMetadataProcessor
{
    //Reads metadata profiles from image stream
    public ImageMetadata ReadMetadata(MemoryStream imageStream)
    {
        using var img = Image.Load(imageStream);
        var data = img.Metadata;
        return data;
    }
    
    //Copies complete all metadata between two images
    public void CopyMetadata(Image sourceImage, Image destinationImage)
    {
        destinationImage.Metadata.ExifProfile = sourceImage.Metadata.ExifProfile?.DeepClone();
        destinationImage.Metadata.CicpProfile = sourceImage.Metadata.CicpProfile?.DeepClone();
        destinationImage.Metadata.IccProfile = sourceImage.Metadata.IccProfile?.DeepClone();
        destinationImage.Metadata.IptcProfile = sourceImage.Metadata.IptcProfile?.DeepClone();
        destinationImage.Metadata.HorizontalResolution = destinationImage.Width;
        destinationImage.Metadata.VerticalResolution = destinationImage.Height;
    }
    public ParsedTag ParseIExifValue(IExifValue exifValue)
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
                ExifTags.MakerNote => exifValue.TryParseUndefinedArray(),
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

    //Adjusts Resolution related tags based on actual image resolution
    public void SetResolutionTags(Image image, int width, int height)
    {
        image.Metadata.ExifProfile?.SetValue(ExifTag.ImageWidth, width);
        image.Metadata.ExifProfile?.SetValue(ExifTag.ImageLength, height );
        image.Metadata.ExifProfile?.SetValue(ExifTag.PixelXDimension, width);
        image.Metadata.ExifProfile?.SetValue(ExifTag.PixelYDimension, height);
    }

    //Removes specific exif metadata tag from the image
    public bool RemoveExifTags(Image image, ExifTag exifTag)
    {
        if(image.Metadata.ExifProfile == null ) return false;
        return image.Metadata.ExifProfile.RemoveValue(exifTag);
    }

    //Removes exif tags related to Date and Time 
    public int RemoveExifDateTimeTags(Image image)
    {
        if(image.Metadata.ExifProfile == null ) return 0;

        var deletedCount = 0; 
        
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.DateTime)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.DateTimeOriginal)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.DateTimeDigitized)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.OffsetTime)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.OffsetTimeOriginal)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.OffsetTimeDigitized)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.SubsecTime)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.SubsecTimeOriginal)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.SubsecTimeDigitized)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSTimestamp)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSDateStamp)) deletedCount++;

        return deletedCount;
    }

    //Removes exif tags related to GPS information
    public int RemoveExifGpsTags(Image image)
    {
        if(image.Metadata.ExifProfile == null ) return 0;

        var deletedCount = 0; 
        
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSVersionID)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSLatitudeRef)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSLatitude)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSLongitudeRef)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSLongitude)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSAltitudeRef)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSAltitude)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSTimestamp)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSSatellites)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSStatus)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSMeasureMode)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSDOP)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSSpeedRef)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSSpeed)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSTrackRef)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSTrack)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSImgDirectionRef)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSImgDirection)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSMapDatum)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSDestLatitudeRef)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSDestLatitude)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSDestLongitudeRef)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSDestLongitude)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSDestBearingRef)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSDestBearing)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSDestDistanceRef)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSDestDistance)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSProcessingMethod)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSAreaInformation)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSDateStamp)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GPSDifferential)) deletedCount++;

        return deletedCount;
    }

    //Removes exif tags related to camera/phone/lens
    public int RemoveExifDeviceTags(Image image)
    {
        if(image.Metadata.ExifProfile == null ) return 0;

        var deletedCount = 0; 
        
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.ImageUniqueID)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.SerialNumber)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.LensSpecification)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.LensMake)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.LensModel)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.LensSerialNumber)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.Make)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.Model)) deletedCount++;

        return deletedCount;
    }

    //Removes exif tags related to shooting setting
    public int RemoveExifSettingTags(Image image)
    {
        if(image.Metadata.ExifProfile == null ) return 0;

        var deletedCount = 0; 
        
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.AmbientTemperature)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.Humidity)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.Pressure)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.WaterDepth)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.Acceleration)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.CameraElevationAngle)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.ExposureTime)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.FNumber)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.ExposureProgram)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.SpectralSensitivity)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.SensitivityType)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.OECF)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.RecommendedExposureIndex)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.ISOSpeed)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.ISOSpeedLatitudeyyy)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.ISOSpeedLatitudezzz)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.ApertureValue)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.BrightnessValue)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.ExposureBiasValue)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.MaxApertureValue)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.SubjectDistance)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.MeteringMode)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.LightSource)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.Flash)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.SubjectArea)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.FocalLength)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.FlashEnergy)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.SpatialFrequencyResponse)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.FocalPlaneXResolution)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.FocalPlaneYResolution)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.FocalPlaneResolutionUnit)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.SubjectLocation)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.ExposureIndex)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.SensingMethod)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.FileSource)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.SceneType)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.CFAPattern)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.CFARepeatPatternDim)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.CustomRendered)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.ExposureMode)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.WhiteBalance)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.DigitalZoomRatio)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.FocalLengthIn35mmFilm)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.SceneCaptureType)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.GainControl)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.Contrast)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.Saturation)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.Sharpness)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.DeviceSettingDescription)) deletedCount++;
        if(image.Metadata.ExifProfile.RemoveValue(ExifTag.SubjectDistanceRange)) deletedCount++;
        
        return deletedCount;
    }
}