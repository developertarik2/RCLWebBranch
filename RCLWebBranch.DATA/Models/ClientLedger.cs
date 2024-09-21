using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RCLWebBranch.DATA.Models
{
    public class ClientLedger
    {
        public string? Vno { get; set; }
        public string? Tdate { get; set; }
        public string? Type { get; set; }
        public string? Narr { get; set; }
        public decimal? Quantity { get; set; }
        public decimal? Rate { get; set; }
        public decimal? Debit { get; set; }
        public decimal? Credit { get; set; }
        public decimal? Commsn { get; set; }
        public decimal? Bal { get; set; }
    }
}
