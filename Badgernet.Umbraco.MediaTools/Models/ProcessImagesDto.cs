using System;

namespace Badgernet.Umbraco.MediaTools.Core.Models;

public class ProcessImagesDto
{
    public int[] Ids { get; set; } = [];
    public bool Resize { get; set; } = false;
    public bool Convert { get; set; } = false;
    public ResizeMode ResizeMode { get; set; } = ResizeMode.FitInside;
    public int Width { get; set; } = 1920;
    public int Height { get; set; } = 1080;
    public ConvertMode ConvertMode { get; set; } = ConvertMode.lossy;
    public int ConvertQuality { get; set; } = 85;
}

public enum ResizeMode
{
    FitInside,
    ExactSize
}