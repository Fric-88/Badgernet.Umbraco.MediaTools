using Asp.Versioning;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Core.PropertyEditors.ValueConverters;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Extensions;
using Badgernet.Umbraco.MediaTools.Core.Services.Settings;
using Umbraco.Cms.Core.IO;


namespace Badgernet.Umbraco.MediaTools.Core.Controllers;

[ApiVersion("1.0")]
[ApiExplorerSettings(GroupName = "mediatools")]
public class SettingsController(ISettingsService settingsService) : ControllerBase
{
    private readonly ISettingsService _settingsService = settingsService;
    
    private UserSettingsDto? _currentSettings;

    [HttpGet("settings/get")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(UserSettingsDto))]
    public IActionResult GetSettings(string userKey)
    {
        _currentSettings ??= _settingsService.GetUserSettings(userKey);
        _currentSettings ??= new UserSettingsDto();//Create default settings

        return Ok(_currentSettings);
    }

    [HttpPost("settings/set")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult SetSettings(string userKey, UserSettingsDto settings)
    {
        _settingsService.SaveUserSettings(userKey, settings);
        _currentSettings = settings;
        return Ok();

        
    }
}




