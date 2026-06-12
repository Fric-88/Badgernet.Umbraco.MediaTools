namespace Badgernet.Umbraco.MediaTools.Services.FileManager;

public interface IFileManager
{
    bool ReadToStream(string relativePath, MemoryStream stream, bool overwrite = true);
    Task<bool> ReadToStreamAsync(string relativePath, MemoryStream stream, bool overwrite = true);
    bool WriteFile(string relativePath, Stream fileStream);
    Task<bool> WriteFileAsync(string relativePath, Stream fileStream);
    bool DeleteFile(string relativePath);
    bool FileExists(string relativePath);
    string GetFreePath(string relativePath, string targetExtension = "");
    long CompareFileSize(string referenceRelativePath, string relativePath);
}
