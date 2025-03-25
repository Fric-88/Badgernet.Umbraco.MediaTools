using Lucene.Net.Analysis.Hunspell;
using SixLabors.ImageSharp.Metadata.Profiles.Exif;

namespace Badgernet.Umbraco.MediaTools.Services.ImageProcessing.Metadata;

public static class ExifTagsHelper
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
    
    public static readonly Dictionary<string, ExifTag> StringToExifMap = new(StringComparer.OrdinalIgnoreCase)
    {                                                       
        { "SubfileType", ExifTag.SubfileType },
        { "OldSubfileType", ExifTag.OldSubfileType},
        { "ImageWidth", ExifTag.ImageWidth },
        { "ImageLength", ExifTag.ImageLength },
        { "BitsPerSample", ExifTag.BitsPerSample },
        { "Compression", ExifTag.Compression },
        { "PhotometricInterpretation", ExifTag.PhotometricInterpretation },
        { "Thresholding", ExifTag.Thresholding },
        { "CellWidth", ExifTag.CellWidth },
        { "CellLength", ExifTag.CellLength },
        { "FillOrder", ExifTag.FillOrder },
        { "DocumentName", ExifTag.DocumentName },
        { "ImageDescription", ExifTag.ImageDescription },
        { "Make", ExifTag.Make },
        { "Model", ExifTag.Model },
        { "StripOffsets", ExifTag.StripOffsets },
        { "Orientation", ExifTag.Orientation },
        { "SamplesPerPixel", ExifTag.SamplesPerPixel },
        { "RowsPerStrip", ExifTag.RowsPerStrip },
        { "StripByteCounts", ExifTag.StripByteCounts },
        { "MinSampleValue", ExifTag.MinSampleValue },
        { "MaxSampleValue", ExifTag.MaxSampleValue },
        { "XResolution", ExifTag.XResolution },
        { "YResolution", ExifTag.YResolution },
        { "PlanarConfiguration", ExifTag.PlanarConfiguration },
        { "PageName", ExifTag.PageName },
        { "XPosition", ExifTag.XPosition },
        { "YPosition", ExifTag.YPosition },
        { "FreeOffsets", ExifTag.FreeOffsets },
        { "FreeByteCounts", ExifTag.FreeByteCounts },
        { "GrayResponseUnit", ExifTag.GrayResponseUnit },
        { "GrayResponseCurve", ExifTag.GrayResponseCurve },
        { "T4Options", ExifTag.T4Options },
        { "T6Options", ExifTag.T6Options  },
        { "ResolutionUnit", ExifTag.ResolutionUnit },
        { "PageNumber", ExifTag.PageNumber },
        { "ColorResponseUnit", ExifTag.ColorResponseUnit },
        { "TransferFunction", ExifTag.TransferFunction },
        { "Software", ExifTag.Software },
        { "DateTime", ExifTag.DateTime },
        { "Artist", ExifTag.Artist },
        { "HostComputer", ExifTag.HostComputer },
        { "Predictor", ExifTag.Predictor },
        { "WhitePoint", ExifTag.WhitePoint },
        { "PrimaryChromaticities", ExifTag.PrimaryChromaticities },
        { "ColorMap", ExifTag.ColorMap },
        { "HalftoneHints", ExifTag.HalftoneHints },
        { "TileWidth", ExifTag.TileWidth },
        { "TileLength", ExifTag.TileLength },
        { "TileOffsets", ExifTag.TileOffsets },
        { "TileByteCounts", ExifTag.TileByteCounts },
        { "BadFaxLines", ExifTag.BadFaxLines },
        { "CleanFaxData", ExifTag.CleanFaxData },
        { "ConsecutiveBadFaxLines", ExifTag.ConsecutiveBadFaxLines },
        { "InkSet", ExifTag.InkSet },
        { "InkNames", ExifTag.InkNames },
        { "NumberOfInks", ExifTag.NumberOfInks },
        { "DotRange", ExifTag.DotRange },
        { "TargetPrinter", ExifTag.TargetPrinter },
        { "ExtraSamples", ExifTag.ExtraSamples },
        { "SampleFormat", ExifTag.SampleFormat },
        { "SMinSampleValue", ExifTag.SMinSampleValue },
        { "SMaxSampleValue", ExifTag.SMaxSampleValue },
        { "TransferRange", ExifTag.TransferRange },
        { "ClipPath", ExifTag.ClipPath },
        { "XClipPathUnits", ExifTag.XClipPathUnits },
        { "YClipPathUnits", ExifTag.YClipPathUnits },
        { "Indexed", ExifTag.Indexed },
        { "JPEGTables", ExifTag.JPEGTables },
        { "OPIProxy", ExifTag.OPIProxy },
        { "ProfileType", ExifTag.ProfileType },
        { "FaxProfile", ExifTag.FaxProfile },
        { "CodingMethods", ExifTag.CodingMethods },
        { "VersionYear", ExifTag.VersionYear },
        { "ModeNumber", ExifTag.ModeNumber },
        { "Decode", ExifTag.Decode },
        { "DefaultImageColor", ExifTag.DefaultImageColor },
        { "T82ptions", ExifTag.T82ptions },
        { "JPEGProc", ExifTag.JPEGProc },
        { "JPEGInterchangeFormat", ExifTag.JPEGInterchangeFormat },
        { "JPEGInterchangeFormatLength", ExifTag.JPEGInterchangeFormatLength },
        { "JPEGRestartInterval", ExifTag.JPEGRestartInterval },
        { "JPEGLosslessPredictors", ExifTag.JPEGLosslessPredictors },
        { "JPEGPointTransforms", ExifTag.JPEGPointTransforms },
        { "JPEGQTables", ExifTag.JPEGQTables },
        { "JPEGDCTables", ExifTag.JPEGDCTables },
        { "JPEGACTables", ExifTag.JPEGACTables },
        { "YCbCrCoefficients", ExifTag.YCbCrCoefficients },
        { "YCbCrPositioning", ExifTag.YCbCrPositioning },
        { "YCbCrSubsampling", ExifTag.YCbCrSubsampling },
        { "ReferenceBlackWhite", ExifTag.ReferenceBlackWhite },
        { "StripRowCounts", ExifTag.StripRowCounts },
        { "XMP", ExifTag.XMP },
        { "Rating", ExifTag.Rating },
        { "RatingPercent", ExifTag.RatingPercent },
        { "ImageID", ExifTag.ImageID },
        { "CFARepeatPatternDim", ExifTag.CFARepeatPatternDim },
        { "CFAPattern2", ExifTag.CFAPattern2 },
        { "BatteryLevel", ExifTag.BatteryLevel },
        { "Copyright", ExifTag.Copyright },
        { "MDFileTag", ExifTag.MDFileTag },
        { "MDScalePixel", ExifTag.MDScalePixel },
        { "MDLabName", ExifTag.MDLabName },
        { "MDSampleInfo", ExifTag.MDSampleInfo },
        { "MDPrepDate", ExifTag.MDPrepDate },
        { "MDPrepTime", ExifTag.MDPrepTime },
        { "MDFileUnits", ExifTag.MDFileTag },
        { "PixelScale", ExifTag.PixelScale },
        { "IntergraphPacketData", ExifTag.IntergraphPacketData },
        { "IntergraphRegisters", ExifTag.IntergraphRegisters },
        { "IntergraphMatrix", ExifTag.IntergraphMatrix },
        { "ModelTiePoint", ExifTag.ModelTiePoint },
        { "SEMInfo", ExifTag.SEMInfo },
        { "ModelTransform", ExifTag.ModelTransform },
        { "ImageLayer", ExifTag.ImageLayer },
        { "FaxRecvParams", ExifTag.FaxRecvParams },
        { "FaxSubaddress", ExifTag.FaxSubaddress },
        { "FaxRecvTime", ExifTag.FaxRecvTime },
        { "ImageSourceData", ExifTag.ImageSourceData },
        { "XPTitle", ExifTag.XPTitle },
        { "XPComment", ExifTag.XPComment },
        { "XPAuthor", ExifTag.XPAuthor },
        { "XPKeywords", ExifTag.XPKeywords },
        { "XPSubject", ExifTag.XPSubject },
        { "GDALMetadata", ExifTag.GDALMetadata },
        { "GDALNoData", ExifTag.GDALNoData },
        { "ExposureTime", ExifTag.ExposureTime },
        { "FNumber", ExifTag.FNumber },
        { "ExposureProgram", ExifTag.ExposureProgram },
        { "SpectralSensitivity", ExifTag.SpectralSensitivity },
        { "ISOSpeedRatings", ExifTag.ISOSpeedRatings },
        { "OECF", ExifTag.OECF },
        { "Interlace", ExifTag.Interlace },
        { "TimeZoneOffset", ExifTag.TimeZoneOffset },
        { "SelfTimerMode", ExifTag.SelfTimerMode },
        { "SensitivityType", ExifTag.SensitivityType },
        { "StandardOutputSensitivity", ExifTag.StandardOutputSensitivity },
        { "RecommendedExposureIndex", ExifTag.RecommendedExposureIndex },
        { "ISOSpeed", ExifTag.ISOSpeed },
        { "ISOSpeedLatitudeyyy", ExifTag.ISOSpeedLatitudeyyy },
        { "ISOSpeedLatitudezzz", ExifTag.ISOSpeedLatitudezzz },
        { "ExifVersion", ExifTag.ExifVersion },
        { "DateTimeOriginal", ExifTag.DateTimeOriginal },
        { "DateTimeDigitized", ExifTag.DateTimeDigitized },
        { "OffsetTime", ExifTag.OffsetTime },
        { "OffsetTimeOriginal", ExifTag.OffsetTimeOriginal },
        { "OffsetTimeDigitized", ExifTag.OffsetTimeDigitized },
        { "ComponentsConfiguration", ExifTag.ComponentsConfiguration },
        { "CompressedBitsPerPixel", ExifTag.CompressedBitsPerPixel },
        { "ShutterSpeedValue", ExifTag.ShutterSpeedValue },
        { "ApertureValue", ExifTag.ApertureValue },
        { "BrightnessValue", ExifTag.BrightnessValue },
        { "ExposureBiasValue", ExifTag.ExposureBiasValue },
        { "MaxApertureValue", ExifTag.MaxApertureValue },
        { "SubjectDistance", ExifTag.SubjectDistance },
        { "MeteringMode", ExifTag.MeteringMode },
        { "LightSource", ExifTag.LightSource },
        { "Flash", ExifTag.Flash },
        { "FocalLength", ExifTag.FocalLength },
        { "FlashEnergy2", ExifTag.FlashEnergy2 },
        { "SpatialFrequencyResponse2", ExifTag.SpatialFrequencyResponse2 },
        { "Noise", ExifTag.Noise },
        { "FocalPlaneXResolution2", ExifTag.FocalPlaneXResolution2 },
        { "FocalPlaneYResolution2", ExifTag.FocalPlaneYResolution2 },
        { "FocalPlaneResolutionUnit2", ExifTag.FocalPlaneResolutionUnit2 },
        { "ImageNumber", ExifTag.ImageNumber },
        { "SecurityClassification", ExifTag.SecurityClassification },
        { "ImageHistory", ExifTag.ImageHistory },
        { "SubjectArea", ExifTag.SubjectArea },
        { "ExposureIndex2", ExifTag.ExposureIndex2 },
        { "TIFFEPStandardID", ExifTag.TIFFEPStandardID },
        { "SensingMethod2", ExifTag.SensingMethod2 },
        { "MakerNote", ExifTag.MakerNote},
        { "UserComment", ExifTag.UserComment },
        { "SubsecTime", ExifTag.SubsecTime },
        { "SubsecTimeOriginal", ExifTag.SubsecTimeOriginal },
        { "SubsecTimeDigitized", ExifTag.SubsecTimeDigitized },
        { "AmbientTemperature", ExifTag.AmbientTemperature },
        { "Humidity", ExifTag.Humidity },
        { "Pressure", ExifTag.Pressure },
        { "WaterDepth", ExifTag.WaterDepth },
        { "Acceleration", ExifTag.Acceleration },
        { "CameraElevationAngle", ExifTag.CameraElevationAngle },
        { "FlashpixVersion", ExifTag.FlashpixVersion },
        { "ColorSpace", ExifTag.ColorSpace },
        { "PixelXDimension", ExifTag.PixelXDimension },
        { "PixelYDimension", ExifTag.PixelYDimension },
        { "RelatedSoundFile", ExifTag.RelatedSoundFile },
        { "FlashEnergy", ExifTag.FlashEnergy },
        { "SpatialFrequencyResponse", ExifTag.SpatialFrequencyResponse },
        { "FocalPlaneXResolution", ExifTag.FocalPlaneXResolution },
        { "FocalPlaneYResolution", ExifTag.FocalPlaneYResolution },
        { "FocalPlaneResolutionUnit", ExifTag.FocalPlaneResolutionUnit },
        { "SubjectLocation", ExifTag.SubjectLocation },
        { "ExposureIndex", ExifTag.ExposureIndex },
        { "SensingMethod", ExifTag.SensingMethod },
        { "FileSource", ExifTag.FileSource },
        { "SceneType", ExifTag.SceneType },
        { "CFAPattern", ExifTag.CFAPattern },
        { "CustomRendered", ExifTag.CustomRendered },
        { "ExposureMode", ExifTag.ExposureMode },
        { "WhiteBalance", ExifTag.WhiteBalance },
        { "DigitalZoomRatio", ExifTag.DigitalZoomRatio },
        { "FocalLengthIn35mmFilm", ExifTag.FocalLengthIn35mmFilm },
        { "SceneCaptureType", ExifTag.SceneCaptureType },
        { "GainControl", ExifTag.GainControl },
        { "Saturation", ExifTag.Saturation },
        { "Sharpness", ExifTag.Sharpness },
        { "DeviceSettingDescription", ExifTag.DeviceSettingDescription },
        { "SubjectDistanceRange", ExifTag.SubjectDistanceRange },
        { "ImageUniqueID", ExifTag.ImageUniqueID },
        { "OwnerName", ExifTag.OwnerName },
        { "SerialNumber", ExifTag.SerialNumber },
        { "LensSpecification", ExifTag.LensSpecification },
        { "LensMake", ExifTag.LensMake },
        { "LensModel", ExifTag.LensModel },
        { "LensSerialNumber", ExifTag.LensSerialNumber },
        { "GPSVersionID", ExifTag.GPSVersionID },
        { "GPSLatitudeRef", ExifTag.GPSLatitudeRef },
        { "GPSLatitude", ExifTag.GPSLatitude },
        { "GPSLongitudeRef", ExifTag.GPSLongitudeRef },
        { "GPSLongitude", ExifTag.GPSLongitude },
        { "GPSAltitudeRef", ExifTag.GPSAltitudeRef },
        { "GPSAltitude", ExifTag.GPSAltitude },
        { "GPSTimestamp", ExifTag.GPSTimestamp },
        { "GPSSatellites", ExifTag.GPSSatellites },
        { "GPSStatus", ExifTag.GPSStatus },
        { "GPSMeasureMode", ExifTag.GPSMeasureMode },
        { "GPSDOP", ExifTag.GPSDOP },
        { "GPSSpeedRef", ExifTag.GPSSpeedRef },
        { "GPSSpeed", ExifTag.GPSSpeed },
        { "GPSTrackRef", ExifTag.GPSTrackRef },
        { "GPSTrack", ExifTag.GPSTrack },
        { "GPSImgDirectionRef", ExifTag.GPSImgDirectionRef },
        { "GPSImgDirection", ExifTag.GPSImgDirection },
        { "GPSMapDatum", ExifTag.GPSMapDatum },
        { "GPSDestLatitudeRef", ExifTag.GPSDestLatitudeRef },
        { "GPSDestLatitude", ExifTag.GPSDestLatitude },
        { "GPSDestLongitudeRef", ExifTag.GPSDestLongitudeRef },
        { "GPSDestLongitude", ExifTag.GPSDestLongitude },
        { "GPSDestBearingRef", ExifTag.GPSDestBearingRef },
        { "GPSDestBearing", ExifTag.GPSDestBearing },
        { "GPSDestDistanceRef", ExifTag.GPSDestDistanceRef },
        { "GPSDestDistance", ExifTag.GPSDestDistance },
        { "GPSProcessingMethod", ExifTag.GPSProcessingMethod },
        { "GPSAreaInformation", ExifTag.GPSAreaInformation },
        { "GPSDateStamp", ExifTag.GPSDateStamp },
        { "GPSDifferential", ExifTag.GPSDifferential }
    };
    
    public static ParsedTag ParseExifValue (string key, IExifValue exifValue)
    {
        if (StringToParsedTag.TryGetValue(key, out var func))
        {
            return func(exifValue); // Invoke the function with the provided IExifValue
        }
        return new ParsedTag(key, "Not parsed"); // Return null or a default ParsedTag if the key is not found
    }
    
    private static readonly Dictionary<string, Func<IExifValue, ParsedTag>> StringToParsedTag = new(StringComparer.OrdinalIgnoreCase)
    {                                                       
        { "ImageWidth", tag => tag.FromNumber("", "px")},
        { "ImageLength", tag => tag.FromNumber("", "px") },
        { "BitsPerSample", tag => tag.FromUshortArray(" ") },
        { "Compression", tag => tag.FromCompression() },
        { "PhotometricInterpretation", tag => tag.FromPhotometricInterpretation() },
        { "ImageDescription", tag => tag.FromAscii() },
        { "Make", tag => tag.FromAscii() },
        { "Model", tag => tag.FromAscii() },
        { "Orientation", tag => tag.FromOrientation()},
        { "SamplesPerPixel", tag => tag.FromNumber("","") },
        { "RowsPerStrip", tag => tag.FromNumber("", "")  },
        { "XResolution", tag => tag.FromRational("", "dpi", true) },
        { "YResolution", tag => tag.FromRational("", "dpi", true) },
        { "PlanarConfiguration", tag => tag.FromPlanarConfiguration() },
        { "ResolutionUnit", tag => tag.FromResolutionUnit() },
        { "Software", tag => tag.FromAscii()},
        { "DateTime", tag => tag.FromAscii() },
        { "Artist", tag => tag.FromAscii() },
        { "WhitePoint", tag => tag.FromRationalArray(" ") },
        { "JPEGInterchangeFormat", tag => tag.FromNumber("","") },
        { "JPEGInterchangeFormatLength",tag => tag.FromNumber("","") },
        { "YCbCrCoefficients", tag => tag.FromRationalArray(", ") },
        { "YCbCrPositioning", tag => tag.FromYCbCrPositioning() },
        { "YCbCrSubsampling", tag => tag.FromYCbCrSubsampling() },
        { "ReferenceBlackWhite", tag => tag.FromRationalArray(", ") },
        { "CFAPattern2", tag => tag.FromUndefinedArray() },
        { "Copyright", tag => tag.FromAscii() },
        { "ExposureTime", tag => tag.FromRational("","sec", true) },
        { "FNumber", tag => tag.FromRational("f/","", true) },
        { "ExposureProgram", tag => tag.FromExposureProgram() },
        { "SpectralSensitivity", tag => tag.FromAscii()},
        { "ISOSpeedRatings", tag => tag.FromUshortArray(", ") },
        //{ "OECF", ExifTag.OECF },
        { "SensitivityType", tag => tag.FromSensitivityType() },
        { "StandardOutputSensitivity", tag => tag.FromNumber("","") },
        { "RecommendedExposureIndex", tag => tag.FromNumber("","") },
        { "ISOSpeed", tag => tag.FromNumber("","") },
        { "ISOSpeedLatitudeyyy", tag => tag.FromNumber("","") },
        { "ISOSpeedLatitudezzz", tag => tag.FromNumber("","") },
        { "ExifVersion", tag => tag.FromUndefinedArray() },
        { "DateTimeOriginal", tag => tag.FromAscii() },
        { "DateTimeDigitized", tag => tag.FromAscii()},
        { "OffsetTime", tag => tag.FromAscii() },
        { "OffsetTimeOriginal", tag => tag.FromAscii() },
        { "OffsetTimeDigitized", tag => tag.FromAscii() },
        { "ComponentsConfiguration", tag => tag.FromComponentConfiguration() },
        { "CompressedBitsPerPixel", tag => tag.FromRational("","",true)  },
        { "MeteringMode", tag => tag.FromMeteringMode() },
        { "LightSource", tag => tag.FromLightSource() },
        //{ "Flash", ExifTag.Flash },
        // { "FocalLength", ExifTag.FocalLength },
        // { "FlashEnergy2", ExifTag.FlashEnergy2 },
        // { "SpatialFrequencyResponse2", ExifTag.SpatialFrequencyResponse2 },
        // { "Noise", ExifTag.Noise },
        // { "FocalPlaneXResolution2", ExifTag.FocalPlaneXResolution2 },
        // { "FocalPlaneYResolution2", ExifTag.FocalPlaneYResolution2 },
        // { "FocalPlaneResolutionUnit2", ExifTag.FocalPlaneResolutionUnit2 },
        // { "ImageNumber", ExifTag.ImageNumber },
        // { "SecurityClassification", ExifTag.SecurityClassification },
        // { "ImageHistory", ExifTag.ImageHistory },
        // { "SubjectArea", ExifTag.SubjectArea },
        // { "ExposureIndex2", ExifTag.ExposureIndex2 },
        // { "TIFFEPStandardID", ExifTag.TIFFEPStandardID },
        // { "SensingMethod2", ExifTag.SensingMethod2 },
        // { "MakerNote", ExifTag.MakerNote},
        // { "UserComment", ExifTag.UserComment },
        // { "SubsecTime", ExifTag.SubsecTime },
        // { "SubsecTimeOriginal", ExifTag.SubsecTimeOriginal },
        // { "SubsecTimeDigitized", ExifTag.SubsecTimeDigitized },
        // { "AmbientTemperature", ExifTag.AmbientTemperature },
        // { "Humidity", ExifTag.Humidity },
        // { "Pressure", ExifTag.Pressure },
        // { "WaterDepth", ExifTag.WaterDepth },
        // { "Acceleration", ExifTag.Acceleration },
        // { "CameraElevationAngle", ExifTag.CameraElevationAngle },
        // { "FlashpixVersion", ExifTag.FlashpixVersion },
        // { "ColorSpace", ExifTag.ColorSpace },
        // { "PixelXDimension", ExifTag.PixelXDimension },
        // { "PixelYDimension", ExifTag.PixelYDimension },
        // { "RelatedSoundFile", ExifTag.RelatedSoundFile },
        // { "FlashEnergy", ExifTag.FlashEnergy },
        // { "SpatialFrequencyResponse", ExifTag.SpatialFrequencyResponse },
        // { "FocalPlaneXResolution", ExifTag.FocalPlaneXResolution },
        // { "FocalPlaneYResolution", ExifTag.FocalPlaneYResolution },
        // { "FocalPlaneResolutionUnit", ExifTag.FocalPlaneResolutionUnit },
        // { "SubjectLocation", ExifTag.SubjectLocation },
        // { "ExposureIndex", ExifTag.ExposureIndex },
        // { "SensingMethod", ExifTag.SensingMethod },
        // { "FileSource", ExifTag.FileSource },
        // { "SceneType", ExifTag.SceneType },
        // { "CFAPattern", ExifTag.CFAPattern },
        // { "CustomRendered", ExifTag.CustomRendered },
        // { "ExposureMode", ExifTag.ExposureMode },
        // { "WhiteBalance", ExifTag.WhiteBalance },
        // { "DigitalZoomRatio", ExifTag.DigitalZoomRatio },
        // { "FocalLengthIn35mmFilm", ExifTag.FocalLengthIn35mmFilm },
        // { "SceneCaptureType", ExifTag.SceneCaptureType },
        // { "GainControl", ExifTag.GainControl },
        // { "Saturation", ExifTag.Saturation },
        // { "Sharpness", ExifTag.Sharpness },
        // { "DeviceSettingDescription", ExifTag.DeviceSettingDescription },
        // { "SubjectDistanceRange", ExifTag.SubjectDistanceRange },
        // { "ImageUniqueID", ExifTag.ImageUniqueID },
        // { "OwnerName", ExifTag.OwnerName },
        // { "SerialNumber", ExifTag.SerialNumber },
        // { "LensSpecification", ExifTag.LensSpecification },
        // { "LensMake", ExifTag.LensMake },
        // { "LensModel", ExifTag.LensModel },
        // { "LensSerialNumber", ExifTag.LensSerialNumber },
        // { "GPSVersionID", ExifTag.GPSVersionID },
        // { "GPSLatitudeRef", ExifTag.GPSLatitudeRef },
        // { "GPSLatitude", ExifTag.GPSLatitude },
        // { "GPSLongitudeRef", ExifTag.GPSLongitudeRef },
        // { "GPSLongitude", ExifTag.GPSLongitude },
        // { "GPSAltitudeRef", ExifTag.GPSAltitudeRef },
        // { "GPSAltitude", ExifTag.GPSAltitude },
        // { "GPSTimestamp", ExifTag.GPSTimestamp },
        // { "GPSSatellites", ExifTag.GPSSatellites },
        // { "GPSStatus", ExifTag.GPSStatus },
        // { "GPSMeasureMode", ExifTag.GPSMeasureMode },
        // { "GPSDOP", ExifTag.GPSDOP },
        // { "GPSSpeedRef", ExifTag.GPSSpeedRef },
        // { "GPSSpeed", ExifTag.GPSSpeed },
        // { "GPSTrackRef", ExifTag.GPSTrackRef },
        // { "GPSTrack", ExifTag.GPSTrack },
        // { "GPSImgDirectionRef", ExifTag.GPSImgDirectionRef },
        // { "GPSImgDirection", ExifTag.GPSImgDirection },
        // { "GPSMapDatum", ExifTag.GPSMapDatum },
        // { "GPSDestLatitudeRef", ExifTag.GPSDestLatitudeRef },
        // { "GPSDestLatitude", ExifTag.GPSDestLatitude },
        // { "GPSDestLongitudeRef", ExifTag.GPSDestLongitudeRef },
        // { "GPSDestLongitude", ExifTag.GPSDestLongitude },
        // { "GPSDestBearingRef", ExifTag.GPSDestBearingRef },
        // { "GPSDestBearing", ExifTag.GPSDestBearing },
        // { "GPSDestDistanceRef", ExifTag.GPSDestDistanceRef },
        // { "GPSDestDistance", ExifTag.GPSDestDistance },
        // { "GPSProcessingMethod", ExifTag.GPSProcessingMethod },
        // { "GPSAreaInformation", ExifTag.GPSAreaInformation },
        // { "GPSDateStamp", ExifTag.GPSDateStamp },
        // { "GPSDifferential", ExifTag.GPSDifferential }
    };



}