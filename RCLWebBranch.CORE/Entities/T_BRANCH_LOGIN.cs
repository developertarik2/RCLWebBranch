using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RCLWebBranch.DATA.Entities
{
    public class T_BRANCH_LOGIN
    {
        public decimal BRANCHCODE { get; set; }

        public string BRANCHNAME { get; set; }

        public string USERID { get; set; }

        public string USERTYPE { get; set; }

        public string UESRNAME { get; set; }

        public string BRANCH_PREFIX { get; set; }

        public string AGENT_PREFIX { get; set; }

        public string password { get; set; }

        public decimal? LOCK { get; set; }
    }
}
