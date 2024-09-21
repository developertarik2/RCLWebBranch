using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RCLWebBranch.DATA.Models
{
    public class BoCharge
    {
        public string? MR_NO { get; set; }
        public string? NAME { get; set; }
        public string? DATE { get; set; }
        public int QTY { get; set; }
        public double AMOUNT { get; set; }

        public decimal? BRANCHCODE { get; set; }
        public string? BranchName { get; set; }
    }
}
