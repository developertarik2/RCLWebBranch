using AutoMapper;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using RCLWebBranch.DATA.Dtos;
using RCLWebBranch.DATA.Models;
using RCLWebBranch.DATA.QueryVMs;
using RCLWebBranch.DATA.ViewModels;
using RCLWebBranch.Errors;
using RCLWebBranch.Helpers;
using RCLWebBranch.Infrastructure.InterfaceRepo;
using RCLWebBranch.Infrastructure.Services.Interfaces;
using RCLWebBranch.Insfrastructures.Services.Interfaces;
using System.Collections.Generic;
using System.Security.Claims;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using static System.Runtime.CompilerServices.RuntimeHelpers;

namespace RCLWebBranch.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientReportController : ControllerBase
    {
        private readonly IUnitOfWork _unitofWork;
        private readonly IClientService _clientServie;
        private readonly IBranchPermission _branchPermission;
        private readonly IMapper _mapper;
        public ClientReportController(IUnitOfWork unitOfWork, IClientService clientService,IMapper mapper,IBranchPermission branchPermission) 
        {
            _unitofWork = unitOfWork;
            _clientServie = clientService;
            _branchPermission = branchPermission;
            _mapper = mapper;
        }

        [HttpGet]
        [Route("getCompanyData")]
        public async Task<ActionResult<Pagination<ClientPortfolioList>>> Get([FromQuery] CompanySpecParams companyParams)
        {
            //string code=string.Empty;
            var client = _clientServie.GetClientDetails(companyParams.Code);
            if (client == null)
            {
                return NotFound();
            }
            var dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@acode", companyParams.Code);
            var list = _unitofWork.SP_Call.ReturnListFromSis<ClientPortfolioList>("inv_pfs_td", dynamicParameters).ToList();

            list.RemoveAll(x => x.Grp != 0);

            //var data = _mapper
            //    .Map<IReadOnlyList<ClientPortfolioList>, IReadOnlyList<ProductToReturnDto>>(products);
            //return list;
            return Ok(new Pagination<ClientPortfolioList>(companyParams.PageIndex, companyParams.PageSize, list.Count, list));
            // return Ok();
        }
        [Authorize]
        [HttpPost]
        [Route("getPortfolio")]
        public async Task<ActionResult<ClientPortfolioVM>> GetPortfolio([FromBody] ClientPortfolioDto client)
        {
            try
            {
                if (string.IsNullOrEmpty(client.Code))
                {
                    return BadRequest(new ApiResponse(404, "Invalid Code!!"));
                }
                var clientExist = _clientServie.GetClientDetails(client.Code);
                if (clientExist == null)
                {
                    return BadRequest(new ApiResponse(404, "Invalid Code!!"));
                }
                var username = HttpContext.User?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.Name)?.Value;
                var user = await _unitofWork.BranchLogin.GetFirstOrDefault(u => u.USERID == username);

                bool isPermit = _branchPermission.IsClientCodePermited(user.USERID, client.Code.Trim());
                if (!isPermit)
                {
                    return BadRequest(new ApiResponse(401, "This code is locked by IT Team!!"));
                }

                if (client.Code.Trim().ToUpper() == "BG9922" || client.Code.Trim().ToUpper() == "BG9923" || client.Code.Trim().ToUpper() == "BG9606")
                {
                    return BadRequest(new ApiResponse(401, "This code is locked by IT Team!!"));
                  
                }

                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@acode", client.Code);
                var list = _unitofWork.SP_Call.ReturnListFromSis<ClientPortfolioList>("inv_pfs_td", dynamicParameters).ToList();

                list.RemoveAll(x => x.Grp != 0);

                string? query = string.Empty;


                ClientPortfolioVM model = new()
                {
                    CompanyLists = list,
                    RglBal=0
                };
                query = @"SELECT rgl FROM T_RGL WHERE acode='" + client.Code + "' ";
                var rglBal = _unitofWork.SP_Call.ListByRawQueryBySis<dynamic>(query).AsQueryable().FirstOrDefault();
                if(rglBal != null)
                {
                    model.RglBal = rglBal?.rgl;
                }
               



                query = "SELECT intamt FROM T_intsum WHERE acode='" + client.Code + "'";
                var accured = _unitofWork.SP_Call.ListByRawQueryBySis<dynamic>(query).AsQueryable().FirstOrDefault();
                model.AccruedBal = accured?.intamt;


                query = "SELECT matbalP,ldgbal FROM T_Tkbal WHERE acode = '" + client.Code + "'";
                var mat = _unitofWork.SP_Call.ListByRawQueryBySis<dynamic>(query).AsQueryable().FirstOrDefault();
                model.MaturedBal = mat?.matbalP;
                model.LedgerBal = mat?.ldgbal;

                model.SaleRec = Convert.ToDecimal(0.00);
                model.ChargeFee = Convert.ToDecimal(0.00);

                query = "SELECT BAL FROM T_SRTD WHERE ACODE='" + client.Code + "'";
                var bal = _unitofWork.SP_Call.ListByRawQueryBySis<dynamic>(query).AsQueryable().FirstOrDefault();

                if(bal != null)
                {
                    model.SaleRec = bal?.BAL;
                }


                // if (model.SaleRec.ToString() != "0.00")
                if (model.SaleRec != 0)
                {
                    model.LedgerBal = model.LedgerBal;
                }
                else
                {
                    // model.LedgerBal = model.LedgerBal + bal?.BAL;
                    model.LedgerBal = model.LedgerBal + model.SaleRec;
                }

                query = @"SELECT IPO_NAME,IPO_AMOUNT,CONVERT(VARCHAR(10),ENTRY_DATE,101) 'AppliedDate' FROM RCLWEB.dbo.T_IPO_REC " +
                    "WHERE RCODE='" + client.Code + "' AND IPO_RESULT='' and DATEDIFF(DAY, ENTRY_DATE, GETDATE())<100 UNION ALL SELECT " +
                    "IPO_NAME,IPO_AMOUNT,CONVERT(VARCHAR(10),ENTRY_DATE,101) 'AppliedDate' FROM RCLWEB.dbo.T_IPO_REC_MASTER " +
                    "WHERE RCODE='" + client.Code + "' AND IPO_RESULT='' and DATEDIFF(DAY,ENTRY_DATE,GETDATE())<100";



                query = @"SELECT SUM(CONVERT(decimal(20,2),totcost)) AS 'TotalCost',SUM(CONVERT(decimal(20,2),(a.totqty*c.iclose))) AS 
'MarketValue',SUM(CONVERT(decimal(20,2),((a.totqty*c.iclose)-(a.totcost)))) AS 'GainLoss' FROM T_PF a,T_idxshrp c WHERE a.acode='" + client.Code + "' " +
    "AND a.firmscd=c.firmscd AND c.tdate=(SELECT MAX(tdate) FROM T_idxshrp where firmscd= c.firmscd)";
                var totalBal = _unitofWork.SP_Call.ListByRawQueryBySis<dynamic>(query).AsQueryable().FirstOrDefault();

                model.TotalBuyCost = totalBal?.TotalCost;
                model.MarketVal = totalBal?.MarketValue;
                model.EquityBal = totalBal?.MarketValue + model.LedgerBal - model.AccruedBal;
                model.UnrealiseBal = totalBal?.GainLoss;
                model.TotalCapital = model.UnrealiseBal + model.RglBal;

                int n = 1;
                foreach(var item in model.CompanyLists)
                {
                    item.Sl = n;
                    n++;
                    if(item.Pldqty == 0)
                    {
                        item.Pldqty = null;
                    }
                }

                return model;
            }
            catch
            {
                return BadRequest(new ApiResponse(500, "Server Error!!"));
            }
        }
        [Authorize]
        [HttpPost]
        [Route("getLedger")]
      //  [Route("getLedger")]
        public async Task<ActionResult<List<LedgerDetailsVM>>> ClientLedger([FromBody] ClientLedgerDto clientLedgerDto)
        {
            try
            {
                if (string.IsNullOrEmpty(clientLedgerDto.Code))
                {
                    return BadRequest(new ApiResponse(400, "Invalid code!!"));
                }
                if (DateTime.ParseExact(clientLedgerDto.FromDate, "yyyy-MM-dd", null) >
                    DateTime.ParseExact(clientLedgerDto.ToDate, "yyyy-MM-dd", null))
                {
                    ModelState.AddModelError("", "From Date is greater then To Date");
                }

                if (ModelState.IsValid)
                {
                    var username = HttpContext.User?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.Name)?.Value;
                    var user = await _unitofWork.BranchLogin.GetFirstOrDefault(u => u.USERID == username);

                    bool isPermit = _branchPermission.IsClientCodePermited(user.USERID, clientLedgerDto.Code.Trim());
                    if (!isPermit)
                    {
                        return BadRequest(new ApiResponse(401, "This code is locked by IT Team!!"));
                    }

                    string query3 = @"SELECT acode,aname,boid,(addr1+' '+addr2+' ' +city) address,faname,moname FROM T_CLIENT WHERE acode='" + clientLedgerDto.Code + "'";

                    var client = _clientServie.GetClientDetails(clientLedgerDto.Code);
                    if (client == null)
                    {
                        // return NotFound();
                        return BadRequest(new ApiResponse(400, "Invalid code!!"));
                    }
                    double bal, opbal1;
                    string query2 = @"SELECT sum((case a.b_or_s  when '1' then -a.amount when '2' then a.amount when '3' 
           then a.amount when '4' then -a.amount end) -a.commsn) as opbal  from t_sh a where a.acode ='" + clientLedgerDto.Code + "' AND a.tdate<'" + clientLedgerDto.FromDate + "'";

                    var priBal = _unitofWork.SP_Call.ListByRawQueryBySis<dynamic>(query2).AsQueryable().FirstOrDefault();
                    opbal1 = Convert.ToDouble(priBal?.opbal);

                    query2 = @"SELECT a.vno as vno,a.tdate AS tdate,(case a.b_or_s when '1' then 'Buy' when '2' then 
