using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Org.BouncyCastle.Math.EC.Rfc7748;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;
using Umbraco.Cms.Infrastructure.Scoping;


namespace Badgernet.Umbraco.MediaTools.Core.Services.Settings;

public class SettingsService : ISettingsService
{
    private readonly string _settingsFolder;
    private readonly ILogger<ISettingsService> _logger;

    public SettingsService(string settingsFolder, ILogger<ISettingsService> logger)
    {
        _settingsFolder = settingsFolder;
        _logger = logger;

        try
        {
            Directory.CreateDirectory(_settingsFolder);
        }
        catch (Exception ex)
        {
            logger.LogError("Could not create settings directory: {Message}", ex.Message);
        }
    }


    public UserSettingsDto GetUserSettings(string userKey)
    {
        var settingsFilePath = Path.Combine(_settingsFolder, Path.ChangeExtension(userKey, ".json"));

        // Return default settings
        if (!File.Exists(settingsFilePath)) 
            return new UserSettingsDto(); 

        try
        {
            // Open the file for reading with shared read access, no need for external locking
            using var fStream = File.Open(settingsFilePath, FileMode.Open, FileAccess.Read, FileShare.Read);
            using var streamReader = new StreamReader(fStream, Encoding.UTF8);
            
            var jsonString = streamReader.ReadToEnd();

            // Deserialize the JSON string into SettingsDto, return defaults if deserialization fails
            return JsonSerializer.Deserialize<UserSettingsDto>(jsonString) ?? new UserSettingsDto();
        }
        catch
        {
            // Return default settings in case of any exception
            return new UserSettingsDto();
        }

    }

    public bool SaveUserSettings(string userKey, UserSettingsDto settings)
    {
        try
        {
            var settingsFilePath = Path.Combine(_settingsFolder, Path.ChangeExtension(userKey, ".json"));
            var jsonString = JsonSerializer.Serialize(settings);

            using var fStream = File.Open(settingsFilePath, FileMode.Create, FileAccess.Write, FileShare.Read);
            using var streamWriter = new StreamWriter(fStream, Encoding.UTF8);
            streamWriter.Write(jsonString);

            return true;
        }
        catch(Exception e)
        {
            _logger.LogError("Saving user settings failed: {Message}", e.Message);
            return false;
        }
    }
}
