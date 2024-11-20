using System;
using Umbraco.Cms.Core.Services;

namespace Badgernet.Umbraco.MediaTools.Core.Services.Settings;

public interface ISettingsService
{
    UserSettingsDto GetUserSettings(string userKey);
    bool SaveUserSettings(string userKey, UserSettingsDto settings);
}
