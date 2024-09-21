using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RCLWebBranch.DATA.Models
{


    public class ChargeReceiveDet
    {
        public List<ChargeReceiveDetList>? ChargeReceives { get; set; }
        public string? Yname1 { get; set; }
        public string? Yname2 { get; set; }
        public string? Yname3 { get; set; }
        public double? Year1 { get; set; }
        public double? Year2 { get; set; }
        public double? Year3 { get; set; }
        public double? TotalAmount { get; set; }
    }

    public class ChargeReceiveDetList
    {
        public string? Name { get; set; }
        public string? MR_NO { get; set; }
        public string? RCODE { get; set; }
        public string? FISCAL { get; set; }
        public double? AMOUNT { get; set; }
        public string? Y2 { get; set; }
        public string? Y3 { get; set; }
        public string? Y4 { get; set; }
        public DateTime? Date { get; set; }
        
    }
}
