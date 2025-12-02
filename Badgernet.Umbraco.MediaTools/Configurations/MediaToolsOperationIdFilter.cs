using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Badgernet.Umbraco.MediaTools.Configurations;

internal class MediaToolsOperationIdFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        // Only rewrite OperationId for the "mediatools" group
        if (!string.Equals(context.ApiDescription.GroupName, "mediatools", StringComparison.OrdinalIgnoreCase))
            return;

        var action = context.ApiDescription.ActionDescriptor.RouteValues.TryGetValue("action", out var name) ? name : null;

        if (!string.IsNullOrWhiteSpace(action))
            operation.OperationId = action;
    }
}
