using System.Text.Json.Serialization;

namespace Badgernet.Umbraco.MediaTools.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ResponseStatus
{
    Success, 
    Error,
    Skipped, 
    Warning 
}