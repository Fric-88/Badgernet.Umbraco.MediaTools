using Microsoft.AspNetCore.OpenApi;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi;

namespace Badgernet.Umbraco.MediaTools.Configurations;

internal class ConfigureOpenApiOptions : IConfigureNamedOptions<OpenApiOptions>
{
    public void Configure(string? name, OpenApiOptions options)
    {
        // Only apply these transformers to your specific document
        if (name == "mediatools")
        {
            // 1. Replaces options.SwaggerDoc(...)
            options.AddDocumentTransformer((document, context, cancellationToken) =>
            {
                document.Info = new OpenApiInfo
                {
                    Title = "Badgernet Mediatools",
                    Version = "Latest",
                    Description = "Automatic media resizing and converting"
                };
                
                return Task.CompletedTask;
            });

            // 2. Replaces options.OperationFilter<...>()
            options.AddOperationTransformer<MediaToolsOperationIdTransformer>();
        }
    }

    public void Configure(OpenApiOptions options) 
        => Configure(Options.DefaultName, options);
}