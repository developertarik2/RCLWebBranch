using RCLWebBranch.DATA.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace RCLWebBranch.Infrastructure.Services.Interfaces
{
    public interface ITokenService
    {
        string CreateToken(T_BRANCH_LOGIN user);
        string GenerateRefreshToken();
        ClaimsPrincipal? GetPrincipalFromExpiredToken(string? token);
    }
}