'Sale' when '3' then 'Receipt' when '4' then 'Payment' end) as  type,(case a.tran_type when 'T' then RTRIM(a.narr)+' '+rtrim(ISNULL(A.DOC_NO, '')) + (case when len(a.chqno) > 0 then ' [' +rtrim(a.chqno)+' ]' else '' end) when 'S' then b.firmsnm1 end) as narr,sum(a.quantity) 
as quantity,(CASE sum(a.quantity) WHEN 0 THEN 0 ELSE (SUM(a.amount)/sum(a.quantity)) END) 
as rate,sum(case a.b_or_s when '1' then a.amount when '2' then 0 when '3' then 0 when '4' then a.amount end) 
as debit, sum(case a.b_or_s when '1' then 0 when '2' then a.amount when '3' then a.amount when '4' then 0 end) 
as credit,sum(a.commsn) as commission, sum((case a.b_or_s  when '1' then -a.amount when '2' then a.amount when '3' 
then a.amount when '4' then -a.amount end) -a.commsn)  as balance,a.b_or_s,a.ttype FROM t_sh a, t_firms b 
WHERE a.firmscd=b.firmscd AND a.acode ='" + clientLedgerDto.Code + "' AND a.tdate BETWEEN '" + clientLedgerDto.FromDate + "' AND '" + clientLedgerDto.ToDate + "'" +
        "group by a.acode, a.tdate, b.firmsnm1, a.b_or_s, a.narr, a.vno, a.tran_type, A.DOC_NO, a.ttype, a.chqno ORDER BY a.tdate,a.vno, b.firmsnm1,a.b_or_s";


                    bal = opbal1;
                    var list = _unitofWork.SP_Call.ListByRawQueryBySis<LedgerDetailsVM>(query2).AsQueryable().Select(c => new LedgerDetailsVM
                    {
                        Vno = c.Vno,
                        Tdate = c.Tdate,
                        Type = c.Type,
                        Narr = c.Narr,
                        Quantity = c.Quantity,
                        Rate = c.Rate,
                        Debit = c.Debit,
                        Credit = c.Credit,
                        Commission = c.Commission,
                        Balance = c.Balance,
                    }).ToList();

                    foreach (var item in list)
                    {
                        bal = bal + item.Balance.GetValueOrDefault();
                        item.TotalBalance = bal;
                    }
                    //ViewData["from"] = fromDate;
                    //ViewData["to"] = toDate;
                    return list;
                }
                else
                {
                    return BadRequest(new ApiResponse(400, "Invalid input!!"));
                }
            }
            catch
            {
                return BadRequest(new ApiResponse(500, "Server Error!!"));
            }

        }
        [HttpPost]
        [Route("clientLedger")]
        [Authorize]
        public async Task<ActionResult<ClientDetailsVM>> GetClientLedger([FromBody] ClientLedgerDto clientLedgerDto)
        {
            if (string.IsNullOrEmpty(clientLedgerDto.Code))
            {
                return BadRequest(new ApiResponse(400, "Invalid code!!"));
            }
            if (DateTime.ParseExact(clientLedgerDto.FromDate, "yyyy-MM-dd", null) >
                DateTime.ParseExact(clientLedgerDto.ToDate, "yyyy-MM-dd", null))
            {
                ModelState.AddModelError("", "From Date is greater then To Date");
            }
            var clientExist = _clientServie.GetClientDetails(clientLedgerDto.Code.Trim());
            if (clientExist == null)
            {
                return BadRequest(new ApiResponse(404, "Invalid Code!!"));
            }
            var username = HttpContext.User?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.Name)?.Value;
            var user = await _unitofWork.BranchLogin.GetFirstOrDefault(u => u.USERID == username);

            bool isPermit = _branchPermission.IsClientCodePermited(user.USERID, clientLedgerDto.Code.Trim());
            if (!isPermit)
            {
                return BadRequest(new ApiResponse(401, "This code is locked by IT Team!!"));
            }



            string query = @"SELECT a.vno as vno,a.tdate AS tdate,
