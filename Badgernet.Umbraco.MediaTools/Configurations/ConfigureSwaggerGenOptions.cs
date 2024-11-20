using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Badgernet.Umbraco.MediaTools.Configurations;

internal class ConfigureSwaggerGenOptions : IConfigureOptions<SwaggerGenOptions>

{
    public void Configure(SwaggerGenOptions options){
        options.SwaggerDoc(
            "mediatools",
            new OpenApiInfo
            {
                Title = "Badgernet Mediatools",
                Version = "Latest",
                Description = "Automatic media resizing and converting"
            });

        

        // sets the operation Ids to be the same as the action
        // so it loses all the v1... bits to the names.
        options.CustomOperationIds(e => $"{e.ActionDescriptor.RouteValues["action"]}");
    }

}

