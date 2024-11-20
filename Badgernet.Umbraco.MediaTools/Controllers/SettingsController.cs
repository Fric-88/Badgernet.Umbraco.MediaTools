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
    private readonly ISettingsService _settingsService = settingsService;
    
    private UserSettingsDto? _currentSettings;

    [HttpGet("get")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(UserSettingsDto))]
    public IActionResult GetSettings(string userKey)
    {
        _currentSettings ??= _settingsService.GetUserSettings(userKey);
        _currentSettings ??= new UserSettingsDto();//Create default settings

        return Ok(_currentSettings);
    }

    [HttpPost("set")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult SetSettings(string userKey, UserSettingsDto settings)
    {
        _settingsService.SaveUserSettings(userKey, settings);
        _currentSettings = settings;
        return Ok();

        
    }
}




