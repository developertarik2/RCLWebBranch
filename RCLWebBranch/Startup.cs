using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using RCLWebBranch.Extensions;
using RCLWebBranch.Helpers;
using RCLWebBranch.Infrastructure.Data;
using RCLWebBranch.Infrastructure.Services.Data;
using RCLWebBranch.Infrastructure.Services.Interfaces;
using RCLWebBranch.Middleware;

namespace RCLWebBranch
{
    public class Startup
    {
        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddAutoMapper(typeof(MappingProfiles));
            services.AddControllers();

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(
                    Configuration.GetConnectionString("DefaultConnection"),
                     sqlServerOptions => sqlServerOptions.CommandTimeout(100)
                    ));

            services.AddDbContext<SISRoyalDbContext>(options =>
               options.UseSqlServer(
                   Configuration.GetConnectionString("DefaultConnection2"),
                    sqlServerOptions => sqlServerOptions.CommandTimeout(100)
                   ));

            services.AddApplicationServices();
            services.AddIdentityServices(Configuration);

            services.AddDistributedMemoryCache();
            services.AddSession(options => {
                options.IdleTimeout = TimeSpan.FromMinutes(60);//You can set Time   
                options.Cookie.HttpOnly = true;
                options.Cookie.IsEssential = true;
            });
            // services.AddScoped<IUnitOfWork, UnitOfWork>();
            //services.AddScoped<IRoleService, RoleService>();
            //services.AddScoped<IAccountService, AccountService>();

            services.AddEndpointsApiExplorer();
            //services.AddSwaggerGen();
            services.AddSwaggerDocumentation();
            services.AddCors(opt =>
            {
                opt.AddPolicy("CorsPolicy", policy =>
                {
                    policy.AllowAnyHeader().AllowAnyMethod().WithOrigins("https://localhost:4200");
                });
                //opt.AddPolicy("CorsPolicy2", policy =>
                //{
                //    policy.AllowAnyHeader().AllowAnyMethod().WithOrigins("https://localhost:7153/Report/Result");
                //});
            });
        }
        public void Configure(WebApplication app /*IApplicationBuilder app*/, IWebHostEnvironment env)
        {
            if (app.Environment.IsDevelopment())
            //if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                //app.UseSwaggerUI();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "RCLWEB Branch v1"));
            }
            app.UseMiddleware<ExceptionMiddleware>();
            app.UseStatusCodePagesWithReExecute("/errors/{0}");


            app.UseHttpsRedirection();
            app.UseRouting();
            app.UseSession();
            app.UseStaticFiles();
            //app.UseStaticFiles(new StaticFileOptions
            //{
            //    FileProvider=new PhysicalFileProvider(
            //        Path.Combine(Directory.GetCurrentDirectory(),"Content")
            //      ),RequestPath="/content"
            //});
           

            app.UseCors("CorsPolicy");
           // app.UseCors("CorsPolicy2");
            //app.UseCors(x => x
            // .AllowAnyOrigin()
            // .AllowAnyMethod()
            // .AllowAnyHeader());


            app.UseAuthentication();
            app.UseAuthorization();

            //app.UseHttpsRedirection();
            //app.MapControllers();
            app.UseSwaggerDocumention();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapFallbackToController("Index", "Fallback");
            });

            app.Run();
        }
    }
}
