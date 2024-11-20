using Badgernet.Umbraco.MediaTools.Models;
using Umbraco.Cms.Core.Models.PublishedContent;

namespace Badgernet.Umbraco.MediaTools.Helpers;

public static class ExtensionMethods
{
    /// <summary>
    /// Converts file size to human-readable representation. 
    /// </summary>
    /// <param name="bytes">File size (long)</param>
    /// <param name="binary">"true" for binary, "false" for decimal conversion</param>
    /// <param name="decimalPlaces">Number of decimal places</param>
    /// <returns></returns>
    public static string ToReadableFileSize(long bytes, bool binary = true, int decimalPlaces = 1)
    {
        // Define the threshold based on SI (1000) or binary (1024) mode.
        var threshold = binary ? 1024 : 1000;

        // If the bytes value is less than the threshold, return the value in bytes.
        if (Math.Abs(bytes) < threshold)
        {
            return bytes + " B";
        }

        // Define the units based on SI or binary.
        string[] units = binary 
            ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
            : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];

        // Variable to keep track of which unit to use.
        var u = -1;
        var r = Math.Pow(10, decimalPlaces);
        var numBytes = bytes;

        // Loop to divide the bytes by the threshold until it's small enough to fit within the unit.
        do
        {
            numBytes /= threshold;
            u++;
        } while (Math.Round(Math.Abs(numBytes) * r) / r >= threshold && u < units.Length - 1);

        // Return the formatted string with the selected unit.
        return numBytes.ToString("F" + decimalPlaces) + " " + units[u];
    }

    /// <summary>
    /// Converts collection of IPublishedContent in collection of ImageMediaDto
    /// </summary>
    /// <param name="publishedContent">Collection to convert</param>
    /// <returns>Returned collection</returns>
    public static IEnumerable<ImageMediaDto> ToImageMediaDto (this IEnumerable<IPublishedContent> publishedContent)
    {
        var result = new List<ImageMediaDto>();

        foreach (var contentItem in publishedContent)
        {
            try
            {
                result.Add(new ImageMediaDto
                {
                    Id =contentItem.Id,
                    Name = contentItem.Name,
                    Path = contentItem.GetProperty("UmbracoFile")?.GetValue("Src")?.ToString() ?? string.Empty,
                    Width = Convert.ToInt32(contentItem.GetProperty("umbracoWidth")?.GetValue() ?? 0),
                    Height = Convert.ToInt32(contentItem.GetProperty("umbracoHeight")?.GetValue() ?? 0),
                    Extension = (string) (contentItem.GetProperty("umbracoExtension")?.GetValue() ?? string.Empty),
                    Size = ToReadableFileSize(Convert.ToInt64(contentItem.GetProperty("umbracoBytes")?.GetValue() ?? 0)) 
                });
            }
            catch
            {
                // ignored
            }
        }

        return result;
    }


    /// <summary>
    /// Replaces stream content and sets position to 0. 
    /// </summary>
    /// <param name="stream">Stream to be overwritten</param>
    /// <param name="sourceStream">Stream to be copied</param>
    public static void ClearAndReassign(this MemoryStream stream, MemoryStream sourceStream)
    {
        stream.Position = 0;
        stream.SetLength(0);
        sourceStream.CopyTo(stream);
        stream.Position = 0;
    }
}
