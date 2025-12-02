using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Badgernet.Umbraco.MediaTools.Configurations;

internal class ConfigureSwaggerGenOptions : IConfigureOptions<SwaggerGenOptions>
{
    public void Configure(SwaggerGenOptions options)
    {
        options.SwaggerDoc(
            "mediatools",
            new OpenApiInfo
            {
                Title = "Badgernet Mediatools",
                Version = "Latest",
                Description = "Automatic media resizing and converting"
            });

        // Add our scoped operation-id logic:
        options.OperationFilter<MediaToolsOperationIdFilter>();
    }
}

