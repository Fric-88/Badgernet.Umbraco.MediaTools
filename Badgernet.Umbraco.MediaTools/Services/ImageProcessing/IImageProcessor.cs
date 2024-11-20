using System;
using System.Text;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats;

namespace Badgernet.Umbraco.MediaTools.Core.Services.ImageProcessing;

public interface IImageProcessor
{
    MemoryStream? Resize(MemoryStream imageStream, Size targetTResolution);
    MemoryStream? ConvertToWebp(MemoryStream imageStream, ConvertMode convertMode, int convertQuality);
    Size CalculateResolution(Size originalResolution, Size targetResolution, bool preserveAspectRatio = true);

}
