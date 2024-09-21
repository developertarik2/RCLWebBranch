using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RCLWebBranch.DATA.Entities;
using System.Security.Claims;

namespace RCLWebBranch.Extensions
{
    public static class UserManagerExtensions
    {
        public static async Task<T_BRANCH_LOGIN> FindByEmailFromClaimsPrinciple(this UserManager<T_BRANCH_LOGIN> input, ClaimsPrincipal user)
        {
            var userId = user?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.Name)?.Value;

            return await input.Users.SingleOrDefaultAsync(x => x.USERID == userId);
        }
    }
}
