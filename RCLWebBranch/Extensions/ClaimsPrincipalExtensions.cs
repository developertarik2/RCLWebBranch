using System.Security.Claims;

namespace RCLWebBranch.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static string? RetrieveNameFromPrincipal(this ClaimsPrincipal user)
        {
            return user?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.Name)?.Value;
        }
    }
}
