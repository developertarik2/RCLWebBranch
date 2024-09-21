using RCLWebBranch.DATA.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RCLWebBranch.DATA.Models
{
    public class CheckRequisitionVM:T_SMS_TRANSECTION
    {
        public string? Stat { get; set; }
        public string? Registered { get; set; }
        public string? Deleted { get; set; }
        public string? IF { get; set; }
    }
}
