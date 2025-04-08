namespace Badgernet.Umbraco.MediaTools.Models;

public record struct ImageMediaDto()
{
        public int Id { get; init; } = 0;
        public string Name { get; init; } = string.Empty;
        public int Width { get; init; } = 0;
        public int Height { get; init; } = 0;
        public string Extension { get; init; } = string.Empty;
        public string Path {get; init;} = string.Empty;
        public string Size { get; init; } = "0";
}
