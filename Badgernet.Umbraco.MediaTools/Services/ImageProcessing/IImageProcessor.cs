using Badgernet.Umbraco.MediaTools.Models;
using SixLabors.ImageSharp;

namespace Badgernet.Umbraco.MediaTools.Services.ImageProcessing;

public interface IImageProcessor
{
    MemoryStream? Resize(MemoryStream imageStream, Size targetTResolution);
    MemoryStream? ConvertToWebp(MemoryStream imageStream, ConvertMode convertMode, int convertQuality);
    Size CalculateResolution(Size originalResolution, Size targetResolution, bool preserveAspectRatio = true);

}
