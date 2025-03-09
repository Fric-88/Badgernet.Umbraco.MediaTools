using System.Text;
using Badgernet.Umbraco.MediaTools.Models;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats;
using SixLabors.ImageSharp.Metadata;

namespace Badgernet.Umbraco.MediaTools.Services.ImageProcessing;

public interface IImageProcessor
{
    MemoryStream? Resize(MemoryStream imageStream, Size targetTResolution);
    MemoryStream? ConvertToWebp(MemoryStream imageStream, ConvertMode convertMode, int convertQuality);
    Size CalculateResolution(Size originalResolution, Size targetResolution, bool preserveAspectRatio = true);
    ImageEncoder GetEncoder(string filePath);
}
