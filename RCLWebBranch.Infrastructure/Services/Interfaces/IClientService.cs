using RCLWebBranch.DATA.ViewModels;

namespace RCLWebBranch.Insfrastructures.Services.Interfaces
{
    public interface IClientService
    {
        ClientDetailsVM? GetClientDetails(string? code);
    }
}
