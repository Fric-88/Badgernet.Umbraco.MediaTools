using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Api.Common.Attributes;
using Umbraco.Cms.Api.Management.Controllers;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common.Authorization;
using Umbraco.Cms.Web.Common.Routing;

namespace Badgernet.Umbraco.MediaTools.Core.Controllers;

[ApiController]
[BackOfficeRoute("mediatools/api/v{version:apiVersion}/mediatools")]
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[MapToApi("mediatools")]
public class ControllerBase: ManagementApiControllerBase
{
        public ControllerBase()
        {
        }
}