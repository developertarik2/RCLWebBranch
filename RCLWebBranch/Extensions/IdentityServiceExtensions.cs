using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using RCLWebBranch.DATA.Entities;
using System.Text;

namespace RCLWebBranch.Extensions
{
    public static class IdentityServiceExtensions
    {
        public static IServiceCollection AddIdentityServices(this IServiceCollection services, IConfiguration config)
        {
           //  var builder = services.AddIdentityCore<T_BRANCH_LOGIN>();

            //builder = new IdentityBuilder(builder.UserType, builder.Services);
            // builder.AddEntityFrameworkStores<ApplicationDbContext>();
            // builder.AddSignInManager<SignInManager<ApplicationUser>>();

            services.AddAuthentication(opt =>
            {
                opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                opt.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            })

                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        // ValidateIssuerSigningKey = true,
                        // IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["JWT:Secret"])),
                        // ValidIssuer = config["Token:Issuer"],
                        // ValidateIssuer = true,
                        //// ValidAudience = config["Token:ValidAudience"],
                        // ValidateAudience = false,
                        // ClockSkew=TimeSpan.Zero

                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ClockSkew = TimeSpan.Zero,

                        ValidAudience = config["JWT:ValidAudience"],
                        ValidIssuer = config["JWT:ValidIssuer"],
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["JWT:Secret"]))
                    };
                });

            return services;
        }
    }
}
