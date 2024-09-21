using Microsoft.AspNetCore.Mvc;

namespace RCLWebBranch.Controllers
{
    public class FallBackController : Controller
    {
        public IActionResult Index()
        {
            return PhysicalFile(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot",
                "index.html"), "text/HTML");
        }
    }
}
