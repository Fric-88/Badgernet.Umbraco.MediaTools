using Badgernet.Umbraco.MediaTools.Models;

namespace Badgernet.Umbraco.MediaTools.Services.Settings;

public interface ISettingsService
{
    UserSettingsDto GetUserSettings(string userKey);
    bool SaveUserSettings(string userKey, UserSettingsDto settings);
}
