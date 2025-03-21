using Badgernet.Umbraco.MediaTools.Configurations;
using Badgernet.Umbraco.MediaTools.Handlers;
using Badgernet.Umbraco.MediaTools.Helpers;
using Badgernet.Umbraco.MediaTools.Services.FileManager;
using Badgernet.Umbraco.MediaTools.Services.ImageProcessing;
using Badgernet.Umbraco.MediaTools.Services.ImageProcessing.Metadata;
using Badgernet.Umbraco.MediaTools.Services.Settings;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Configuration;
using Umbraco.Cms.Core.Notifications;

namespace Badgernet.Umbraco.MediaTools;

public class MediaToolsComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        
        var umbVersion = builder.Services.BuildServiceProvider().GetRequiredService<IUmbracoVersion>().Version;

        switch (umbVersion.Major)
        {
            case 14:
                builder.Services.AddSingleton<IMediaHelper, MediaHelper>();
                break;
            case 15:
                builder.Services.AddSingleton<IMediaHelper, MediaHelperV15>();
                break;

            default:
                throw new Exception("Badgernet.MediaTools -> Unsupported Umbraco Version"); 
        }
        
        builder.Services.ConfigureOptions<ConfigureSwaggerGenOptions>();
        builder.Services.AddSingleton<IFileManager, FileManager>();
        builder.Services.AddSingleton<IImageProcessor, ImageProcessor>(); 
        builder.Services.AddSingleton<IMetadataProcessor, MetadataProcessor>(); 

        builder.Services.AddSingleton<ISettingsService>(x =>
        {
            var settingsFolder = Path.Combine(Environment.CurrentDirectory, "App_Plugins", "Badgernet.Umbraco.MediaTools", "Settings");
            var logger = x.GetRequiredService<ILogger<ISettingsService>>();
            return new SettingsService(settingsFolder, logger);

        });

        builder.AddNotificationHandler<MediaSavingNotification, MediaToolsUploadHandler>();

    }
}
