using Badgernet.Umbraco.MediaTools.Core.Services.FileManager;
using Badgernet.Umbraco.MediaTools.Core.Services.ImageProcessing;
using Badgernet.Umbraco.MediaTools.Core.Services.Settings;
using Badgernet.WebPicAuto.Helpers;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Notifications;


namespace Badgernet.Umbraco.MediaTools.Core;

public class MediaToolsComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.ConfigureOptions<ConfigureSwaggerGenOptions>();
        builder.Services.AddSingleton<IMediaHelper, MediaHelper>();
        builder.Services.AddSingleton<IFileManager, FileManager>();
        builder.Services.AddSingleton<IImageProcessor, ImageProcessor>(); 

        builder.Services.AddSingleton<ISettingsService>(x =>
        {
            var settingsFolder = Path.Combine(Environment.CurrentDirectory, "App_Plugins", "Badgernet.Umbraco.MediaTools", "Settings");
            var logger = x.GetRequiredService<ILogger<ISettingsService>>();
            return new SettingsService(settingsFolder, logger);

        });

        builder.AddNotificationHandler<MediaSavingNotification, MediaToolsUploadHandler>();

    }
}
