namespace Badgernet.Umbraco.MediaTools.Models;

public class ImageMediaDto
{
        public int Id { get; init; }
        public string Name { get; init; } = string.Empty;
        public int Width { get; init; }
        public int Height { get; init; }
        public string Extension { get; init; } = string.Empty;
        public string Path {get; init;} = string.Empty;
        public string Size { get; init; } = "0";
}
