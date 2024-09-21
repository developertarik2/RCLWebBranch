using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RCLWebBranch.DATA.Dtos;
using RCLWebBranch.DATA.Models;
using RCLWebBranch.Errors;
using RCLWebBranch.Infrastructure.Data;
using RCLWebBranch.Infrastructure.InterfaceRepo;
using RCLWebBranch.Insfrastructures.Services.Interfaces;
using System;
using System.Reflection;
using System.Security.Claims;
using System.Xml.Linq;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace RCLWebBranch.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
   // [Authorize]
    public class CDBLReportController : ControllerBase
    {
        private readonly IUnitOfWork _unitofWork;
        private readonly IClientService _clientServie;
        private readonly IMapper _mapper;

        public CDBLReportController(IUnitOfWork unitofWork, IClientService clientServie, IMapper mapper)
        {
            _unitofWork = unitofWork;
            _clientServie = clientServie;
            _mapper = mapper;
        }

        [Authorize]
        [HttpPost]
        [Route("getCdblChargeR")]
        public async Task<ActionResult<List<ChargeRecieveVM>>> GetCdblChargeR([FromBody] ChargeRecieveDto chargeRecieveDto)
        {
            //if (string.IsNullOrEmpty(chargeRecieveDto.BranchName))
            //{
            //    return BadRequest(new ApiResponse(400, "Invalid Branch!!"));
            //}
            //if (string.IsNullOrEmpty(chargeRecieveDto.BranchName))
            //{
            //    return BadRequest(new ApiResponse(400, "Invalid Branch!!"));
            //}
            if (DateTime.ParseExact(chargeRecieveDto.FromDate, "yyyy-MM-dd", null) >
                DateTime.ParseExact(chargeRecieveDto.ToDate, "yyyy-MM-dd", null))
            {
                ModelState.AddModelError("", "From Date is greater then To Date");
            }
            var username = HttpContext.User?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.Name)?.Value;
            var user = await _unitofWork.BranchLogin.GetFirstOrDefault(u => u.USERID == username);
            //  return new List<ChargeRecieveVM>();
            if (ModelState.IsValid)
            {
                try
                {


                    string query = string.Empty;
                    query = @"SELECT SUM(QTY) As Quantity,CONVERT(varchar,DATE,105) AS Date,SUM(AMOUNT) As Amount FROM T_BO_CHARGE WHERE BRANCHCODE='" + user.BRANCHCODE +
"' AND DATE BETWEEN '" + chargeRecieveDto.FromDate + "' AND '" + chargeRecieveDto.ToDate + "' GROUP BY CONVERT(varchar,DATE,105)";

                    var list = _unitofWork.SP_Call.ListByRawQuery<ChargeRecieveVM>(query).AsQueryable().ToList();
                    return list;
                }
                catch (Exception ex)
                {
                    return BadRequest(new ApiResponse(500, "Server Error!!"));
                }
            }
            else
            {
                return BadRequest(new ApiResponse(400, "Invalid input!!"));
            }
        }

        [Authorize]
        [HttpPost]
        [Route("getCdblChargeD")]
        public async Task<ActionResult<dynamic>> GetCdblChargeD([FromBody] ChargeRecieveDto chargeRecieveDto)
        {
            if (DateTime.ParseExact(chargeRecieveDto.FromDate, "yyyy-MM-dd", null) >
                DateTime.ParseExact(chargeRecieveDto.ToDate, "yyyy-MM-dd", null))
            {
                ModelState.AddModelError("", "From Date is greater then To Date");
            }
            var username = HttpContext.User?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.Name)?.Value;
            var user = await _unitofWork.BranchLogin.GetFirstOrDefault(u => u.USERID == username);
            if (ModelState.IsValid)
            {
                try
                {
                    DateTime dt = DateTime.Parse(chargeRecieveDto.FromDate);
                    string y1 = (Convert.ToDouble(dt.Year.ToString()) - 1).ToString();
                    string y2 = "July " + y1.ToString() + " - June " + (Convert.ToInt16(y1) + 1).ToString();
                    string y3 = "July " + (Convert.ToInt16(y1) + 1).ToString() + " - June " + (Convert.ToInt16(y1) + 2).ToString();
                    string y4 = "July " + (Convert.ToInt16(y1) + 2).ToString() + " - June " + (Convert.ToInt16(y1) + 3).ToString();

                    double year1 = 0;double year2 = 0; double year3=0;

                    string query = string.Empty;
                    query = @"SELECT* FROM(SELECT ROW_ID, NAME, MR_NO, RCODE, FISCAL, AMOUNT, CONVERT(DATE, [date]) as [date] FROM T_CDBL_CHARGE
WHERE[date] BETWEEN '" + chargeRecieveDto.FromDate + "' AND '" + chargeRecieveDto.ToDate + "' AND BRANCHCODE = '" + user.BRANCHCODE + "'    ) p   " +
"PIVOT   (      SUM(AMOUNT) for FISCAL IN ([" + y2 + "], [" + y3 + "], [" + y4 + "])    ) as pvt ORDER BY  [ROW_ID] DESC ";

                    var list2 = _unitofWork.SP_Call.ListByRawQuery<dynamic>(query).AsQueryable().ToList();
                    string jsonString = JsonConvert.SerializeObject(list2);

                    //var list3= JObject.Parse(jsonString).Properties()
                    //                   .Select(jo => new
                    //                   {
                    //                       name = jo.Name,
                    //                       code = ((JObject)jo.Value["iso"]).Properties().First().Name
                    //                   }).ToList();
                    // return list2;
                    List<ChargeReceiveDetList> lists = new List<ChargeReceiveDetList>();
                    foreach (dynamic item in list2)
                    {
                        double amount4, amount3, amount2;
                        amount4 = amount2 = amount3 = 0;
                        ChargeReceiveDetList cc = new()
                        {
                            Date = item.date,
                            // AMOUNT = item.Amount,
                            //FISCAL=item["FISCAL"],
                            MR_NO = item.MR_NO,
                            //Y2= item.GetType().GetProperty(y2),// item.y2,
                            //Y3= item.GetType().GetProperty(y3),
                            // Y4 = item.GetType().GetProperty(y4),
                            Name = item.NAME,
                            RCODE = item.RCODE,
                        };
                        var dict = (IDictionary<string, object>)item;
                        if(dict[y2] !=null)
                        {
                            cc.Y2 = dict[y2].ToString();
                            amount2 = Convert.ToDouble(dict[y2].ToString());
                        }
                        if (dict[y3] != null)
                        {
                            cc.Y3 = dict[y3].ToString();
                            amount3 = Convert.ToDouble(dict[y3].ToString());
                        }
                        if (dict[y4] != null)
                        {
                            cc.Y4 = dict[y4].ToString();
                            amount4 = Convert.ToDouble(dict[y4].ToString());
                        }
                       lists.Add(cc);
                        cc.AMOUNT = amount2 + amount3 + amount4;
                        year1 += amount2;
                        year2 += amount3;
                        year3 += amount4;
                    }

                    //var list = _unitofWork.SP_Call.ListByRawQuery<ChargeReceiveDetList>(query).AsQueryable().Select(c=> new ChargeReceiveDetList
                    //{
                    //    Date=c.Date,
                    //    MR_NO=c.MR_NO,
                    //    RCODE=c.RCODE,
                    //    Name=c.Name,
                    //    Y2=c.Y2,
                    //    Y3=c.Y3,
                    //    Y4 = c.Y4,
                    //}).ToList();

                    //foreach (var item in lists)
                    //{
                       

                    //    if (!string.IsNullOrEmpty( item?.Y2?.ToString()))
                    //    {
                    //        amount2 = Convert.ToDouble(item.Y2.ToString());

                    //    }
                    //    if (!string.IsNullOrEmpty(item?.Y3?.ToString()))
                    //    {
                    //        amount3 = Convert.ToDouble(item.Y3.ToString());

                    //    }
                    //    if (!string.IsNullOrEmpty(item?.Y4?.ToString()))
                    //    {
                    //        amount4 = Convert.ToDouble(item.Y4.ToString());

                    //    }

                    //    item.AMOUNT = amount2 + amount3 + amount4;
                    //    year1 += amount2;
                    //    year2 += amount3;
                    //    year3 += amount4;
                    //}
                    ChargeReceiveDet model = new()
                    {
                        ChargeReceives=lists,
                        Year1 = year1,
                        Year2 = year2,
                        Year3 = year3,
                        Yname1=y2,
                        Yname2=y3,
                        Yname3=y4,
                        TotalAmount=year1 + year2+year3,
                    };
                    return model;
                }
                catch (Exception ex)
                {
                    return BadRequest(new ApiResponse(500, "Server Error!!"));
                }
            }
            else
            {
                return BadRequest(new ApiResponse(400, "Invalid input!!"));
            }
            
        }

        [Authorize]
        [HttpGet]
        [Route("getCdblChargeClient")]
        public ActionResult<List<ChargeReceiveClient>> GetCdblReportClient( string? code)
        {
            if(string.IsNullOrEmpty(code))
            {
                return BadRequest(new ApiResponse(400, "Invalid code!!"));
            }
            var client = _clientServie.GetClientDetails(code);
            if (client == null)
            {
                string queryMAX = "SELECT RCODE,NAME FROM T_NEW_CLIENT WHERE RCODE='" + code.Trim() + "'";
                var client2 = _unitofWork.SP_Call.ListByRawQuery<T_NEW_CLIENT>(queryMAX).AsQueryable().FirstOrDefault();
                if (client2 == null)
                return BadRequest(new ApiResponse(400, "Invalid code!!"));
            }
            try
            {
                string query = @"SELECT MR_NO,FISCAL,CONVERT(varchar,DATE,105) AS Date,AMOUNT As Amount FROM T_CDBL_CHARGE WHERE RCODE='" + code + "' order by FISCAL desc";

                var list2 = _unitofWork.SP_Call.ListByRawQuery<ChargeReceiveClient>(query).AsQueryable().ToList();

                return list2;
            }
            catch
            {
                return BadRequest(new ApiResponse(500, "Server Error!!"));
            }
        }

        [Authorize]
        [HttpGet]
        [Route("getChargeByMr")]
        public async Task<ActionResult<ClientCDBLCharge>> getChargeByMr(string mr_no)
        {
            if(string.IsNullOrEmpty(mr_no))
            {
                return BadRequest(new ApiResponse(500, "Server Error!!"));
            }
            try
            {
                string query = "SELECT MR_NO,NAME,RCODE,fis,tamnt,DATE,BRANCHCODE FROM T_CDBL_CHARGE WHERE MR_NO='" + mr_no.Trim() + "'";
                var details = _unitofWork.SP_Call.ListByRawQuery<ClientCDBLCharge>(query).AsQueryable().Select(c => new ClientCDBLCharge
                {
                    NAME = c.NAME,
                    BRANCHCODE = c.BRANCHCODE,
                    Fis = c.Fis,
                    MR_NO = c.MR_NO,
                    RCODE = c.RCODE,
                    Tamnt = c.Tamnt,
                    DATE = Convert.ToDateTime(c.DATE).ToString("yyyy-MM-dd"),
                }).FirstOrDefault();
                var branch = await _unitofWork.BranchLogin.GetFirstOrDefault(u => u.BRANCHCODE == details.BRANCHCODE);
                details.BranchName = branch.BRANCHNAME;
                return details;
            }
            catch
            {
                return BadRequest(new ApiResponse(500, "Server Error!!"));
            }

        }
    }
}
