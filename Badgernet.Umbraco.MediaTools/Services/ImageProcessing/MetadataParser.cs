using System.Collections;
using Polly.Caching;
using SixLabors.ImageSharp.Metadata.Profiles.Exif;

namespace Badgernet.Umbraco.MediaTools.Services.ImageProcessing;

public static class MetadataParser
{
    public static ParsedExifTag ParseIExifValue(IExifValue exifValue)
    {
        var tagName = exifValue.Tag.ToString();
        var tagValue = exifValue.GetValue() ?? string.Empty;

        if (exifValue.IsArray)
        {
            return tagName switch
            {
                ExifTags.ISOSpeedRatings => exifValue.TryParseIsoSpeedRatings(),
                ExifTags.ExifVersion => exifValue.TryParseExifVersion(),
                _ => new ParsedExifTag(tagName, "Array value")
            };
        }

        return new ParsedExifTag(tagName, tagValue.ToString() ?? "");

    }
}

public record ParsedExifTag(string Tag, string Value);

public static class ExifTags
{
     //IFD TAGS
    public const string SubfileType = "SubfileType";
    public const string OldSubfileType = "OldSubfileType";
    public const string ImageWidth = "ImageWidth";
    public const string ImageLength = "ImageLength";
    public const string BitsPerSample = "BitsPerSample";
    public const string Compression = "Compression";
    public const string PhotometricInterpretation = "PhotometricInterpretation";
    public const string Thresholding = "Thresholding";
    public const string CellWidth = "CellWidth";
    public const string CellLength = "CellLength";
    public const string FillOrder = "FillOrder";
    public const string DocumentName = "DocumentName";
    public const string ImageDescription = "ImageDescription";
    public const string Make = "Make";
    public const string Model = "Model";
    public const string StripOffsets = "StripOffsets";
    public const string Orientation = "Orientation";
    public const string SamplesPerPixel = "SamplesPerPixel";
    public const string RowsPerStrip = "RowsPerStrip";
    public const string StripByteCounts = "StripByteCounts";
    public const string MinSampleValue = "MinSampleValue";
    public const string MaxSampleValue = "MaxSampleValue";
    public const string XResolution = "XResolution";
    public const string YResolution = "YResolution";
    public const string PlanarConfiguration = "PlanarConfiguration";
    public const string PageName = "PageName";
    public const string XPosition = "XPosition";
    public const string YPosition = "YPosition";
    public const string FreeOffsets = "FreeOffsets";
    public const string FreeByteCounts = "FreeByteCounts";
    public const string GrayResponseUnit = "GrayResponseUnit";
    public const string GrayResponseCurve = "GrayResponseCurve";
    public const string T4Options = "T4Options";
    public const string T6Options = "T6Options";
    public const string ResolutionUnit = "ResolutionUnit";
    public const string PageNumber = "PageNumber";
    public const string ColorResponseUnit = "ColorResponseUnit";
    public const string TransferFunction = "TransferFunction";
    public const string Software = "Software";
    public const string DateTime = "DateTime";
    public const string Artist = "Artist";
    public const string HostComputer = "HostComputer";
    public const string Predictor = "Predictor";
    public const string WhitePoint = "WhitePoint";
    public const string PrimaryChromaticities = "PrimaryChromaticities";
    public const string ColorMap = "ColorMap";
    public const string HalftoneHints = "HalftoneHints";
    public const string TileWidth = "TileWidth";
    public const string TileLength = "TileLength";
    public const string TileOffsets = "TileOffsets";
    public const string TileByteCounts = "TileByteCounts";
    public const string BadFaxLines = "BadFaxLines";
    public const string CleanFaxData = "CleanFaxData";
    public const string ConsecutiveBadFaxLines = "ConsecutiveBadFaxLines";
    public const string InkSet = "InkSet";
    public const string InkNames = "InkNames";
    public const string NumberOfInks = "NumberOfInks";
    public const string DotRange = "DotRange";
    public const string TargetPrinter = "TargetPrinter";
    public const string ExtraSamples = "ExtraSamples";
    public const string SampleFormat = "SampleFormat";
    public const string SMinSampleValue = "SMinSampleValue";
    public const string SMaxSampleValue = "SMaxSampleValue";
    public const string TransferRange = "TransferRange";
    public const string ClipPath= "ClipPath";
    public const string XClipPathUnits = "XClipPathUnits";
    public const string YClipPathUnits = "YClipPathUnits";
    public const string Indexed = "Indexed";
    public const string JPEGTables = "JPEGTables";
    public const string OPIProxy = "OPIProxy";
    public const string ProfileType = "ProfileType";
    public const string FaxProfile = "FaxProfile";
    public const string CodingMethods = "CodingMethods";
    public const string VersionYear = "VersionYear";
    public const string ModeNumber = "ModeNumber";
    public const string Decode = "Decode";
    public const string DefaultImageColor = "DefaultImageColor";
    public const string T82ptions = "T82ptions";
    public const string JPEGProc = "JPEGProc";
    public const string JPEGInterchangeFormat = "JPEGInterchangeFormat";
    public const string JPEGInterchangeFormatLength = "JPEGInterchangeFormatLength";
    public const string JPEGRestartInterval = "JPEGRestartInterval";
    public const string JPEGLosslessPredictors = "JPEGLosslessPredictors";
    public const string JPEGPointTransforms = "JPEGPointTransforms";
    public const string JPEGQTables = "JPEGQTables";
    public const string JPEGDCTables = "JPEGDCTables";
    public const string JPEGACTables = "JPEGACTables";
    public const string YCbCrCoefficients = "YCbCrCoefficients";
    public const string YCbCrPositioning = "YCbCrPositioning";
    public const string YCbCrSubsampling = "YCbCrSubsampling";
    public const string ReferenceBlackWhite = "ReferenceBlackWhite";
    public const string StripRowCounts = "StripRowCounts";
    public const string XMP = "XMP";
    public const string Rating = "Rating";
    public const string RatingPercent = "RatingPercent";
    public const string ImageID = "ImageID";
    public const string CFARepeatPatternDim = "CFARepeatPatternDim";
    public const string CFAPattern2 = "CFAPattern2";
    public const string BatteryLevel = "BatteryLevel";
    public const string Copyright = "Copyright";
    public const string MDFileTag = "MDFileTag";
    public const string MDScalePixel = "MDScalePixel";
    public const string MDLabName = "MDLabName";
    public const string MDSampleInfo = "MDSampleInfo";
    public const string MDPrepDate = "MDPrepDate";
    public const string MDPrepTime = "MDPrepTime";
    public const string MDFileUnits = "MDFileUnits";
    public const string PixelScale = "PixelScale";
    public const string IntergraphPacketData = "IntergraphPacketData";
    public const string IntergraphRegisters = "IntergraphRegisters";
    public const string IntergraphMatrix = "IntergraphMatrix";
    public const string ModelTiePoint = "ModelTiePoint";
    public const string SEMInfo = "SEMInfo";
    public const string ModelTransform = "ModelTransform";
    public const string ImageLayer = "ImageLayer";
    public const string FaxRecvParams = "FaxRecvParams";
    public const string FaxSubaddress = "FaxSubaddress";
    public const string FaxRecvTime = "FaxRecvTime";
    public const string ImageSourceData = "ImageSourceData";
    public const string XPTitle = "XPTitle";
    public const string XPComment = "XPComment";
    public const string XPAuthor = "XPAuthor";
    public const string XPKeywords = "XPKeywords";
    public const string XPSubject = "XPSubject";
    public const string GDALMetadata = "GDALMetadata";
    public const string GDALNoData = "GDALNoData";
    //EXIF TAGS
    public const string ExposureTime = "ExposureTime";
    public const string FNumber = "FNumber";
    public const string ExposureProgram = "ExposureProgram";
    public const string SpectralSensitivity = "SpectralSensitivity";
    public const string ISOSpeedRatings = "ISOSpeedRatings";
    public const string OECF = "OECF";
    public const string Interlace = "Interlace";
    public const string TimeZoneOffset = "TimeZoneOffset";
    public const string SelfTimerMode = "SelfTimerMode";
    public const string SensitivityType = "SensitivityType";
    public const string StandardOutputSensitivity = "StandardOutputSensitivity";
    public const string RecommendedExposureIndex = "RecommendedExposureIndex";
    public const string ISOSpeed = "ISOSpeed";
    public const string ISOSpeedLatitudeyyy = "ISOSpeedLatitudeyyy";
    public const string ISOSpeedLatitudezzz = "ISOSpeedLatitudezzz";
    public const string ExifVersion = "ExifVersion";
    public const string DateTimeOriginal = "DateTimeOriginal";
    public const string DateTimeDigitized = "DateTimeDigitized";
    public const string OffsetTime = "OffsetTime";
    public const string OffsetTimeOriginal = "OffsetTimeOriginal";
    public const string OffsetTimeDigitized = "OffsetTimeDigitized";
    public const string ComponentsConfiguration = "ComponentsConfiguration";
    public const string CompressedBitsPerPixel = "CompressedBitsPerPixel";
    public const string ShutterSpeedValue = "ShutterSpeedValue";
    public const string ApertureValue = "ApertureValue";
    public const string BrightnessValue = "BrightnessValue";
    public const string ExposureBiasValue = "ExposureBiasValue";
    public const string MaxApertureValue = "MaxApertureValue";
    public const string SubjectDistance = "SubjectDistance";
    public const string MeteringMode = "MeteringMode";
    public const string LightSource = "LightSource";
    public const string Flash = "Flash";
    public const string FocalLength = "FocalLength";
    public const string FlashEnergy2 = "FlashEnergy2";
    public const string SpatialFrequencyResponse2 = "SpatialFrequencyResponse2";
    public const string Noise = "Noise";
    public const string FocalPlaneXResolution2 = "FocalPlaneXResolution2";
    public const string FocalPlaneYResolution2 = "FocalPlaneYResolution2";
    public const string FocalPlaneResolutionUnit2 = "FocalPlaneResolutionUnit2";
    public const string ImageNumber = "ImageNumber";
    public const string SecurityClassification = "SecurityClassification";
    public const string ImageHistory = "ImageHistory";
    public const string SubjectArea = "SubjectArea";
    public const string ExposureIndex2 = "ExposureIndex2";
    public const string TIFFEPStandardID = "TIFFEPStandardID";
    public const string SensingMethod2 = "SensingMethod2";
    public const string MakerNote = "MakerNote";
    public const string UserComment = "UserComment";
    public const string SubsecTime = "SubsecTime";
    public const string SubsecTimeOriginal = "SubsecTimeOriginal";
    public const string SubsecTimeDigitized = "SubsecTimeDigitized";
    public const string AmbientTemperature = "AmbientTemperature";
    public const string Humidity = "Humidity";
    public const string Pressure = "Pressure";
    public const string WaterDepth = "WaterDepth";
    public const string Acceleration = "Acceleration";
    public const string CameraElevationAngle = "CameraElevationAngle";
    public const string FlashpixVersion = "FlashpixVersion";
    public const string ColorSpace = "ColorSpace";
    public const string PixelXDimension = "PixelXDimension";
    public const string PixelYDimension = "PixelYDimension";
    public const string RelatedSoundFile = "RelatedSoundFile";
    public const string FlashEnergy = "FlashEnergy";
    public const string SpatialFrequencyResponse = "SpatialFrequencyResponse";
    public const string FocalPlaneXResolution = "FocalPlaneXResolution";
    public const string FocalPlaneYResolution = "FocalPlaneYResolution";
    public const string FocalPlaneResolutionUnit = "FocalPlaneResolutionUnit";
    public const string SubjectLocation = "SubjectLocation";
    public const string ExposureIndex = "ExposureIndex";
    public const string SensingMethod = "SensingMethod";
    public const string FileSource = "FileSource";
    public const string SceneType = "SceneType";
    public const string CFAPattern = "CFAPattern";
    public const string CustomRendered = "CustomRendered";
    public const string ExposureMode = "ExposureMode";
    public const string WhiteBalance = "WhiteBalance";
    public const string DigitalZoomRatio = "DigitalZoomRatio";
    public const string FocalLengthIn35mmFilm = "FocalLengthIn35mmFilm";
    public const string SceneCaptureType = "SceneCaptureType";
    public const string GainControl = "GainControl";
    public const string Contrast = "Contrast";
    public const string Saturation = "Saturation";
    public const string Sharpness = "Sharpness";
    public const string DeviceSettingDescription = "DeviceSettingDescription";
    public const string SubjectDistanceRange = "SubjectDistanceRange";
    public const string ImageUniqueID = "ImageUniqueID";
    public const string OwnerName = "OwnerName";
    public const string SerialNumber = "SerialNumber";
    public const string LensSpecification = "LensSpecification";
    public const string LensMake = "LensMake";
    public const string LensModel = "LensModel";
    public const string LensSerialNumber = "LensSerialNumber";

