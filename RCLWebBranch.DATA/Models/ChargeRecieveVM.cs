using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RCLWebBranch.DATA.Models
{
    public class ChargeRecieveVM
    {
        public int Quantity { get; set; }
        public string? Date { get; set; }
        public decimal? Amount { get; set; }
    }
}
