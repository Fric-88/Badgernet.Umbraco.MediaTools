namespace Badgernet.Umbraco.MediaTools.Models;

public record struct OperationResponse
{
    public OperationResponse(ResponseStatus status, string message, object? payload = null)
    {
        Status = status;
        Message = message;
        Payload = payload;
    }
    
    public ResponseStatus Status { get; set; } = ResponseStatus.Success;
    public string Message {get;set;} = string.Empty;
    public object? Payload {get; set;} = null;
}