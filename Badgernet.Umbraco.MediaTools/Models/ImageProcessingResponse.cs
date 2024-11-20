namespace Badgernet.Umbraco.MediaTools.Models;

public class ImageProcessingResponse
{
    public ResponseStatus Status {get;set;} = ResponseStatus.Success;
    public string Message {get;set;} = string.Empty;
    public object? Payload {get; set;}
}

public enum ResponseStatus { Success, Error, Skipped, Warning }


