using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RCLWebBranch.DATA.Dtos;
using RCLWebBranch.DATA.Entities;
using RCLWebBranch.DATA.Models;
using RCLWebBranch.Errors;
using RCLWebBranch.Infrastructure.InterfaceRepo;
using RCLWebBranch.Insfrastructures.Services.Interfaces;
using System.Security.Claims;

namespace RCLWebBranch.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IPOServiceController : ControllerBase
    {
        private readonly IUnitOfWork _unitofWork;
        private readonly IClientService _clientServie;
        private readonly IMapper _mapper;

        public IPOServiceController(IUnitOfWork unitofWork, IClientService clientServie, IMapper mapper)
        {
            _unitofWork = unitofWork;
            _clientServie = clientServie;
            _mapper = mapper;
        }

        [Authorize]
        [HttpGet]
        [Route("getActiveIPO")]
        public ActionResult<List<IpoDetails>> ApplyIPO()
        {
            //string code;
            //if (HttpContext.Session.GetString(ExtraAct.clientCode) != null)
            //{
            //    code = HttpContext.Session.GetString(ExtraAct.clientCode);
            //}
            //else
            //{
            //    return RedirectToAction("ViewAllCodes", "Home");
            //}
            //var client = _clientServie.GetClientDetails(code);
            //if (client == null)
            //{
            //    return NotFound();
            //}

            //string query2 = @"SELECT ldgbal FROM T_Tkbal WHERE acode='" + code + "'";
            //var ldgBal = _unitofWork.SP_Call.ListByRawQueryBySis<decimal>(query2).AsQueryable().FirstOrDefault();

            try

            {
                string query2 = @"SELECT IPO_CNAME,IPO_NAME,LOT_SIZE,PRICE,START_DATE,END_DATE,T_PRICE FROM T_IPO_Details WHERE ON_OFF='True'";
                var ipoList = _unitofWork.SP_Call.ListByRawQuery<IpoDetails>(query2).AsQueryable().ToList();
                //foreach (var ipo in ipoList)
                //{
                //    string qry_double_check = "SELECT RCODE FROM T_IPO_REC WHERE RCODE='" + code + "' AND IPO_NAME='" + ipo.IPO_NAME + "'";
                //    var doubleCheck = _unitofWork.SP_Call.ListByRawQuery<string>(qry_double_check).AsQueryable().FirstOrDefault();
                //    if (!string.IsNullOrEmpty(doubleCheck))
                //    {
                //        ipo.Applied = true;
                //    }
                //}
                //ApplyIPoVM model = new()
                //{
                //    Code = code,
                //    LedgerBalance = ldgBal,
                //    IpoDetails = ipoList
                //};

                return ipoList;
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse(500, "Server Error!!"));
            }
        }

        //[Authorize]
        //[HttpPost]
        //[Route("applyIPO")]
        //public ActionResult ApplyIpo([FromBody] ApplyIpoDto applyIpoDto)
        //{
        //    if (string.IsNullOrEmpty(applyIpoDto.Code?.Trim()))
        //    {
        //        return BadRequest(new ApiResponse(400, "Invalid code!!"));
        //    }
        //    var clientExist = _clientServie.GetClientDetails(applyIpoDto.Code?.Trim());
        //    if (clientExist == null)
        //    {
        //        return BadRequest(new ApiResponse(404, "Invalid Code!!"));
        //    }
        //    try
        //    {
        //        //// IPO eligibility checking
        //        ///

        //        string qry_ipo_eligibility = "SELECT START_DATE, END_DATE+1 AS END_DATE  FROM T_IPO_Details WHERE IPO_NAME='" + applyIpoDto.IpoName + "'  ";
        //        var ipo = _unitofWork.SP_Call.ListByRawQuery<IpoDetails>(qry_ipo_eligibility).AsQueryable().FirstOrDefault();

        //        if (ipo?.END_DATE < DateTime.Now)
        //        {
        //            return BadRequest(new ApiResponse(400, "IPO Subscription date is over!!"));
                  
        //        }
        //        if (ipo?.START_DATE > DateTime.Now)
        //        {
        //            return BadRequest(new ApiResponse(400, "IPO Subscription is not started yet!!"));
                   
        //        }
        //        //// end of eligibility checking
        //        ///

        //        //// Checking master-child relationship
        //        string qry_master_check = "SELECT RCODE FROM T_IPO_MASTER_CODE WHERE RCODE='" + applyIpoDto?.Code?.Trim() + "'";
        //        var master = _unitofWork.SP_Call.ListByRawQuery<string>(qry_master_check).AsQueryable().FirstOrDefault();
        //        if (!string.IsNullOrEmpty(master))
        //        {
                    
        //            return BadRequest(new ApiResponse(400, "Please contact with your nearest branch!!"));
        //        }

        //        //// end of master-child relationship checking


        //        //// checking previous Entry
        //        ///
        //        string qry_double_check = "SELECT RCODE FROM T_IPO_REC WHERE RCODE='" + applyIpoDto?.Code?.Trim() + "' AND IPO_NAME='" + applyIpoDto.IpoName + "'";
        //        var doubleCheck = _unitofWork.SP_Call.ListByRawQuery<string>(qry_double_check).AsQueryable().FirstOrDefault();
        //        if (!string.IsNullOrEmpty(doubleCheck))
        //        {
        //            return BadRequest(new ApiResponse(400, "You have already applied for this code!! " + applyIpoDto.Code));
                   
        //        }

        //        ////end checking previous Entry  
        //        ///

        //        /// get affected code list
        //        /// 
        //        string acc_type = "General";
        //        string queryAff = "SELECT RCODE FROM T_affected WHERE RCODE='" + applyIpoDto?.Code?.Trim() + "'";
        //        var affectedCode = _unitofWork.SP_Call.ListByRawQuery<string>(queryAff).AsQueryable().FirstOrDefault();

        //        if (!string.IsNullOrEmpty(affectedCode))
        //        {
        //            acc_type = "Affected";
        //        }

        //        ////// get IPO details 
        //        string query = "SELECT IPO_SL,IPO_NAME,LOT_SIZE,PRICE,T_PRICE,S_CHARGE,T_PRICE_WORD FROM T_IPO_Details WHERE IPO_NAME='" + applyIpoDto.IpoName + "' AND ON_OFF='1'";
        //        var ipoDetails = _unitofWork.SP_Call.ListByRawQuery<T_IPO_Details>(query).AsQueryable().FirstOrDefault();

        //        string? ipo_code = ipoDetails?.IPO_SL.ToString();
        //        string? ipo_name = ipoDetails?.IPO_NAME;

        //        double ipo_amount = Convert.ToDouble(ipoDetails?.T_PRICE);

        //        string? ipo_amount_words = ipoDetails?.T_PRICE_WORD;
        //        double s_charge = Convert.ToDouble(ipoDetails?.S_CHARGE);

        //        query = "SELECT MAX(ROW_ID) AS ROW_ID FROM T_IPO_REC";
        //        var row_id = _unitofWork.SP_Call.ListByRawQuery<int>(query).AsQueryable().FirstOrDefault();

        //        if (check_EI(applyIpoDto?.Code?.Trim(), applyIpoDto.IpoName))
        //        {
        //            var username = HttpContext?.User.FindFirstValue(ClaimTypes.Name);

        //            string query2 = @"SELECT ldgbal FROM T_Tkbal WHERE acode='" + applyIpoDto?.Code?.Trim() + "'";
        //            var ldgBal = _unitofWork.SP_Call.ListByRawQueryBySis<decimal>(query2).AsQueryable().FirstOrDefault();

        //            int branch_code = get_branch_code(applyIpoDto.Code); //////get branch code according to RCODE

        //            string get_max_transection_id = "INSERT INTO T_IPO_TRANSECTION_GENERATOR (note,date_time) VALUES('Not Used', getdate()); SELECT SCOPE_IDENTITY() AS max_id";

        //            var mr_no_m = _unitofWork.SP_Call.ListByRawQuery<int>(get_max_transection_id).AsQueryable().FirstOrDefault();
        //            string rcv_type = "Ledger";

        //            string mr_no = "18" + Convert.ToString(row_id) + Convert.ToString(ipoDetails?.IPO_SL) + DateTime.Now.Day.ToString() + DateTime.Now.Month.ToString() + DateTime.Now.Year.ToString();

        //            string queryInsert = "INSERT INTO T_IPO_REC(ROW_ID,MR_NO_M,MR_NO,RCODE,ACC_TYPE,MOBILE,IPO_SL,IPO_CODE,IPO_NAME,RCV_TYPE,APPLY_FROM,BKASH_REF_NO,BKASH_FLAG,BANK_NAME,CHK_NO,CHK_APPROVED,CHK_REJ_DATE,IPO_AMOUNT,IPO_AMOUNT_WORDS,ENTRY_DATE,BRANCH_CODE,PC_NAME,IP_ADDRESS,USER_NAME,IPO_RESULT,EFT, FLAG1, REFUND_CODE, FLAG3, BANK_BRANCH_NAME, DEPOSIT_DATE, sendLedger, SCHARGE)VALUES(" + row_id + ","
        //                                                    + mr_no_m + ",'"
        //                                                    + mr_no + "','"
        //                                                    + applyIpoDto?.Code?.Trim() + "','"
        //                                                    + acc_type + "','"
        //                                                    + username + "',"
        //                                                    + ipo_code + ",'"
        //                                                    + ipo_code.ToString() + "','"
        //                                                    + ipo_name + "','"
        //                                                    + rcv_type + "','WEB','','','','',2,'','" + ipo_amount + "','" + ipo_amount_words + "', GETDATE() ," + branch_code + ",'','','','','0', '','','', '', '', 1, " + s_charge + ")";

        //            if (Convert.ToDouble(ldgBal) >= ipo_amount)
        //            {
        //                _unitofWork.SP_Call.ExecuteWithoutReturnByQuery(queryInsert);
        //                insert_to_tracker("IPO Apply: " + applyIpoDto.IpoName, username);

        //                string get_max_transection_id1 = "UPDATE T_IPO_TRANSECTION_GENERATOR SET note=CONVERT(VARCHAR,getDate(),109) WHERE tr_no='" + mr_no_m + "'";
        //                _unitofWork.SP_Call.ExecuteWithoutReturnByQuery(get_max_transection_id1);

        //                //////////////////////////////////////////////////////   Send SMS   ////////////////
        //                ///
        //                string sms_content = "IPO Application: " + applyIpoDto.IpoName + " is received against your code: " + applyIpoDto?.Code?.Trim() + " AND MR No: " + mr_no_m + ".For Query: 09606016379";

        //                string sms_content_2 = @"EXEC sp_send_SMS_common '" + username + "','" + sms_content + "'";
        //                _unitofWork.SP_Call.ExecuteWithoutReturnByQuery(sms_content_2);

        //                return Ok();
        //            }
        //            else
        //            {
        //                insert_to_tracker("IPO Apply: " + applyIpoDto?.IpoName, username, 0);
        //                return BadRequest(new ApiResponse(400, "You don't have sufficient Ledger Balance to Apply this IPO!! " +applyIpoDto.IpoName));
        //              //  return Json(new { success = false, msg = "You don't have sufficient Ledger Balance to Apply this IPO " + applyIpoDto.IpoName });

        //            }
        //        }
        //        else
        //        {
        //            return BadRequest(new ApiResponse(400, "You are not an Eligible for this IPO Application!! " + applyIpoDto.IpoName));
        //           // return Json(new { success = false, msg = "You are not an Eligible for this IPO Application" });
        //        }
        //    }
        //    catch 
        //    {
        //        return BadRequest(new ApiResponse(500, "Server Error!!"));
        //    }
        //    //return Ok();
        //}

        //[Route("ch")]
        //private bool check_EI(string RCODE, string IPO_NAME)
        //{

        //    string query = "SELECT [RCODE] FROM [T_IPO_EI_CLIENT] WHERE RCODE='" + RCODE + "' AND [IPONAME]='" + IPO_NAME + "'";

        //    var eligible = _unitofWork.SP_Call.ListByRawQuery<string>(query).AsQueryable().FirstOrDefault();
        //    if (!string.IsNullOrEmpty(eligible))
        //    {
        //        return true;
        //    }

        //    return false;


        //}

        //[Route("br")]
        //public int get_branch_code(string rcode)
        //{
        //    int branch_code = 0;

        //    int n;
        //    bool isNumeric = int.TryParse(rcode, out n);

        //    if (isNumeric)
        //    {
        //        double rcode_numeric = Convert.ToDouble(rcode);
        //        if ((rcode_numeric > 0 && rcode_numeric <= 9999) || (rcode_numeric >= 20000 && rcode_numeric < 30000) || (rcode_numeric >= 90000 && rcode_numeric <= 150000))
        //        {
        //            branch_code = 1;

        //        }
        //        if (rcode_numeric >= 10000 && rcode_numeric <= 19999)
        //        {
        //            branch_code = 3;

        //        }
        //        if (rcode_numeric >= 30000 && rcode_numeric <= 39999)
        //        {
        //            branch_code = 4;

        //        }
        //        if (rcode_numeric >= 40000 && rcode_numeric <= 45100)
        //        {
        //            branch_code = 10;

        //        }
        //        if (rcode_numeric >= 45101 && rcode_numeric <= 49999)
        //        {
        //            branch_code = 11;

        //        }
        //        if (rcode_numeric >= 50000 && rcode_numeric <= 59999)
        //        {
        //            branch_code = 9;

        //        }
        //        if (rcode_numeric >= 60000 && rcode_numeric <= 64999)
        //        {
        //            branch_code = 8;

        //        }
        //        if (rcode_numeric >= 65000 && rcode_numeric <= 69999)
        //        {
        //            branch_code = 7;

        //        }
        //        if (rcode_numeric >= 70000 && rcode_numeric <= 74999)
        //        {
        //            branch_code = 6;

        //        }
        //        if (rcode_numeric >= 75000 && rcode_numeric <= 79999)
        //        {
        //            branch_code = 12;

        //        }
        //        if (rcode_numeric >= 80000 && rcode_numeric <= 85000)
        //        {
        //            branch_code = 13;

        //        }
        //        if (rcode_numeric == 200001)
        //        {
        //            branch_code = 10;
        //        }
        //        if (rcode_numeric == 200002)
        //        {
        //            branch_code = 11;
        //        }
        //        if (rcode_numeric == 200003)
        //        {
        //            branch_code = 9;
        //        }
        //        if (rcode_numeric == 200004)
        //        {
        //            branch_code = 8;
        //        }
        //        if (rcode_numeric == 200005)
        //        {
        //            branch_code = 7;
        //        }
        //        if (rcode_numeric == 200006)
        //        {
        //            branch_code = 6;
        //        }
        //        if (rcode_numeric == 200007)
        //        {
        //            branch_code = 12;
        //        }
        //        if (rcode_numeric == 200008)
        //        {
        //            branch_code = 13;
        //        }
        //        if (rcode_numeric == 200009)
        //        {
        //            branch_code = 5;
        //        }


        //    }
        //    else
        //    {
        //        string branch_prefix = rcode.ToString().Substring(0, 2);

        //        switch (branch_prefix.ToUpper())
        //        {
        //            case "AG":

        //                branch_code = 1;
        //                break;

        //            case "EB":

        //                branch_code = 3;
        //                break;

        //            case "MJ":

        //                branch_code = 4;
        //                break;
        //            case "DX":

        //                branch_code = 4;
        //                break;
        //            case "KL":

        //                branch_code = 10;
        //                break;
        //            case "JR":

        //                branch_code = 11;
        //                break;
        //            case "FE":

        //                branch_code = 9;
        //                break;
        //            case "NG":

        //                branch_code = 8;
        //                break;

        //            case "FM":

        //                branch_code = 7;
        //                break;

        //            case "MP":

        //                branch_code = 6;
        //                break;
        //            case "BG":

        //                branch_code = 12;
        //                break;
        //            case "RB":

        //                branch_code = 13;
        //                break;
        //            case "DN":

        //                branch_code = 5;
        //                break;
        //            case "BP":

        //                branch_code = 15;
        //                break;


        //            case "KT":

        //                branch_code = 20;
        //                break;

        //            case "NK":

        //                branch_code = 21;
        //                break;

        //            default:
        //                branch_code = 1;
        //                break;
        //        }
        //    }
        //    return branch_code;

        //}

        //async void insert_to_tracker(string action_type, string user_id, int status = 1)
        //{
        //    var remoteIpAddress = HttpContext.Connection.RemoteIpAddress;


        //    string query = @"INSERT INTO T_WEB_USER_TRACKER (user_id, IP_address, action_type, status) VALUES ('" + user_id + "', '" + remoteIpAddress + "', '" + action_type + "', " + status + ")";
        //    await _unitofWork.SP_Call.ExecuteWithoutReturnByQuery(query);
        //}

    }
}