    //GPS TAGS
    public const string GPSVersionID = "GPSVersionID";
    public const string GPSLatitudeRef = "GPSLatitudeRef";
    public const string GPSLatitude = "GPSLatitude";
    public const string GPSLongitudeRef = "GPSLongitudeRef";
    public const string GPSLongitude = "GPSLongitude";
    public const string GPSAltitudeRef = "GPSAltitudeRef";
    public const string GPSAltitude = "GPSAltitude";
    public const string GPSTimestamp = "GPSTimestamp";
    public const string GPSSatellites = "GPSSatellites";
    public const string GPSStatus = "GPSStatus";
    public const string GPSMeasureMode = "GPSMeasureMode";
    public const string GPSDOP = "GPSDOP";
    public const string GPSSpeedRef = "GPSSpeedRef";
    public const string GPSSpeed = "GPSSpeed";
    public const string GPSTrackRef = "GPSTrackRef";
    public const string GPSTrack = "GPSTrack";
    public const string GPSImgDirectionRef = "GPSImgDirectionRef";
    public const string GPSImgDirection = "GPSImgDirection";
    public const string GPSMapDatum = "GPSMapDatum";
    public const string GPSDestLatitudeRef = "GPSDestLatitudeRef";
    public const string GPSDestLatitude = "GPSDestLatitude";
    public const string GPSDestLongitudeRef = "GPSDestLongitudeRef";
    public const string GPSDestLongitude = "GPSDestLongitude";
    public const string GPSDestBearingRef = "GPSDestBearingRef";
    public const string GPSDestBearing = "GPSDestBearing";
    public const string GPSDestDistanceRef = "GPSDestDistanceRef";
    public const string GPSDestDistance = "GPSDestDistance";
    public const string GPSProcessingMethod = "GPSProcessingMethod";
    public const string GPSAreaInformation = "GPSAreaInformation";
    public const string GPSDateStamp = "GPSDateStamp";
    public const string GPSDifferential = "GPSDifferential";
    //NONE TAGS
    public const string Unknown = "Unknown";
    public const string SubIFDOffset = "SubIFDOffset";
    public const string GPSIFDOffset = "GPSIFDOffset";

}