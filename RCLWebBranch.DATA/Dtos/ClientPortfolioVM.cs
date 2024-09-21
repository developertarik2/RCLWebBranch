﻿using RCLWebBranch.DATA.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RCLWebBranch.DATA.Dtos
{
    public class ClientPortfolioVM
    {
        public List<ClientPortfolioList>? CompanyLists { get; set; }
        public decimal? TotalBuyCost { get; set; }
        public decimal? MarketVal { get; set; }
        public decimal? MaturedBal { get; set; }
        public decimal? EquityBal { get; set; }
        public decimal? SaleRec { get; set; }
        public decimal? LedgerBal { get; set; }
        public decimal? RglBal { get; set; }
        public decimal? AccruedBal { get; set; }
        public decimal? UnrealiseBal { get; set; }
        public decimal? ChargeFee { get; set; }
        public decimal? TotalCapital { get; set; }
    }
}
