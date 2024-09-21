using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RCLWebBranch.CORE.Dtos
{
    public class LoggedUserDto
    {
        public string Username { get; set; }
        public string DisplayName { get; set; }

        // public string Token { get; set; }

        //  public string RefreshToken { get; set; }

        public string Role { get; set; }
    }
}
