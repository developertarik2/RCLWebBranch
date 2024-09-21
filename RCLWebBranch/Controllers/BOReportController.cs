using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RCLWebBranch.DATA.Dtos;
using RCLWebBranch.DATA.Models;
using RCLWebBranch.Errors;
using RCLWebBranch.Infrastructure.InterfaceRepo;
using RCLWebBranch.Insfrastructures.Services.Interfaces;
using System.Security.Claims;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace RCLWebBranch.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BOReportController : ControllerBase
    {
        private readonly IUnitOfWork _unitofWork;
        private readonly IClientService _clientServie;
        private readonly IMapper _mapper;

        public BOReportController(IUnitOfWork unitofWork, IClientService clientServie, IMapper mapper)
        {
            _unitofWork = unitofWork;
            _clientServie = clientServie;
            _mapper = mapper;
        }

        [Authorize]
        [HttpPost]
        [Route("getBoReport")]
        public async Task< ActionResult<List<BoSaleReport>>> GetBoReport([FromBody] ChargeRecieveDto chargeRecieveDto)
        {
            if (DateTime.ParseExact(chargeRecieveDto.FromDate, "yyyy-MM-dd", null) >
                DateTime.ParseExact(chargeRecieveDto.ToDate, "yyyy-MM-dd", null))
            {
                ModelState.AddModelError("", "From Date is greater then To Date");
            }
            var username = HttpContext.User?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.Name)?.Value;
            var user = await _unitofWork.BranchLogin.GetFirstOrDefault(u => u.USERID == username);
            if (user == null)
            {
                return BadRequest(new ApiResponse(400, "Invalid request!!"));
            }
            if(ModelState.IsValid)
            {
                string query = @"SELECT SUM(QTY) As Quantity,CONVERT(varchar,DATE,105) AS Date,SUM(AMOUNT) As Amount FROM T_BO_CHARGE WHERE " +
                "BRANCHCODE='" + user.BRANCHCODE + "' AND DATE BETWEEN '" + chargeRecieveDto.FromDate + "' AND '" + chargeRecieveDto.ToDate + "' GROUP BY CONVERT(varchar,DATE,105)";

                var list2 = _unitofWork.SP_Call.ListByRawQuery<BoSaleReport>(query).AsQueryable().ToList();

                return list2;
            }
            else
            {
                return BadRequest(new ApiResponse(400, "Invalid input!!"));
            }
            
        }

        [Authorize]
        [HttpPost]
        [Route("getBoReportDetails")]
        public async Task<ActionResult<List<BoSaleReportDetails>>> GetBoReportDetails([FromBody] ChargeRecieveDto chargeRecieveDto)
        {
            if (DateTime.ParseExact(chargeRecieveDto.FromDate, "yyyy-MM-dd", null) >
                DateTime.ParseExact(chargeRecieveDto.ToDate, "yyyy-MM-dd", null))
            {
                ModelState.AddModelError("", "From Date is greater then To Date");
            }
            var username = HttpContext.User?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.Name)?.Value;
            var user = await _unitofWork.BranchLogin.GetFirstOrDefault(u => u.USERID == username);
            if (user == null)
            {
                return BadRequest(new ApiResponse(400, "Invalid request!!"));
            }
            if (ModelState.IsValid)
            {
                string query = @"SELECT MR_NO,NAME,QTY As Quantity,Date,AMOUNT As Amount FROM T_BO_CHARGE WHERE BRANCHCODE='" + user.BRANCHCODE + "' AND DATE BETWEEN '" + chargeRecieveDto.FromDate + "' AND '" + chargeRecieveDto.ToDate + "' ORDER BY Date desc";

                var list2 = _unitofWork.SP_Call.ListByRawQuery<BoSaleReportDetails>(query).AsQueryable().ToList();

                return list2;
            }
            else
            {
                return BadRequest(new ApiResponse(400, "Invalid input!!"));
            }

        }

        [Authorize]
        [HttpGet]
        [Route("getBoReportByMr")]
         public async Task<ActionResult<BoCharge?>> GetBoReportById(string mrno)
        {
            if(string.IsNullOrEmpty(mrno))
            {
                return BadRequest(new ApiResponse(400, "Invalid input!!"));
            }
            try
            {
                string query = "SELECT MR_NO,NAME,QTY,AMOUNT,DATE,BRANCHCODE FROM T_BO_CHARGE WHERE MR_NO='" + mrno + "'";
                var rec = _unitofWork.SP_Call.ListByRawQuery<BoCharge>(query).AsQueryable().Select(c => new BoCharge
                {
                    AMOUNT = c.AMOUNT,
                    BRANCHCODE = c.BRANCHCODE,
                    DATE = Convert.ToDateTime(c.DATE).ToString("yyyy-MM-dd"),
                    NAME = c.NAME,
                    MR_NO = c.MR_NO,
                    QTY = c.QTY,
                }).FirstOrDefault();
                var branch = await _unitofWork.BranchLogin.GetFirstOrDefault(u => u.BRANCHCODE == rec.BRANCHCODE);
                rec.BranchName = branch.BRANCHNAME;
                return rec;
            }
            catch
            {
                return BadRequest(new ApiResponse(500, "Server error!!"));
            }
        }
    }
}
