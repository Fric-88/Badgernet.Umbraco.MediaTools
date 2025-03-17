using System.Text;
using Badgernet.Umbraco.MediaTools.Models;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats;
using SixLabors.ImageSharp.Metadata;

namespace Badgernet.Umbraco.MediaTools.Services.ImageProcessing;

public interface IImageProcessor
{
    bool Resize(Image image, Size targetTResolution);
    bool ConvertToWebp(Image image, ConvertMode convertMode, int convertQuality);
    Size CalculateResolution(Size originalResolution, Size targetResolution, bool preserveAspectRatio = true);
    ImageEncoder GetEncoder(string filePath);
}
