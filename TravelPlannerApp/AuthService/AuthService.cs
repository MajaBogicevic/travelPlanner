using AuthService.Data;
using AuthService.Mapping;
using AuthService.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.ServiceFabric.Data;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using System;
using System.Collections.Generic;
using System.Fabric;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace AuthService
{
    /// <summary>
    /// The FabricRuntime creates an instance of this class for each service type instance.
    /// </summary>
    internal sealed class AuthService : StatelessService
    {
        public AuthService(StatelessServiceContext context)
            : base(context)
        { }

        /// <summary>
        /// Optional override to create listeners (like tcp, http) for this service instance.
        /// </summary>
        /// <returns>The collection of listeners.</returns>
        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
            => new ServiceInstanceListener[]
            {
                new ServiceInstanceListener(ctx =>
                    new KestrelCommunicationListener(ctx, "ServiceEndpoint", (url, listener) =>
                    {
                        var builder = WebApplication.CreateBuilder();

                        var config = ctx.CodePackageActivationContext.GetConfigurationPackageObject("Config").Settings;
                        var connStr = config.Sections["ConnectionStrings"].Parameters["DefaultConnection"].Value;
                        var jwtSecret = config.Sections["JwtSettings"].Parameters["Secret"].Value;
                        var frontendUrl = config.Sections["FrontendSettings"].Parameters["BaseUrl"].Value;

                        builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
                        {
                            ["JwtSettings:Secret"] = jwtSecret,
                            ["ConnectionStrings:DefaultConnection"] = connStr
                        });

                        builder.Services.AddDbContext<AuthDbContext>(o => o.UseSqlServer(connStr));
                        builder.Services.AddScoped<IAuthService, AuthServiceImpl>();
                        builder.Services.AddAutoMapper(typeof(AuthProfile));
                        builder.Services.AddControllers();
                        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(o => o.TokenValidationParameters = new TokenValidationParameters
                        {
                            ValidateIssuerSigningKey = true,
                            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
                            ValidateIssuer = true,
                            ValidIssuer = "TravelPlannerAPI",
                            ValidateAudience = true,
                            ValidAudience = "TravelPlannerClient",
                            ValidateLifetime = true,
                            ClockSkew = TimeSpan.Zero
                        });
                        builder.Services.AddAuthorization();
                        builder.Services.AddCors(o => o.AddPolicy("AllowFrontend",
                            p => p.WithOrigins(frontendUrl!)
                                   .AllowAnyHeader()
                                   .AllowAnyMethod()
                                   .AllowCredentials()));

                        builder.WebHost.UseUrls(url);

                        var app = builder.Build();
                        app.UseCors("AllowFrontend");
                        app.UseAuthentication();
                        app.UseAuthorization();
                        app.MapControllers();
                        return app;

                    }))
            };
    }
}
