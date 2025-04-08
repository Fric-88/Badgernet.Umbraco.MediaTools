using Asp.Versioning;
using Badgernet.Umbraco.MediaTools.Models;
using Badgernet.Umbraco.MediaTools.Services.Settings;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Badgernet.Umbraco.MediaTools.Controllers;

[ApiVersion("1.0")]
[ApiExplorerSettings(GroupName = "mediatools")]
[Route("settings")]
public class SettingsController(ISettingsService settingsService) : ControllerBase
{
    private UserSettingsDto? _currentSettings;

    [HttpGet("get-settings")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(UserSettingsDto))]
    public IActionResult GetSettings(string userKey)
    {
        _currentSettings ??= settingsService.GetUserSettings(userKey);
        _currentSettings ??= new UserSettingsDto();//Create default settings

        return Ok(_currentSettings);
    }

    [HttpPost("set-settings")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult SetSettings(string userKey, UserSettingsDto settings)
    {
        settingsService.SaveUserSettings(userKey, settings);
        _currentSettings = settings;
        return Ok();

        
    }
}




