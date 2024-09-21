using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RCLWebBranch.DATA.Entities
{
    public class T_SMS_TRANSECTION
    {
        public decimal sl { get; set; }

        public string SMS_Number { get; set; }

        public string RCODE { get; set; }

        public string amount { get; set; }

        public DateTime? dat { get; set; }

        public string flag1 { get; set; }

        public string flag2 { get; set; }

        public string status { get; set; }

        public decimal? clr { get; set; }

        public string download { get; set; }
    }
}
