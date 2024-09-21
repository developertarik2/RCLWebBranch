using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RCLWebBranch.DATA.Dtos
{
    public class ClientCdblChargeRecieveVM
    {
        public string? Code { get; set; }
        public string? Name { get; set; }
        public double? Amount { get; set; }
        public int FromYear { get; set; }
        public int ToYear { get; set; }
        public double TotalAmount { get; set; }

    }
}
