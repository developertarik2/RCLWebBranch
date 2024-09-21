using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RCLWebBranch.DATA.Models;
using RCLWebBranch.Errors;
using RCLWebBranch.Infrastructure.InterfaceRepo;
using RCLWebBranch.Insfrastructures.Services.Interfaces;

namespace RCLWebBranch.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EFTServiceController : ControllerBase
    {
        private readonly IUnitOfWork _unitofWork;
        private readonly IClientService _clientServie;

        public EFTServiceController(IUnitOfWork unitofWork, IClientService clientServie)
        {
            _unitofWork = unitofWork;
            _clientServie = clientServie;
        }

        [Authorize]
        [HttpGet]
        [Route("checkRequisition")]
        public ActionResult<List<CheckRequisitionVM>> GetCdblReportClient(string? code)
        {
            if (string.IsNullOrEmpty(code))
            {
                return BadRequest(new ApiResponse(400, "Invalid code!!"));
            }
            var client = _clientServie.GetClientDetails(code.Trim());
            if (client == null)
            {
                // return NotFound();
                return BadRequest(new ApiResponse(400, "Invalid code!!"));
            }
            string query = @"SELECT TOP 10 * FROM T_SMS_TRANSECTION WHERE RCODE='" + code.Trim() + "' ORDER BY dat desc";

            var list2 = _unitofWork.SP_Call.ListByRawQuery<CheckRequisitionVM>(query).AsQueryable().ToList();

            foreach(var check in list2)
            {
                /////
                if ((check.status == "NO") && ((Convert.ToInt16(check.flag1.ToString()) == 1) || (Convert.ToInt16(check.flag2.ToString()) == 0) || (Convert.ToInt16(check.clr.ToString()) == 0)))
                {
                    check.Stat = "Processing...";
                }
                if ((check.status.ToString() == "NO") && ((Convert.ToInt16(check.flag1) == 0) || (Convert.ToInt16(check.flag2.ToString()) == 1) || (Convert.ToInt16(check.clr.ToString()) == 1)))
                {
                    check.Stat = "Deny...";
                }
                if ((check.status.ToString() == "YES"))
                {
                    check.Stat = "Received...";
                }
                ///

                if (Convert.ToInt16(check.flag1.ToString()) == 1)
                {
                    check.Registered = "Yes";
                }
                if (Convert.ToInt16(check.flag1) == 0)
                {
                    check.Registered = "No";
                }
                if (Convert.ToInt16(check.flag1) == 11)
                {
                    check.Registered = "From Web";
                }
                /////////////////////////
                if (Convert.ToInt16(check.flag2) == 1)
                {
                    check.Deleted = "Yes";
                }
                if (Convert.ToInt16(check.flag2) == 0)
                {
                    check.Deleted = "No";
                }

                ///////////////////////////////////
                if (Convert.ToInt16(check.clr) == 1)
                {
                    check.IF = "Yes";
                }
                if (Convert.ToInt16(check.clr) == 0)
                {
                    check.IF = "No";
                }

            }

            return list2;
        }
    }
}
