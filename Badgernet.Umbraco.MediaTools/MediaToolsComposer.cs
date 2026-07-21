using Badgernet.Umbraco.MediaTools.Configurations;
using Badgernet.Umbraco.MediaTools.Handlers;
using Badgernet.Umbraco.MediaTools.Helpers;
using Badgernet.Umbraco.MediaTools.Services.FileManager;
using Badgernet.Umbraco.MediaTools.Services.ImageProcessing;
using Badgernet.Umbraco.MediaTools.Services.ImageProcessing.Metadata;
using Badgernet.Umbraco.MediaTools.Services.Settings;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Api.Common.OpenApi;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Configuration;
using Umbraco.Cms.Core.Notifications;

namespace Badgernet.Umbraco.MediaTools;

public class MediaToolsComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        
        var umbVersion = builder.Services.BuildServiceProvider().GetRequiredService<IUmbracoVersion>().Version;
        
        // Register the transformer
        builder.Services.AddTransient<MediaToolsOperationIdTransformer>();

        //Register your custom OpenApi Document
        builder.AddBackOfficeOpenApiDocument(
            
            "mediatools", // Group name
            document => document
                .WithTitle("Badgernet Mediatools")
                .ConfigureOpenApiOptions(options =>
                {
                    
                    options.AddDocumentTransformer((doc, context, cancellationToken) =>
                    {
                        doc.Info.Version = "Latest";
                        doc.Info.Description = "Automatic media resizing and converting";
                        return Task.CompletedTask;
                    });

                    // Custom OperationId transformer
                    options.AddOperationTransformer<MediaToolsOperationIdTransformer>();
                })
        );

        builder.Services.AddScoped<IMediaHelper, MediaHelper>();
        
        builder.Services.AddSingleton<IFileManager, FileManager>();
        builder.Services.AddSingleton<IImageProcessor, ImageProcessor>(); 
        builder.Services.AddSingleton<IMetadataProcessor, MetadataProcessor>(); 

        builder.Services.AddSingleton<ISettingsService>(x =>
        {
            var settingsFolder = Path.Combine(Environment.CurrentDirectory, "App_Plugins", "Badgernet.Umbraco.MediaTools", "Settings");
            var logger = x.GetRequiredService<ILogger<ISettingsService>>();
            return new SettingsService(settingsFolder, logger);

        });

        builder.AddNotificationAsyncHandler<MediaSavedNotification, MediaToolsUploadHandler>();
        

    }
}
