using RCLWebBranch.DATA.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RCLWebBranch.Infrastructure.Services.Interfaces
{
    public interface IAccountService
    {
        Task<bool> CheckAuthentication(LoginDto loginDto);

        Task<bool> IsLocked(LoginDto loginDto);
    }
}
