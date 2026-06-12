using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TravelService.Data;
using TravelService.DTO.Share;
using TravelService.DTO.TravelPlan;
using TravelService.DTOs.Share;
using TravelService.Models;
namespace TravelService.Services
{
    public class ShareService : IShareService
    {
        private readonly TravelDbContext db;
        private readonly IMapper mapper;
        private readonly IConfiguration config;
        public ShareService(TravelDbContext db, IMapper mapper, IConfiguration config)
        {
            this.db = db;
            this.mapper = mapper;
            this.config = config;
        }
        public async Task<ShareResponseDto> CreateShareTokenAsync(int planId, CreateShareDto dto, int userId)
        {
            var plan = await db.TravelPlans.FirstOrDefaultAsync(p => p.Id == planId && (p.UserId == userId || db.PlanAccesses.Any(a => a.TravelPlanId == planId && a.UserId == userId)));
            if (plan == null) 
                throw new KeyNotFoundException("Plan nije pronađen");

            var token = Guid.NewGuid().ToString("N");
            var shared = new SharedPlan
            {
                Token = token,
                AccessType = Enum.Parse<ShareAccessType>(dto.AccessType),
                ExpiresAt = DateTime.UtcNow.AddDays(30),
                TravelPlanId = planId
            };
            db.SharedPlans.Add(shared);
            await db.SaveChangesAsync();
            var frontendUrl = config["FrontendSettings:BaseUrl"];
            string shareUrl;
            if (dto.AccessType == "Edit")
            {
                shareUrl = $"{frontendUrl}/login?shareToken={token}";
            }
            else
            {
                shareUrl = $"{frontendUrl}/shared/{token}";
            }

            var result = new ShareResponseDto();
            result.Token = token;
            result.ShareUrl = shareUrl;
            result.AccessType = dto.AccessType;

            return result;
        }

        public async Task<SharedPlanResponseDto?> GetByTokenAsync(string token)
        {
            var shared = await db.SharedPlans
                .Include(s => s.TravelPlan).ThenInclude(p => p.Destinations)
                .Include(s => s.TravelPlan).ThenInclude(p => p.Activities)
                .Include(s => s.TravelPlan).ThenInclude(p => p.Expenses)
                .Include(s => s.TravelPlan).ThenInclude(p => p.ChecklistItems)
                .FirstOrDefaultAsync(s => s.Token == token);
            if (shared == null || shared.ExpiresAt < DateTime.UtcNow)
                return null;

            return new SharedPlanResponseDto
            {
                Plan = mapper.Map<TravelPlanResponseDto>(shared.TravelPlan),
                AccessType = shared.AccessType.ToString()
            };
        }

        public async Task<bool> AcceptShareTokenAsync(string token, int userId)
        {
            var shared = await db.SharedPlans.FirstOrDefaultAsync(s => s.Token == token && s.ExpiresAt > DateTime.UtcNow);
            if (shared == null) 
                return false;

            var existing = await db.PlanAccesses.FirstOrDefaultAsync(a => a.TravelPlanId == shared.TravelPlanId && a.UserId == userId);
            if (existing != null)
            {
                if (shared.AccessType == ShareAccessType.Edit && existing.AccessType != ShareAccessType.Edit)
                {
                    existing.AccessType = ShareAccessType.Edit;
                    await db.SaveChangesAsync();
                }
                return true;
            }

            db.PlanAccesses.Add(new Models.PlanAccess
            {
                TravelPlanId = shared.TravelPlanId,
                UserId = userId,
                GrantedAt = DateTime.UtcNow,
                AccessType = shared.AccessType
            });

            await db.SaveChangesAsync();
            return true;
        }
    }
}