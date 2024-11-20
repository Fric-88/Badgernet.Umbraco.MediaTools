namespace Badgernet.Umbraco.MediaTools.Models;

public class RecycleMediaResponse
{
    public ResponseStatus Status { get; set; } = ResponseStatus.Skipped;
    public string Message {get; set;} = string.Empty;
    public object? Payload {get; set;}
}

