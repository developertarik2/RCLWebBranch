using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RCLWebBranch.Infrastructure.Services.Interfaces
{
    public interface IBranchPermission
    {
        bool IsClientCodePermited(string userId, string rcode);
    }
}
