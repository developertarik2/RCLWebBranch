using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RCLWebBranch.DATA.Dtos
{
    public class CdblChargeYearVM
    {
        public List<ThisYear>? ThisYears { get; set; }
        public List<NextYear>? NextYears { get; set; }

    }
}
