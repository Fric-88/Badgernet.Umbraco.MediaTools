using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Api.Common.Attributes;
using Umbraco.Cms.Api.Management.Controllers;
using Umbraco.Cms.Web.Common.Authorization;
using Umbraco.Cms.Web.Common.Routing;

namespace Badgernet.Umbraco.MediaTools.Controllers;

[ApiController]
[BackOfficeRoute("mediatools/api/v{version:apiVersion}/mediatools")]
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[MapToApi("mediatools")]
public class ControllerBase: ManagementApiControllerBase
{
}