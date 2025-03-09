using System.Diagnostics;
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
using SixLabors.ImageSharp.Metadata;
using SixLabors.ImageSharp.Metadata.Profiles.Exif;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Web;
using ImageMetadata = SixLabors.ImageSharp.Metadata.ImageMetadata;

namespace Badgernet.Umbraco.MediaTools.Services.ImageProcessing;

public class ImageProcessor(ILogger<ImageProcessor> logger) : IImageProcessor
{
    
    public MemoryStream? Resize(MemoryStream imageStream, Size targetResolution)
    {
        try
        {
            using var img = Image.Load(imageStream);
            var format = img.Metadata.DecodedImageFormat ?? throw new Exception("No image Format found");

            img.Mutate(x =>
            {
                x.AutoOrient();
                x.Resize(targetResolution.Width, targetResolution.Height);
            });
            
            img.Metadata.HorizontalResolution = img.Width;
            img.Metadata.VerticalResolution = img.Height;
            img.Metadata.ExifProfile?.SetValue(ExifTag.ImageWidth, img.Width);
            img.Metadata.ExifProfile?.SetValue(ExifTag.ImageLength, img.Height );
            img.Metadata.ExifProfile?.SetValue(ExifTag.PixelXDimension, img.Width);
            img.Metadata.ExifProfile?.SetValue(ExifTag.PixelYDimension, img.Height);
            
        
            
            var resizedStream = new MemoryStream();
            img.Save(resizedStream, format);
            resizedStream.Position = 0;

            return resizedStream;
        }
        catch (Exception e)
        {
            logger.LogError("Error resizing image file: {Message}", e.Message);
            return null;
        }
    }
    public MemoryStream? ConvertToWebp(MemoryStream imageStream, ConvertMode convertMode, int convertQuality)
    {
        var encoder = new WebpEncoder
            {
                Quality = convertQuality,
                FileFormat = convertMode == ConvertMode.Lossless ? WebpFileFormatType.Lossless : WebpFileFormatType.Lossy
            };

        try
        {
            using var img = Image.Load(imageStream);
            img.Mutate(x => x.AutoOrient() );

            
            var converted = new MemoryStream();
            
            img.Save(converted, encoder);

            converted.Position = 0;

            return converted;
        }
        catch (Exception e)
        {
            logger.LogError("Error converting image file: {Message}", e.Message);
            return null;
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
    public ImageEncoder GetEncoder(string filePath)
    {
        var extension = Path.GetExtension(filePath).ToLower();

        return extension switch
        {
            ".pbm" => new PbmEncoder(),
            ".png" => new PngEncoder(),
            ".gif" => new GifEncoder(),
            ".qoi" => new QoiEncoder(),
            ".tga" => new TgaEncoder(),
            ".jpg" => new JpegEncoder(),
            ".jpeg" => new JpegEncoder(),
            ".bmp" => new BmpEncoder(),
            ".tiff" => new TiffEncoder(),
            _ => new WebpEncoder()
        };
        ;
    }

}