(case a.b_or_s when '1' then 'Buy' when '2' then 'Sale' when '3' then 'Receipt' when '4' then 'Payment' end) 
as  type,(case a.tran_type when 'T' then RTRIM(a.narr)+' '+rtrim(ISNULL(A.DOC_NO, '')) + (case when len(a.chqno) > 0 
then ' [' +rtrim(a.chqno)+' ]' else '' end) when 'S' then b.firmsnm1 end) 
as narr,sum(a.quantity) as quantity, (CASE sum(a.quantity) WHEN 0 THEN 0 ELSE (SUM(a.amount)/sum(a.quantity)) END) 
as rate,sum(case a.b_or_s when '1' then a.amount when '2' then 0 when '3' then 0 when '4' then a.amount end) 
as debit, sum(case a.b_or_s when '1' then 0 when '2' then a.amount when '3' then a.amount when '4' then 0 end) 
as credit,sum(a.commsn) as commsn, sum((case a.b_or_s  when '1' then -a.amount when '2' then a.amount when '3' 
then a.amount when '4' then -a.amount end) -a.commsn)  as balance,a.b_or_s,a.ttype FROM t_sh a, t_firms b 
WHERE a.firmscd=b.firmscd AND a.acode ='" + clientLedgerDto.Code.Trim() + "' AND a.tdate BETWEEN '" + clientLedgerDto.FromDate + "' AND '" + clientLedgerDto.ToDate + "' AND a.acode NOT IN('MP4311','MP4400','MP4422') " +
"group by a.acode, a.tdate, b.firmsnm1, a.b_or_s, a.narr, a.vno, a.tran_type, A.DOC_NO, a.ttype, a.chqno ORDER BY a.tdate,a.vno, b.firmsnm1,a.b_or_s";

            return Ok();
        }
        [HttpGet]
        [Route("getClient")]
        public ActionResult<ClientDetailsVM> GetClient( string code)
        {
            if(string.IsNullOrEmpty(code))
            {
                return BadRequest(new ApiResponse(404, "Invalid code!!"));
            }
            var client = _clientServie.GetClientDetails(code);
            if (client == null)
            {
                // return NotFound();
                return BadRequest(new ApiResponse(404, "Invalid code!!"));
            }
            return client;
        }

        [Authorize]
        [HttpPost]
        [Route("getPlDetails")]
        public async Task<ActionResult<PlDetailsPartialVM>> GetPlDetails([FromBody] ClientLedgerDto clientLedgerDto)
        {
            if (string.IsNullOrEmpty(clientLedgerDto.Code))
            {
                return BadRequest(new ApiResponse(400, "Invalid code!!"));
            }
            if (DateTime.ParseExact(clientLedgerDto.FromDate, "yyyy-MM-dd", null) >
                DateTime.ParseExact(clientLedgerDto.ToDate, "yyyy-MM-dd", null))
            {
                ModelState.AddModelError("", "From Date is greater then To Date");
            }
            var client = _clientServie.GetClientDetails(clientLedgerDto.Code);
            if (client == null)
            {
                // return NotFound();
                return BadRequest(new ApiResponse(400, "Invalid code!!"));
            }
            if(ModelState.IsValid)
            {
                try
                {
                    var username = HttpContext.User?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.Name)?.Value;
                    var user = await _unitofWork.BranchLogin.GetFirstOrDefault(u => u.USERID == username);

                    bool isPermit = _branchPermission.IsClientCodePermited(user.USERID, clientLedgerDto.Code.Trim());
                    if (!isPermit)
                    {
                        return BadRequest(new ApiResponse(401, "This code is locked by IT Team!!"));
                    }

                    var model =await GetPlDetailsPartial(clientLedgerDto.Code, Convert.ToDateTime(clientLedgerDto.FromDate), Convert.ToDateTime(clientLedgerDto.ToDate));


                    return model;
                }
                catch(Exception ex)
                {
                    return BadRequest(new ApiResponse(500, "Server Error!!"));
                }
            }
            else
            {
                return BadRequest(new ApiResponse(400, "Invalid input!!"));
            }
        }
        private async Task <PlDetailsPartialVM> GetPlDetailsPartial(string code, DateTime startDate, DateTime endDate)
        {
            //if (code == null)
            //{
            //    return NotFound();
            //}
            //string query3 = @"SELECT acode,aname,boid,(addr1+' '+addr2+' ' +city) address,faname,moname FROM T_CLIENT WHERE acode='" + code + "'";
            //var client = _unitofWork.SP_Call.ListByRawQuery<ClientDetailsVM>(query3).AsQueryable().FirstOrDefault();

            //if (client == null)
            //{
            //    return NotFound();
            //}
            double portfolioValueMarketPrice = 0;
            double PortfolioValueCostPrice = 0;
            //double PortfolioOpeningShareBalance = 0;
            double realiseGain = 0;
            double OpeningShareBal = 0;



            int flag = 0;
            int findFlag = 0;
            double totalBCost = 0;
            double totalSCost = 0;
            double totalRG = 0;
            double totalBCost1 = 0;
            double totalSCost1 = 0;
            double totalRG1 = 0;
            double TotalBA = 0;
            double TotalBA1 = 0;
            double TotalMA = 0;
            double TotalMA1 = 0;
            double TotalUR = 0;
            double TotalUR1 = 0;

            //DateTime now = DateTime.Now;
            //var startDate = new DateTime(now.Year, now.Month, 1);
            //var endDate = DateTime.Now;


            string query = @"SELECT DISTINCT firmscd FROM SISROYALU.dbo.T_COS ab 
           WHERE ab.acode='" + code + "' AND ab.tdate<= '" + endDate + "' AND ab.tran_type='S' GROUP BY ab.firmscd";

            var firms = _unitofWork.SP_Call.ListByRawQueryBySis<dynamic>(query).AsQueryable().ToList(); //.Select(c => new string

            foreach (var firm in firms)
            {
                string quer = @"INSERT INTO OpeningShare EXEC [SISROYALU].[dbo].[sp_cos_ss_dt] '" + code + "','" + firm.firmscd + "' ,'" + startDate + "','" + endDate + "' ";
                await _unitofWork.SP_Call.ExecuteWithoutReturnByQuery(quer);
            }

            string query2 = @"EXEC [dbo].[uSP_PL] '" + code + "','" + startDate + "','" + endDate + "'";

            var plList = _unitofWork.SP_Call.ListByRawQuery<PlDetails>(query2).AsQueryable().ToList();
            List<PlDetailList> list = new List<PlDetailList>();
            foreach (var pl in plList)
            {
                if (Convert.ToDouble(pl.BuyQnty.ToString()) != 0 && (pl?.SaleQnt?.ToString() != null || pl?.SaleQnt?.ToString() != ""))
                {
                    flag++;
                    PlDetailList model = new()
                    {
                        SL = flag,
                        Firmsnm1 = pl?.Firmsnm1,
                        BuyQnty = pl.BuyQnty,
                        BuyAmount = pl?.BuyAmount,
                        SaleQnt = pl?.SaleQnt,
                        SaleAmnt = pl?.SaleAmnt,
                        RG = pl?.RG,
                        BQ = pl?.BQ,
                        BR = pl?.BR,
                        BA = pl?.BA,
                        TMR = pl?.TMR,
                        TMA = pl?.TMA,
                        TUG = pl?.TUG,
                    };

                    if (pl?.BuyAmount?.ToString() == "") totalBCost1 = 0;
                    else totalBCost1 = Convert.ToDouble(pl?.BuyAmount?.ToString());
                    totalBCost += totalBCost1;

                    if (pl?.SaleAmnt?.ToString() == "") totalSCost1 = 0;
                    else totalSCost1 = Convert.ToDouble(pl?.SaleAmnt?.ToString());
                    totalSCost += totalSCost1;

                    if (pl?.RG?.ToString() == "") totalRG1 = 0;
                    else totalRG1 = Convert.ToDouble(pl?.RG?.ToString());
                    totalRG += totalRG1;

                    if (pl?.BA?.ToString() == "") TotalBA1 = 0;
                    else TotalBA1 = Convert.ToDouble(pl?.BA?.ToString());
                    TotalBA += TotalBA1;

                    if (pl?.TMA?.ToString() == "") TotalMA1 = 0;
                    else TotalMA1 = Convert.ToDouble(pl?.TMA?.ToString());
                    TotalMA += TotalMA1;

                    if (pl?.TUG?.ToString() == "") TotalUR1 = 0;
                    else TotalUR1 = Convert.ToDouble(pl?.TUG?.ToString());
                    TotalUR += TotalUR1;


                    list.Add(model);
                }
            }

            PlDetailsPartialVM plDetailsPartial = new()
            {
                PlDetailList = list,
                BoughtCost = Convert.ToDecimal(totalBCost),
                SoldCost = Convert.ToDecimal(totalSCost),
                RealisedGain_Loss = Convert.ToDecimal(totalRG),
                BalanceAmnt = Convert.ToDecimal(TotalBA),
                MarketAmnt = Convert.ToDecimal(TotalMA),
                UnrealisedGain = Convert.ToDecimal(TotalUR),
                FromDate = startDate,
                ToDate = endDate
            };

            portfolioValueMarketPrice = TotalMA;
            PortfolioValueCostPrice = TotalBA;
            realiseGain = totalRG;


            query2 = @"SELECT b.firmsnm1,ISNULL(a.quantity,0) quantity,ISNULL(a.amount,0) amount, CONVERT(VARCHAR,a.dtofent,105) dat FROM T_RR a,T_firms b WHERE a.firmscd=b.firmscd AND acode='" + code + "' AND cert_no='IPO' AND a.dtofent BETWEEN '" + startDate + "' AND '" + endDate + "'";


            var ipoShareList = _unitofWork.SP_Call.ListByRawQueryBySis<IPOShareList>(query2).AsQueryable().ToList();
            plDetailsPartial.IPOShareLists = ipoShareList;

            query2 = @"SELECT b.firmsnm1,ISNULL(a.quantity,0) quantity,ISNULL(a.amount,0) amount, CONVERT(VARCHAR,a.dtofent,105) dat FROM T_RR a,T_firms b WHERE a.firmscd=b.firmscd AND acode='" + code + "' AND cert_no='BONUS' AND a.dtofent BETWEEN '" + startDate + "' AND '" + endDate + "'";


            var bonusShareList = _unitofWork.SP_Call.ListByRawQueryBySis<IPOShareList>(query2).AsQueryable().ToList();
            plDetailsPartial.BonusShareLists = bonusShareList;

            query2 = @"SELECT b.firmsnm1,ISNULL(a.quantity,0) quantity,ISNULL(a.amount,0) amount, CONVERT(VARCHAR,a.dtofent,105) dat FROM T_RR a,T_firms b WHERE a.firmscd=b.firmscd AND acode='" + code + "' AND cert_no='RIGHT' AND a.dtofent BETWEEN '" + startDate + "' AND '" + endDate + "'";


            var rightShareList = _unitofWork.SP_Call.ListByRawQueryBySis<IPOShareList>(query2).AsQueryable().ToList();
            plDetailsPartial.RightShareLists = rightShareList;

            query2 = @"EXEC [dbo].[uSP_PL_CAL] '" + code + "','" + startDate + "','" + endDate + "'";
            var calculation = _unitofWork.SP_Call.ListByRawQuery<dynamic>(query2).AsQueryable().FirstOrDefault();

            plDetailsPartial.LedgerBal = calculation?.Ledger;
            plDetailsPartial.PortfolioValueMarket = Convert.ToDecimal(portfolioValueMarketPrice);
            plDetailsPartial.PortfolioValueCost = Convert.ToDecimal(PortfolioValueCostPrice);
            plDetailsPartial.Deposit = calculation?.deposit;
            plDetailsPartial.WithdrawnAmount = calculation?.withdraw;
            plDetailsPartial.Charges = calculation?.charge;
            plDetailsPartial.NetDeposit = calculation?.NetDeposit;
            plDetailsPartial.RealisedCapitalGainLoss = totalRG;

            if(plDetailsPartial.Charges == null)
            {
                plDetailsPartial.Charges = 0;
            }
            if (plDetailsPartial.NetDeposit == null)
            {
                plDetailsPartial.NetDeposit = 0;
            }

            try

            {
                query2 = @"EXEC SISROYALU.[dbo].[SP_INV_TCOS] '" + startDate + "','" + code + "'";
                var openingBal = _unitofWork.SP_Call.ListByRawQueryBySis<dynamic>(query2).AsQueryable().ToList();

                foreach (var item in openingBal)
                {
                    if (Convert.ToDouble(item?.rate) != 0)
                    {
                        OpeningShareBal += Convert.ToDouble(item?.amount);
                    }
                }
                plDetailsPartial.OpeningShareBal = OpeningShareBal;
            }
            catch
            {
                plDetailsPartial.OpeningShareBal = OpeningShareBal;
            }

            return plDetailsPartial;
        }

        [Authorize]
        [HttpPost]
        [Route("getClientConfirmation")]
        public async Task<ActionResult<ClientConfirmation>> GetClientConfirmation([FromBody] ClientConfirmationDto clientConfirmationDto)
        {
            if (string.IsNullOrEmpty(clientConfirmationDto.Code))
            {
                return BadRequest(new ApiResponse(400, "Invalid code!!"));
            }
            if (string.IsNullOrEmpty(clientConfirmationDto.Date))
               
            {
                return BadRequest(new ApiResponse(400, "Input Date can not be empty!!"));
               // ModelState.AddModelError("", "Input Date can not be empty");
            }
            var clientExist = _clientServie.GetClientDetails(clientConfirmationDto.Code.Trim());
            if (clientExist == null)
            {
                return BadRequest(new ApiResponse(404, "Invalid Code!!"));
            }
            try
            {
                var username = HttpContext.User?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.Name)?.Value;
                var user = await _unitofWork.BranchLogin.GetFirstOrDefault(u => u.USERID == username);

                bool isPermit = _branchPermission.IsClientCodePermited(user.USERID, clientConfirmationDto.Code.Trim());
                if (!isPermit)
                {
                    return BadRequest(new ApiResponse(401, "This code is locked by IT Team!!"));
                }


                double noat = 0;

                string query = @"SELECT acode,cocd,firmsnm1,SUM((case when b_or_s ='1' then quantity else 0.00 end)) AS buyQnty,  
SUM((case when b_or_s='1' then amount else 0.00 end)) AS Bamnt,SUM((case when b_or_s ='2' then quantity else 0.00 end))" +
    "AS saleQnty, SUM((case when b_or_s='2' then amount else 0.00 end)) AS Samnt,(SUM((case when b_or_s ='1' then quantity else 0.00 end))-SUM((case when b_or_s ='2' then quantity else 0.00 end))) AS 'BalQnty'," +
    "SUM(commsn) AS commsn,((SUM((case when b_or_s='2' then amount else 0.00 end)) - SUM((case when b_or_s='1' then amount else 0.00 end)))-SUM(commsn))" +
    "AS balance FROM T_Sh WHERE acode='" + clientConfirmationDto.Code + "' AND tdate = '" + clientConfirmationDto.Date + "' GROUP BY acode,firmsnm1,cocd";

                var list = _unitofWork.SP_Call.ListByRawQueryBySis<ConfirmationDeatils>(query).AsQueryable().ToList();

                List<ConfirmationDetailsVM> list2 = new();

                foreach (var item in list)
                {
                    ConfirmationDetailsVM confirmationDetails = new();
                    if (item.Cocd == "01")
                    {
                        confirmationDetails.Exch = "DSE";
                    }
                    if (item.Cocd == "02")
                    {
                        confirmationDetails.Exch = "CSE";
                    }
                    confirmationDetails.CODE = item?.Acode;
                    confirmationDetails.Instrument = item?.Firmsnm1;

                    if (Convert.ToDouble(item?.BuyQnty) != 0.00)
                    {
                        confirmationDetails.BuyQty = item?.BuyQnty.ToString();
                        confirmationDetails.BuyAmt = item?.Bamnt.ToString();
                        confirmationDetails.BuyRate = (Convert.ToDouble(item?.Bamnt) / Convert.ToDouble(item?.BuyQnty)).ToString();
                    }
                    if (Convert.ToDouble(item?.BuyQnty) == 0.00)
                    {
                        confirmationDetails.BuyQty = "0.00";
                        confirmationDetails.BuyAmt = "0.00";
                        confirmationDetails.BuyRate = "0.00";
                    }
                    if (Convert.ToDouble(item?.SaleQnty) != 0.00)
                    {
                        confirmationDetails.SaleQty = item?.SaleQnty.ToString();
                        confirmationDetails.SaleAmt = item?.Samnt.ToString();
                        confirmationDetails.SaleRate = (Convert.ToDouble(item?.Samnt) / Convert.ToDouble(item?.SaleQnty)).ToString();
                    }
                    if (Convert.ToDouble(item?.SaleQnty) == 0.00)
                    {
                        confirmationDetails.SaleQty = "0.00";
                        confirmationDetails.SaleAmt = "0.00";
                        confirmationDetails.SaleRate = "0.00";
                    }
                    confirmationDetails.BalQty = item?.BalQnty.ToString();
                    confirmationDetails.Com_B_S = item?.Commsn.ToString();
                    confirmationDetails.Balance = item?.Balance.ToString();

                    noat += Convert.ToDouble(item?.Balance);

                    list2.Add(confirmationDetails);
                }
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@ACODE", clientConfirmationDto.Code);
                dynamicParameters.Add("@TDATE", Convert.ToDateTime(clientConfirmationDto.Date));
                dynamicParameters.Add("@COCD", "00");
                var listBal = _unitofWork.SP_Call.ReturnListFromSis<dynamic>("SP_CLIENT_BALANCE_SINGLE", dynamicParameters).FirstOrDefault();
                ClientConfirmation model = new()
                {
                    ConfirmationDetailsList = list2,
                    Ledger = Convert.ToString(listBal?.prebal),
                    Reciept = Convert.ToString(listBal?.recamt),
                    Payment = Convert.ToString(listBal?.Payamt),
                    NetAmountTrading = noat.ToString(),
                    ClosingBalance = Convert.ToString(listBal?.todbal),

                };

                return model;
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse(500, "Server Error!!"));
            }
           // return Ok();
        }

        [Authorize]
        [HttpPost]
        [Route("getClientReceipt")]
        public async Task< ActionResult<List<ClientReceipt>>> ReceiptByDate([FromBody] ClientLedgerDto clientReceiptDto)
        {
            if (string.IsNullOrEmpty(clientReceiptDto.Code?.Trim()))
            {
                return BadRequest(new ApiResponse(400, "Invalid code!!"));
            }
            if (string.IsNullOrEmpty(clientReceiptDto.FromDate))

            {
                return BadRequest(new ApiResponse(400, "Input Date can not be empty!!"));
                // ModelState.AddModelError("", "Input Date can not be empty");
            }
            if (DateTime.ParseExact(clientReceiptDto.FromDate, "yyyy-MM-dd", null) >
              DateTime.ParseExact(clientReceiptDto.ToDate, "yyyy-MM-dd", null))
            {
                ModelState.AddModelError("", "From Date is greater then To Date");
            }
            var clientExist = _clientServie.GetClientDetails(clientReceiptDto.Code?.Trim());
            if (clientExist == null)
            {
                return BadRequest(new ApiResponse(404, "Invalid Code!!"));
            }
            try
            {
                var username = HttpContext.User?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.Name)?.Value;
                var user = await _unitofWork.BranchLogin.GetFirstOrDefault(u => u.USERID == username);

                bool isPermit = _branchPermission.IsClientCodePermited(user.USERID, clientReceiptDto.Code.Trim());
                if (!isPermit)
                {
                    return BadRequest(new ApiResponse(401, "This code is locked by IT Team!!"));
                }


                string query = @"SELECT vno AS 'VoucherNo',tdate AS 'Date',(case b_or_s when 3 then amount end) AS 
     Deposit, (case b_or_s when 4 then amount end) AS Withdraw FROM T_SH WHERE acode='" + clientReceiptDto.Code?.Trim() + "' " +
     "AND tran_type='T' AND tdate BETWEEN '" + clientReceiptDto.FromDate + "' AND '" + clientReceiptDto.ToDate + "' ORDER BY tdate ";
                var list = _unitofWork.SP_Call.ListByRawQueryBySis<ClientReceipt>(query).AsQueryable().ToList();


                return list;
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse(500, "Server Error!!"));
            }

        }
        [Authorize]
        [HttpPost]
        [Route("getClientTax")]
        public async Task<ActionResult<TaxDateToDateVM>> TaxDateToDate([FromBody] ClientLedgerDto clientReceiptDto)
        {
            if (string.IsNullOrEmpty(clientReceiptDto.Code?.Trim()))
            {
                return BadRequest(new ApiResponse(400, "Invalid code!!"));
            }
            if (DateTime.ParseExact(clientReceiptDto.FromDate, "yyyy-MM-dd", null) >
                   DateTime.ParseExact(clientReceiptDto.ToDate, "yyyy-MM-dd", null))
            {
                return BadRequest(new ApiResponse(400, "From Date is greater then To Date!!"));
               
            }

            var client = _clientServie.GetClientDetails(clientReceiptDto.Code);
            if (client == null)
            {
                return BadRequest(new ApiResponse(400, "Invalid code!!"));
            }
            try

            {
                //var username = HttpContext.User?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.Name)?.Value;
                //var user = await _unitofWork.BranchLogin.GetFirstOrDefault(u => u.USERID == username);

                //bool isPermit = _branchPermission.IsClientCodePermited(user.USERID, clientReceiptDto.Code.Trim());
                //if (!isPermit)
                //{
                //    return BadRequest(new ApiResponse(401, "This code is locked by IT Team!!"));
                //}

                string query = @"EXEC uSP_Tax_report '" + clientReceiptDto.Code + "','" + clientReceiptDto.FromDate + "','" + clientReceiptDto.ToDate + "'";
                var tax = _unitofWork.SP_Call.ListByRawQuery<TaxDateToDateVM>(query).AsQueryable().FirstOrDefault();

                if (tax?.Charge == null)
                {
                    tax.Charge = 0;


                }
                if (tax.Withdraw == null)
                {
                    tax.Withdraw = 0;
                }
                if (tax.Deposit == null)
                {
                    tax.Deposit = 0;
                }
                tax.RG = (tax.ClosingEquity + tax.Withdraw + tax.Charge + tax.SW) - (tax.OpeningEquity + tax.Deposit + tax.SD);

                return tax;
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse(500, "Server Error!!"));
            }
        }


        [HttpGet]
        [Route("getReport")]
        public async Task<IActionResult> GetRequestAsync()
        {
            try
            {
                using (HttpClient client = new HttpClient())
                {
                    HttpResponseMessage response = await client.GetAsync("https://localhost:7153/Report/Result/");

                    if (response.IsSuccessStatusCode)
                    {
                        Console.Write("Success");
                    }
                    else
                    {
                        Console.Write("Failure");
                    }
                    // response.Content = new ByteArrayContent(bytes);
                    var con = response.Content.ReadAsStreamAsync().Result;
                  //  return new FileStreamResult(con, "application/pdf");
                    return File(con, "application/pdf", "sample.pdf");
                  //  return response.Content;
                }
            }
            catch (Exception e)
            {
                return BadRequest(new ApiResponse(500, "Server Error!!"));
            }
        }
    }
}
