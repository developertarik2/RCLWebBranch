using Microsoft.AspNetCore.Mvc;
using RCLWebBranch.Errors;
using RCLWebBranch.Infrastructure.Data;
using RCLWebBranch.Infrastructure.InterfaceRepo;
using RCLWebBranch.Infrastructure.Services.Data;
using RCLWebBranch.Infrastructure.Services.Interfaces;
using RCLWebBranch.Insfrastructures.Services;
using RCLWebBranch.Insfrastructures.Services.Interfaces;

namespace RCLWebBranch.Extensions
{
    public static class ApplicationServicesExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IAccountService, AccountService>();
            services.AddScoped<IClientService, ClientService>();
            services.AddScoped<IWebTrackerService, WebTrackerService>();
            services.AddScoped<IBranchPermission, BranchPermission>();


            services.Configure<ApiBehaviorOptions>(options =>
            {
                options.InvalidModelStateResponseFactory = actionContext =>
                {
                    var errors = actionContext.ModelState
                    .Where(e => e.Value.Errors.Count > 0)
                    .SelectMany(x => x.Value.Errors)
                    .Select(x => x.ErrorMessage).ToArray();
                    var errorResonse = new ApiValidationErrorResponse
                    {
                        Errors = errors
                    };
                    return new BadRequestObjectResult(errorResonse);
                };
            });
            return services;
        }
    }
}
