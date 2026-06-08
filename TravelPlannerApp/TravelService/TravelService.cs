using Microsoft.EntityFrameworkCore;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Fabric;
using System.Text;
using TravelService.Data;
using TravelService.Mapping;
using TravelService.Services;

namespace TravelService
{
    /// <summary>
    /// The FabricRuntime creates an instance of this class for each service type instance.
    /// </summary>
    internal sealed class TravelService : StatelessService
    {
        public TravelService(StatelessServiceContext context)
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

                        builder.Services.AddDbContext<TravelDbContext>(o => o.UseSqlServer(connStr));
                        builder.Services.AddScoped<ITravelPlanService, TravelPlanService>();
                        builder.Services.AddScoped<IDestinationService, DestinationService>();
                        builder.Services.AddScoped<IActivityService, ActivityService>();
                        builder.Services.AddScoped<IExpenseService, ExpenseService>();
                        builder.Services.AddScoped<IChecklistService, ChecklistService>();
                        builder.Services.AddScoped<IShareService, ShareService>();
                        builder.Services.AddAutoMapper(
                            typeof(TravelPlanProfile),
                            typeof(DestinationProfile),
                            typeof(ActivityProfile),
                            typeof(ExpenseProfile),
                            typeof(ChecklistProfile));
                        builder.Services.AddControllers().AddJsonOptions(options =>
                            {
                                options.JsonSerializerOptions.Converters.Add(
                                    new System.Text.Json.Serialization.JsonStringEnumConverter());
                            });
                        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(o => o.TokenValidationParameters = new TokenValidationParameters
                            {
                                ValidateIssuerSigningKey = true,
                                IssuerSigningKey = new SymmetricSecurityKey(
                                    Encoding.UTF8.GetBytes(jwtSecret)),
                                ValidateIssuer = true,
                                ValidIssuer = "TravelPlannerAPI",
                                ValidateAudience = true,
                                ValidAudience = "TravelPlannerClient",
                                ValidateLifetime = true,
                                ClockSkew = TimeSpan.Zero
                            });
                        builder.Services.AddAuthorization();
                        builder.Services.AddCors(o => o.AddPolicy("AllowFrontend",
                            p => p.WithOrigins("http://localhost:5173")
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
