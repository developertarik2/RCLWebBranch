using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RCLWebBranch.Errors;

namespace RCLWebBranch.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Route("errors/{code}")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public class ErrorController : ControllerBase
    {
        public IActionResult Error(int code)
        {
            return new ObjectResult(new ApiResponse(code));
        }
    }
}
