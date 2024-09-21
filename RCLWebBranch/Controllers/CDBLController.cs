using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RCLWebBranch.DATA.Dtos;
using RCLWebBranch.DATA.Entities;
using RCLWebBranch.DATA.Models;
using RCLWebBranch.DATA.ViewModels;
using RCLWebBranch.Errors;
using RCLWebBranch.Infrastructure.InterfaceRepo;
using RCLWebBranch.Insfrastructures.Services.Interfaces;
using System.Security.Claims;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using static System.Runtime.CompilerServices.RuntimeHelpers;

namespace RCLWebBranch.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CDBLController : ControllerBase
    {
        private readonly IUnitOfWork _unitofWork;
        private readonly IClientService _clientServie;

        public CDBLController(IUnitOfWork unitofWork, IClientService clientServie)
        {
            _unitofWork = unitofWork;
            _clientServie = clientServie;
        }
        [Authorize]
        [HttpGet]
        [Route("boAck")]
        public async Task<ActionResult<T_CLIENT1>> BoAcknowledgement(string? code)
        {
            try
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
                var boClient = await _unitofWork.TClient.GetFirstOrDefault(u => u.RCODE == code);
                return boClient;
            }
            catch
            {
                return BadRequest(new ApiResponse(500, "Server Error!!"));
            }

        }

        [Authorize]
        [HttpPost]
        [Route("boSale")]
        public async Task<ActionResult<BoCharge>> BoSale([FromBody] BoSaleDto boSaleDto)
        {
            var username = HttpContext.User?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.Name)?.Value;
            var user = await _unitofWork.BranchLogin.GetFirstOrDefault(u => u.USERID == username);
            if (user == null)
            {
                return BadRequest(new ApiResponse(400, "Invalid request!!"));
            }

            string queryMAX = "SELECT MAX(SL_NO) as max_sl FROM T_BO_CHARGE WHERE BRANCHCODE='" + user.BRANCHCODE + "'";
            var sl = _unitofWork.SP_Call.ListByRawQuery<dynamic>(queryMAX).AsQueryable().FirstOrDefault();
            double max;
            if (sl != null)
            {
                max =Convert.ToInt32(sl.max_sl) +1;
            }
            else
            {
                max = 1;
            }
            try
            {
                string BC = user.BRANCHCODE.ToString();
                string mo_no = max + BC + DateTime.Now.ToShortDateString().Replace("/", "");
                double amount = boSaleDto.Quantity * boSaleDto.Amount;
                string query = @"INSERT INTO T_BO_CHARGE(SL_NO,MR_NO,NAME,QTY,AMOUNT,BRANCHCODE,DATE,NOTE) 
               VALUES(" + max + ",'" + mo_no + "','" + boSaleDto.ClientName + "'," + boSaleDto.Quantity + "," + amount + ",'" + BC + "','" + DateTime.Now.ToShortDateString() + "','')";
               await _unitofWork.SP_Call.ExecuteWithoutReturnByQuery(query);
                insert_to_tracker("BO Sale", user.USERID, Convert.ToInt16(boSaleDto.Quantity));

                query = "SELECT MR_NO,NAME,QTY,AMOUNT,DATE,BRANCHCODE FROM T_BO_CHARGE WHERE MR_NO='" + mo_no + "'";
                var rec = _unitofWork.SP_Call.ListByRawQuery<BoCharge>(query).AsQueryable().Select( c=> new BoCharge
                {
                    AMOUNT=c.AMOUNT,
                    BRANCHCODE=c.BRANCHCODE,
                    DATE=Convert.ToDateTime(c.DATE).ToString("dd-MM-yyyy"),
                    NAME=c.NAME,
                    MR_NO=c.MR_NO,
                    QTY=c.QTY,
                }).First();
                var branch= await _unitofWork.BranchLogin.GetFirstOrDefault(u=>u.BRANCHCODE== rec.BRANCHCODE);
                rec.BranchName = branch.BRANCHNAME;
                return rec;
                // return BadRequest(new ApiResponse(400, "Invalid request!!"));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse(500, "Server error!!"));
            }


            // return Ok();
        }
        [Authorize]
        [HttpGet]
        [Route("getBoChargeTest")]
        public async Task<ActionResult<BoCharge>> get()
        {
            string mo_no = "1812248232023";
           string query = "SELECT MR_NO,NAME,QTY,AMOUNT,DATE,BRANCHCODE FROM T_BO_CHARGE WHERE MR_NO='" + mo_no + "'";
            var rec = _unitofWork.SP_Call.ListByRawQuery<BoCharge>(query).AsQueryable().Select(c => new BoCharge
            {
                AMOUNT = c.AMOUNT,
                BRANCHCODE = c.BRANCHCODE,
                DATE = Convert.ToDateTime(c.DATE).ToString("dd-MM-yyyy"),
                NAME = c.NAME,
                MR_NO = c.MR_NO,
                QTY = c.QTY,
            }).First();
            var branch = await _unitofWork.BranchLogin.GetFirstOrDefault(u => u.BRANCHCODE == rec.BRANCHCODE);
            rec.BranchName = branch.BRANCHNAME;
            return rec;
        }

        [Authorize]
        [HttpGet]
        [Route("getCdblChargeTest")]
        public async Task<ActionResult<ClientCDBLCharge>> getCdbl()
        {
            string mo_no = "30972448272023";
            string query = "SELECT MR_NO,NAME,RCODE,fis,tamnt,DATE FROM T_CDBL_CHARGE WHERE MR_NO='" + mo_no + "'";
            var details = _unitofWork.SP_Call.ListByRawQuery<ClientCDBLCharge>(query).AsQueryable().Select(c => new ClientCDBLCharge
            {
                NAME = c.NAME,
                // BRANCHCODE = c.BRANCHCODE,
                Fis = c.Fis,
                MR_NO = c.MR_NO,
                RCODE = c.RCODE,
                Tamnt = c.Tamnt,
                DATE = Convert.ToDateTime(c.DATE).ToString("dd-MM-yyyy"),
            }).FirstOrDefault();
            //var branch = await _unitofWork.BranchLogin.GetFirstOrDefault(u => u.BRANCHCODE == rec.BRANCHCODE);
            details.BranchName = "Motijheel";
            return details;
        }
        [Authorize]
        [HttpGet]
        [Route("getBoCharge")]
        public async Task<ActionResult<decimal>> GetCharge()
        {
            var username = HttpContext.User?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.Name)?.Value;
            var user = await _unitofWork.BranchLogin.GetFirstOrDefault(u => u.USERID == username);
            if (user == null)
            {
                return BadRequest(new ApiResponse(400, "Invalid request!!"));
            }
            string queryMAX = "SELECT BOCHARGE FROM T_BOANDCDBLCHARGE WHERE BRANCHCODE=" + Convert.ToInt16(user.BRANCHCODE) + "";

            var charge = _unitofWork.SP_Call.ListByRawQuery<dynamic>(queryMAX).AsQueryable().FirstOrDefault();
            var cha=Convert.ToDecimal( charge.BOCHARGE);
            return cha;
        }

        [Authorize]
        [HttpGet]
        [Route("getCdblCharge")]
        public async Task<ActionResult<decimal>> GetCDBLCharge()
        {
            var username = HttpContext.User?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.Name)?.Value;
            var user = await _unitofWork.BranchLogin.GetFirstOrDefault(u => u.USERID == username);
            if (user == null)
            {
                return BadRequest(new ApiResponse(400, "Invalid request!!"));
            }
            string queryMAX = "SELECT CDBLCHARGE FROM T_BOANDCDBLCHARGE WHERE BRANCHCODE=" + Convert.ToInt16(user.BRANCHCODE) + "";

            var charge = _unitofWork.SP_Call.ListByRawQuery<dynamic>(queryMAX).AsQueryable().FirstOrDefault();
            var cha = Convert.ToDecimal(charge.CDBLCHARGE);
            return cha;
        }

        [Authorize]
        [HttpGet]
        [Route("getFromMonth")]
        public ActionResult<CdblChargeYearVM> GetCount()
        {
            if (DateTime.Now.Month <= 6 && ((DateTime.Now.Month == 5) || (DateTime.Now.Month == 6)))
            {


                List<ThisYear> thisYears = new()
                        {
                            new ThisYear((DateTime.Now.Year - 1).ToString(), (DateTime.Now.Year - 1).ToString()),
                            new ThisYear((DateTime.Now.Year + 0).ToString(), (DateTime.Now.Year + 0).ToString())
                        };


                // DropDownList1.Items.AddRange(thisYears.ToArray());

                //DropDownList1.Items.Add((DateTime.Now.Year - 1).ToString());

                List<NextYear> nextYears = new()
                        {
                            //nextYears.Add(new ListItem((DateTime.Now.Year + 0).ToString(), (DateTime.Now.Year + 0).ToString()));
                            new NextYear((DateTime.Now.Year + 1).ToString(), (DateTime.Now.Year + 1).ToString()),
                            new NextYear((DateTime.Now.Year + 2).ToString(), (DateTime.Now.Year + 2).ToString())
                        };
                //nextYears.Add(new ListItem((DateTime.Now.Year + 4).ToString(), (DateTime.Now.Year + 4).ToString()));

                //DropDownList2.Items.AddRange(nextYears.ToArray());
                return new CdblChargeYearVM
                {
                    ThisYears = thisYears,
                    NextYears = nextYears
                };
            }
            else if (DateTime.Now.Month <= 6 && ((DateTime.Now.Month != 5) || (DateTime.Now.Month != 6)))
            {


                List<ThisYear> thisYears = new()
                        {
                            new ThisYear((DateTime.Now.Year - 1).ToString(), (DateTime.Now.Year - 1).ToString()),
                            new ThisYear((DateTime.Now.Year + 0).ToString(), (DateTime.Now.Year + 0).ToString())
                        };


                // DropDownList1.Items.AddRange(thisYears.ToArray());

                //DropDownList1.Items.Add((DateTime.Now.Year - 1).ToString());

                List<NextYear> nextYears = new()
                        {
                            new NextYear((DateTime.Now.Year + 0).ToString(), (DateTime.Now.Year + 0).ToString()),
                            new NextYear((DateTime.Now.Year + 1).ToString(), (DateTime.Now.Year + 1).ToString()),
                            new NextYear((DateTime.Now.Year + 2).ToString(), (DateTime.Now.Year + 2).ToString())
                        };
                //nextYears.Add(new ListItem((DateTime.Now.Year + 4).ToString(), (DateTime.Now.Year + 4).ToString()));

                //DropDownList2.Items.AddRange(nextYears.ToArray());
                return new CdblChargeYearVM
                {
                    ThisYears = thisYears,
                    NextYears = nextYears
                };
            }
            if (DateTime.Now.Month > 6)
            {

                //DropDownList1.Items.Add((DateTime.Now.Year).ToString());
                List<ThisYear> thisYears = new()
                        {
                            new ThisYear(DateTime.Now.Year.ToString(), DateTime.Now.Year.ToString())
                        };
                //{
                //    new ThisYear((DateTime.Now.Year.ToString(),DateTime.Now.Year.ToString()))
                //};

                List<NextYear> nextYears = new()
                        {
                            new NextYear((DateTime.Now.Year + 1).ToString(), (DateTime.Now.Year + 1).ToString()),
                            new NextYear((DateTime.Now.Year + 2).ToString(), (DateTime.Now.Year + 2).ToString()),
                            new NextYear((DateTime.Now.Year + 3).ToString(), (DateTime.Now.Year + 3).ToString())
                        };
                //nextYears.Add(new ListItem((DateTime.Now.Year + 4).ToString(), (DateTime.Now.Year + 4).ToString()));

                // DropDownList2.Items.AddRange(nextYears.ToArray());
                return new CdblChargeYearVM
                {
                    ThisYears = thisYears,
                    NextYears = nextYears
                };
            }
            return BadRequest(new ApiResponse(500, "Server error!!"));
        }

        [Authorize]
        [HttpGet]
        [Route("getBoStatus")]
        public ActionResult<BoStatusVM> GetBoStatus(string code)
        {
            if (string.IsNullOrEmpty(code.Trim()))
            {
                return BadRequest(new ApiResponse(400, "Invalid code!!"));
            }
            var client = _clientServie.GetClientDetails(code.Trim());
            if (client == null)
            {
                string queryMAX = "SELECT RCODE,NAME FROM T_NEW_CLIENT WHERE RCODE='" + code.Trim() + "'";
                var client2 = _unitofWork.SP_Call.ListByRawQuery<T_NEW_CLIENT>(queryMAX).AsQueryable().FirstOrDefault();

                if (client2 != null)
                {
                    return new BoStatusVM
                    {
                        Bostatus = "Active",
                        FhName = client2.NAME,
                        RCODE = client2.RCODE
                    };
                   
                }
                else
                {
                    return BadRequest(new ApiResponse(400, "Invalid code!!"));
                }
              
            }
            string query = @"SELECT RCODE,fhName , bostatus FROM T_CLIENT1 WHERE RCODE='" + code.Trim() + "' ";
            var clientStatus = _unitofWork.SP_Call.ListByRawQuery<BoStatusVM>(query).AsQueryable().FirstOrDefault();
            return clientStatus;

            //string query = @"SELECT RCODE,fhName , bostatus FROM T_CLIENT1 WHERE RCODE='"" + txtRCODE.Text.Trim() + ""' ";
        }

        //public int cdbl_double_entry_check(string code, int fromYear, int toYear)
        //{
        //    int count = 0;
        //    for (int i = 0; i < Convert.ToInt16(toYear) - Convert.ToInt16(fromYear); i++)
        //    {
        //        string qry = "SELECT RCODE FROM T_CDBL_CHARGE WHERE RCODE='" + code.Trim() + "' AND YEAR='" + (Convert.ToInt16(fromYear) + i + 1).ToString() + "'";
        //        var exist = _unitofWork.SP_Call.ListByRawQuery<BoStatusVM>(qry).AsQueryable().First();
        //        if (exist != null)
        //        {
        //            count++;
        //            break;
        //        }
        //    }
        //    return count;
        //}

        [Authorize]
        [HttpPost]
        [Route("collect")]
        public async Task<ActionResult<ClientCDBLCharge>> CollectCDBLCharge([FromBody] ClientCdblChargeRecieveVM chargeRecieveVM)
        {
            try
            {
                if (string.IsNullOrEmpty(chargeRecieveVM?.Code?.Trim()))
                {
                    return BadRequest(new ApiResponse(400, "Invalid code!!"));
                }
                var client = _clientServie.GetClientDetails(chargeRecieveVM.Code.Trim());
                if (client == null)
                {
                    string quer = "SELECT RCODE,NAME FROM T_NEW_CLIENT WHERE RCODE='" + chargeRecieveVM.Code.Trim() + "'";
                    var client2 = _unitofWork.SP_Call.ListByRawQuery<T_NEW_CLIENT>(quer).AsQueryable().FirstOrDefault();
                    if (client2 == null)
                    {
                        return BadRequest(new ApiResponse(400, "Invalid code!!"));
                    }
                       
                }

                string query = @"SELECT RCODE,fhName , bostatus FROM T_CLIENT1 WHERE RCODE='" + chargeRecieveVM.Code.Trim() + "' ";
                var clientStatus = _unitofWork.SP_Call.ListByRawQuery<BoStatusVM>(query).AsQueryable().FirstOrDefault();

                if(clientStatus != null)
                {
                    if (clientStatus?.Bostatus != "Active")
                    {
                        return BadRequest(new ApiResponse(400, "Code is not active!!"));
                    }
                }
              
                double max;
                string queryMAX = "SELECT MAX(ROW_ID) as max_sl FROM T_CDBL_CHARGE";
                var sl = _unitofWork.SP_Call.ListByRawQuery<double>(queryMAX)?.AsQueryable().First();
                chargeRecieveVM.TotalAmount=(chargeRecieveVM.ToYear-chargeRecieveVM.FromYear)*chargeRecieveVM.Amount.GetValueOrDefault();
                if (sl != null)
                {
                    max = sl.GetValueOrDefault() + 1;
                }
                else
                    max = 1;

                var username = HttpContext.User?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.Name)?.Value;
                var user = await _unitofWork.BranchLogin.GetFirstOrDefault(u => u.USERID == username);
                if (user == null)
                {
                    return BadRequest(new ApiResponse(400, "Invalid request!!"));
                }
                int count = 0;
                for (int i = 0; i < Convert.ToInt16(chargeRecieveVM.ToYear) - Convert.ToInt16(chargeRecieveVM.FromYear); i++)
                {
                    string qry = "SELECT RCODE FROM T_CDBL_CHARGE WHERE RCODE='" + chargeRecieveVM.Code.Trim() + "' AND YEAR='" + (Convert.ToInt16(chargeRecieveVM.FromYear) + i + 1).ToString() + "'";
                    string? exist = _unitofWork.SP_Call.ListByRawQuery<string>(qry)?.AsQueryable().FirstOrDefault();
                    if (exist != null)
                    {
                        count++;
                        break;
                    }
                }
                string mo_no=string.Empty;
                if (count == 0)
                {
                    for (int i = 0; i < Convert.ToInt16(chargeRecieveVM.ToYear) - Convert.ToInt16(chargeRecieveVM.FromYear); i++)
                    {
                        int j = i + 1;

                        string BC = user.BRANCHCODE.ToString();
                         mo_no = max + BC + DateTime.Now.ToShortDateString().Replace("/", "");
                        query = @"INSERT INTO T_CDBL_CHARGE(ROW_ID,MR_NO,RCODE,YEAR,FISCAL,AMOUNT,BRANCHCODE,DATE,NOTE,fis,tamnt,NAME) VALUES(" + max + ",'" + mo_no + "','" + chargeRecieveVM.Code + "','" + (Convert.ToInt16(chargeRecieveVM.FromYear) + j).ToString() + "'," +
    "'July " + (Convert.ToInt16(chargeRecieveVM.FromYear) + i).ToString() + " - June " + (Convert.ToInt16(chargeRecieveVM.FromYear) + j).ToString() + "'," + 
    "'" + chargeRecieveVM.Amount + "'," + BC + ",'" + DateTime.Now.ToShortDateString() + "','Cash Received','July " + chargeRecieveVM.FromYear + 
    " to June " + chargeRecieveVM.ToYear + "','" + chargeRecieveVM.TotalAmount + "','" + chargeRecieveVM.Name + "')";

                       await  _unitofWork.SP_Call.ExecuteWithoutReturnByQuery(query);

                        max++;
                    }
                    insert_to_tracker("CDBL Rec: " + chargeRecieveVM.Code, user.BRANCHCODE.ToString(),
                        ((Convert.ToInt16(chargeRecieveVM.ToYear) - Convert.ToInt16(chargeRecieveVM.FromYear)) * 500));

                    query = "SELECT MR_NO,NAME,RCODE,fis,tamnt,DATE FROM T_CDBL_CHARGE WHERE MR_NO='" +mo_no  + "'";
                    var details= _unitofWork.SP_Call.ListByRawQuery<ClientCDBLCharge>(query).AsQueryable().Select(c=> new ClientCDBLCharge
                    {
                        NAME=c.NAME,
                       // BRANCHCODE = c.BRANCHCODE,
                        Fis=c.Fis,
                        MR_NO=c.MR_NO,
                        RCODE=c.RCODE,
                        Tamnt=c.Tamnt,
                        DATE = Convert.ToDateTime(c.DATE).ToString("yyyy-MM-dd"),
                    }).First();

                   // var branch = await _unitofWork.BranchLogin.GetFirstOrDefault(u => u.BRANCHCODE == details.BRANCHCODE);
                    details.BranchName = user.BRANCHNAME;


                    return details;
                }
                else
                {
                    return BadRequest(new ApiResponse(400, "CDBL Charge already received on this code. Between the year of " + (Convert.ToInt16(chargeRecieveVM.FromYear)).ToString() + " to " + (Convert.ToInt16(chargeRecieveVM.FromYear) + 1).ToString()));
                }
            }
            catch(Exception ex)
            {
                return BadRequest(new ApiResponse(500, "Server Error!!"));
            }
           // return Ok();
        }

        [Authorize]
        [HttpGet]
        [Route("newClientCode")]
        public async Task<ActionResult> GetCode()
        {
            try
            {
                int flagRcode = 0;
                string code = string.Empty;
                var username = HttpContext.User?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.Name)?.Value;
                var user = await _unitofWork.BranchLogin.GetFirstOrDefault(u => u.USERID == username);

                if (user.BRANCHCODE == 1)
                {
                    string queryMAX = "SELECT RCODE FROM T_NEW_CLIENT WHERE BRANCHCODE IN (1,2) AND EntryTime=(SELECT MAX(EntryTime) FROM T_NEW_CLIENT WHERE BRANCHCODE IN (1,2))";
                    var details = _unitofWork.SP_Call.ListByRawQuery<string>(queryMAX).AsQueryable().First();

                    if (!string.IsNullOrEmpty(details))
                    {
                        string prfx = Regex.Replace(details, "[^A-Za-z]", "");
                        int sufx = Convert.ToInt32(Regex.Replace(details, "[A-Za-z]", "")) + 1;
                        code = prfx + sufx.ToString();
                        flagRcode = 1;
                    }
                    if (flagRcode == 0)
                    {
                        queryMAX = "SELECT BRANCH_PREFEX as perfex FROM T_BRANCHES WHERE BRANCHCODE=" + Convert.ToInt16(user.BRANCHCODE.ToString()) + "";
                        var pre = _unitofWork.SP_Call.ListByRawQuery<string>(queryMAX).AsQueryable().First();

                        string prfx = pre.ToString();
                        int sufx = 1;
                        code = prfx + sufx.ToString();
                    }
                }
                else if (Convert.ToInt16(user.BRANCHCODE.ToString()) == 2)
                {
                    string queryMAX = "SELECT RCODE FROM T_NEW_CLIENT WHERE BRANCHCODE IN (1,2) AND EntryTime=(SELECT MAX(EntryTime) FROM T_NEW_CLIENT WHERE BRANCHCODE IN (1,2))";
                    var lastCode = _unitofWork.SP_Call.ListByRawQuery<string>(queryMAX).AsQueryable().First();
                    if (!string.IsNullOrEmpty(lastCode))
                    {
                        string prfx = Regex.Replace(lastCode.ToString(), "[^A-Za-z]", "");
                        int sufx = Convert.ToInt32(Regex.Replace(lastCode.ToString(), "[A-Za-z]", "")) + 1;
                        code = prfx + sufx.ToString();
                        flagRcode = 1;
                    }


                    if (flagRcode == 0)
                    {
                        queryMAX = "SELECT BRANCH_PREFEX as perfex FROM T_BRANCHES WHERE BRANCHCODE=" + Convert.ToInt16(user.BRANCHCODE.ToString()) + "";

                        var pre = _unitofWork.SP_Call.ListByRawQuery<string>(queryMAX).AsQueryable().First();

                        string prfx = pre.ToString();
                        int sufx = 1;
                        code = prfx + sufx.ToString();
                    }
                }
                else
                {
                    string queryMAX = @"SELECT RCODE FROM T_NEW_CLIENT WHERE BRANCHCODE=" + Convert.ToInt16(user.BRANCHCODE.ToString()) + " AND EntryTime=(SELECT MAX(EntryTime) FROM T_NEW_CLIENT WHERE BRANCHCODE=" + Convert.ToInt16(user.BRANCHCODE.ToString()) + ")";
                    var pre = _unitofWork.SP_Call.ListByRawQuery<string>(queryMAX).AsQueryable().First();

                    if (!string.IsNullOrEmpty(pre))
                    {
                        string prfx = Regex.Replace(pre.ToString(), "[^A-Za-z]", "");
                        int sufx = Convert.ToInt32(Regex.Replace(pre, "[A-Za-z]", "")) + 1;
                        code = prfx + sufx.ToString();
                        flagRcode = 1;
                    }
                    if (flagRcode == 0)
                    {
                        queryMAX = "SELECT BRANCH_PREFEX as perfex FROM T_BRANCHES WHERE BRANCHCODE=" + Convert.ToInt16(user.BRANCHCODE) + " ";
                        var pref = _unitofWork.SP_Call.ListByRawQuery<string>(queryMAX).AsQueryable().First();

                        if (!string.IsNullOrEmpty(pref))
                        {
                            string prfx = pref.ToString();
                            int sufx = 1;
                            code = prfx + sufx.ToString();
                        }
                    }
                }
                //code = "jjss";
                return Ok(new { code });
            }
            catch
            {
                return BadRequest(new ApiResponse(500, "Server Error!!"));
            }
             //   return Ok();
        }

        [Authorize]
        [HttpPost]
        [Route("createNewClient")]
        public async Task<IActionResult> CreateNewClient([FromBody] CreateNewClientVM createNewClient)
        {
            try
            {
                var username = HttpContext.User?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.Name)?.Value;
                var user = await _unitofWork.BranchLogin.GetFirstOrDefault(u => u.USERID == username);
                if (string.IsNullOrEmpty(createNewClient.Name.Trim()))
                {

                }
                string query = @"INSERT INTO T_NEW_CLIENT(RCODE,NAME,BRANCHCODE,EntryTime) VALUES('" + createNewClient.Code.Trim() + "','" + createNewClient.Name.Trim() + "'," + user.BRANCHCODE + ",getDate())";
                await _unitofWork.SP_Call.ExecuteWithoutReturnByQuery(query);


                return Ok(new {msg="Client Created Successfully!!! Client Code: "+createNewClient.Code.Trim()});
            }
            catch(Exception ex) 
            {
                return BadRequest(new ApiResponse(500, "Server Error!!"));
            }

        }

        [Authorize]
        [HttpGet]
        [Route("getLastFiscal")]
        public ActionResult<ChargeReceiveClient> Get(string code)
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
            try
            {
                string queryCDBL = "SELECT TOP 1 FISCAL FROM T_CDBL_CHARGE WHERE RCODE='" + code.Trim() + "' ORDER BY DATE DESC";
                var exist = _unitofWork.SP_Call.ListByRawQuery<ChargeReceiveClient>(queryCDBL).AsQueryable().FirstOrDefault();
                return exist;
            }
            catch
            {
                return BadRequest(new ApiResponse(500, "Server Error!!"));
            }
            
        }
        async void insert_to_tracker(string action_type, string user_id, int status = 1)
        {
            var remoteIpAddress = HttpContext.Connection.RemoteIpAddress;


            string query = @"INSERT INTO T_WEB_USER_TRACKER (user_id, IP_address, action_type, status) VALUES ('" + user_id + "', '" + remoteIpAddress + "', '" + action_type + "', " + status + ")";
            await _unitofWork.SP_Call.ExecuteWithoutReturnByQuery(query);
        }
    }
}
