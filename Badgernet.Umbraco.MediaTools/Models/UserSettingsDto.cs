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
    public bool Enabled { get; init; } = true;
    public bool RemoveDateTime { get; set; } = true;
    public bool RemoveCameraInfo { get; set; } = true;
    public bool RemoveGpsInfo { get; set; } = true;
    public bool RemoveShootingSituationInfo { get; set; } = false;
    public HashSet<string> MetadataTagsToRemove { get; init; } = new();
} 

public enum ConvertMode
{
    Lossy,
    Lossless
}

