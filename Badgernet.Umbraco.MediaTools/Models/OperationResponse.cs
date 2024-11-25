namespace Badgernet.Umbraco.MediaTools.Models;

public class OperationResponse
{
    public OperationResponse()
    {
    }

    public OperationResponse(ResponseStatus status, string message, object? payload = null)
    {
        this.Status = status;
        this.Message = message;
        this.Payload = payload;
    }
    
    public ResponseStatus Status { get; set; } = ResponseStatus.Success;
    public string Message {get;set;} = string.Empty;
    public object? Payload {get; set;}
}