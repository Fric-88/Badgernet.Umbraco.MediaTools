using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace Badgernet.Umbraco.MediaTools.Configurations;

internal class MediaToolsOperationIdTransformer : IOpenApiOperationTransformer
{
    public Task TransformAsync(OpenApiOperation operation, OpenApiOperationTransformerContext context, CancellationToken cancellationToken)
    {
        // Only rewrite OperationId for the "mediatools" group
        if (!string.Equals(context.Description.GroupName, "mediatools", StringComparison.OrdinalIgnoreCase))
        {
            return Task.CompletedTask;
        }

        var action = context.Description.ActionDescriptor.RouteValues.TryGetValue("action", out var name) ? name : null;

        if (!string.IsNullOrWhiteSpace(action))
        {
            operation.OperationId = action;
        }

        return Task.CompletedTask;
    }
}