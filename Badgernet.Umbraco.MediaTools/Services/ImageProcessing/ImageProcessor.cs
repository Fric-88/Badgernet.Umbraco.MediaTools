using Badgernet.Umbraco.MediaTools.Models;
using Microsoft.Extensions.Logging;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats;
using SixLabors.ImageSharp.Formats.Bmp;
using SixLabors.ImageSharp.Formats.Gif;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Formats.Pbm;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Formats.Qoi;
using SixLabors.ImageSharp.Formats.Tga;
using SixLabors.ImageSharp.Formats.Tiff;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Metadata.Profiles.Exif;
using SixLabors.ImageSharp.Processing;


namespace Badgernet.Umbraco.MediaTools.Services.ImageProcessing;

public class ImageProcessor(ILogger<ImageProcessor> logger) : IImageProcessor
{
    
    public bool Resize(Image image, Size targetResolution)
    {
        try
        {
            var format = image.Metadata.DecodedImageFormat ?? throw new Exception("No image Format found");

            image.Mutate(x =>
            {
                x.AutoOrient();
                x.Resize(targetResolution.Width, targetResolution.Height);
            });
            
            image.Metadata.HorizontalResolution = image.Width;
            image.Metadata.VerticalResolution = image.Height;
            image.Metadata.ExifProfile?.SetValue(ExifTag.ImageWidth, image.Width);
            image.Metadata.ExifProfile?.SetValue(ExifTag.ImageLength, image.Height );
            image.Metadata.ExifProfile?.SetValue(ExifTag.PixelXDimension, image.Width);
            image.Metadata.ExifProfile?.SetValue(ExifTag.PixelYDimension, image.Height);

            return true;
        }
        catch (Exception e)
        {
            logger.LogError("Error resizing image file: {Message}", e.Message);
            return false;
        }
    }
    public bool ConvertToWebp(Image image, ConvertMode convertMode, int convertQuality)
    {
        var encoder = new WebpEncoder
            {
                Quality = convertQuality,
                FileFormat = convertMode == ConvertMode.Lossless ? WebpFileFormatType.Lossless : WebpFileFormatType.Lossy
            };

        try
        {
            image.Mutate(x => x.AutoOrient() );

            using var converted = new MemoryStream();
            image.Save(converted, encoder);
            converted.Position = 0; 
            image = Image.Load(converted);

            return true;
        }
        catch (Exception e)
        {
            logger.LogError("Error converting image file: {Message}", e.Message);
            return false;
        }

    }
    public Size CalculateResolution(Size originalResolution, Size targetResolution, bool preserveAspectRatio = true)
        {
            if (!preserveAspectRatio)
            {
                return targetResolution;
            }

            double aspectRatio = (double)originalResolution.Width / originalResolution.Height;
            var newWidth = targetResolution.Width;
            var newHeight = (int)(newWidth / aspectRatio);

            if (newHeight > targetResolution.Height)
            {
                newHeight = targetResolution.Height;
                newWidth = (int)(newHeight * aspectRatio);
            }

            return new Size(newWidth, newHeight);
        }
    public ImageEncoder GetEncoder(string filePath, bool skipMetadata = false)
    {
        var extension = Path.GetExtension(filePath).ToLower();

        return extension switch
        {
            ".pbm" => new PbmEncoder(){SkipMetadata = skipMetadata},
            ".png" => new PngEncoder(){SkipMetadata = skipMetadata},
            ".gif" => new GifEncoder(){SkipMetadata = skipMetadata},
            ".qoi" => new QoiEncoder(){SkipMetadata = skipMetadata},
            ".tga" => new TgaEncoder(){SkipMetadata = skipMetadata},
            ".jpg" => new JpegEncoder(){SkipMetadata = skipMetadata},
            ".jpeg" => new JpegEncoder(){SkipMetadata = skipMetadata},
            ".bmp" => new BmpEncoder(){SkipMetadata = skipMetadata},
            ".tiff" => new TiffEncoder(){SkipMetadata = skipMetadata},
            _ => new WebpEncoder(){SkipMetadata = skipMetadata}
        };
        ;
    }

}
