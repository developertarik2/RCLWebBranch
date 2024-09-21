using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RCLWebBranch.DATA.QueryVMs
{
    public class UserSpecParams : SpecParams
    {
        public string? UserName { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public DateTimeOffset? Created { get; set; }

        public string? LockoutEnabled { get; set; }
    }
}
