using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RCLWebBranch.DATA.Models
{
    public class ClientPortfolioList
    {
        public int Sl { get; set; }
        public string? Firmsnm1 { get; set; }

        public double? Quantity { get; set; }
        public double? Slbqty { get; set; }

        public double? Pldqty { get; set; }
        public double? Rate { get; set; }

        public double? Amount { get; set; }

        public double? Mktrt { get; set; }

        public double? Mktamt { get; set; }

        public double? Grp { get; set; }

    }
}
