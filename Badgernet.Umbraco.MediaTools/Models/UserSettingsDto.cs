namespace Badgernet.Umbraco.MediaTools.Models;

public class UserSettingsDto
{
    public ResizerSettings Resizer { get; init; } = new();
    public ConverterSettings Converter { get; init; } = new();
    public MetadataRemoverSettings MetadataRemover { get; init; } = new();
    public GeneralSettings General { get; init; } = new();

}

public class ResizerSettings
{
    public bool Enabled { get; init; } = false;
    public bool IgnoreAspectRatio { get; init; } = false;
    public int TargetWidth { get; init; } = 1920;
    public int TargetHeight { get; init; } = 1080;
}

public class ConverterSettings
{
    public bool Enabled { get; init; } = false;
    public  ConvertMode ConvertMode { get; init; } = ConvertMode.Lossy;
    public int ConvertQuality { get; init; } = 80;
}

public class GeneralSettings
{
    public bool KeepOriginals { get; init; } = false;
    public string IgnoreKeyword {get; init;} = "ignoreme";
}

public class MetadataRemoverSettings
{
    public bool Enabled { get; init; } = false;
    public bool RemoveDateTime { get; init; } = true;
    public bool RemoveCameraInfo { get; init; } = true;
    public bool RemoveGpsInfo { get; init; } = true;
    public bool RemoveShootingSituationInfo { get; init; } = false;
    public bool RemoveXmpProfile { get; init; } = false;
    public bool RemoveIptcProfile { get; init; } = false;
    public HashSet<string> MetadataTagsToRemove { get; init; } = [];

} 

public enum ConvertMode
{
    Lossy,
    Lossless
}

