using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RCLWebBranch.DATA.Dtos
{
    public class UserDto
    {
        public string Username { get; set; }
        public string BranchName { get; set; }
        public string BranchCode { get; set; }

        public string Token { get; set; }

        //public string RefreshToken { get; set; }

        //public string Role { get; set; }
    }
}
