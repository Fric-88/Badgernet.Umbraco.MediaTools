namespace Badgernet.Umbraco.MediaTools.Models;

public class UserSettingsDto
{
    public bool ResizerEnabled { get; set; } = false;
    public bool ConverterEnabled { get; set; } = true;
    public  ConvertMode ConvertMode { get; set; } = ConvertMode.lossy;
    public int ConvertQuality { get; set; } = 80;
    public bool IgnoreAspectRatio { get; set; } = false;
    public int TargetWidth { get; set; } = 1920;
    public int TargetHeight { get; set; } = 1080;
    public bool KeepOriginals { get; set; } = false;
    public string IgnoreKeyword {get;set;} = "ignoreme";
    
    public MetadataRemoverExceptions MetadataRemoverExceptions { get; set; } = new MetadataRemoverExceptions();

}

public enum ConvertMode
{
    lossy,
    lossless
}

public class MetadataRemoverExceptions
{
    public bool DateTime { get; set; } = false;
    public bool CameraInfo { get; set; } = false;
    public bool GpsInfo { get; set; } = false;
    public bool AuthorCopyright { get; set; } = true;
} 

