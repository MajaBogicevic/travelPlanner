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
        private readonly TravelDbContext _db;
        private readonly IMapper _mapper;

        public ShareService(TravelDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<ShareResponseDto> CreateShareTokenAsync(int planId, CreateShareDto dto, int userId)
        {
            var plan = await _db.TravelPlans.FirstOrDefaultAsync(p => p.Id == planId &&(p.UserId == userId || _db.PlanAccesses.Any(a => a.TravelPlanId == planId && a.UserId == userId)));
            if (plan == null) throw new KeyNotFoundException("Plan nije pronađen");

            var token = Guid.NewGuid().ToString("N");
            var shared = new SharedPlan
            {
                Token = token,
                AccessType = Enum.Parse<ShareAccessType>(dto.AccessType),
                ExpiresAt = DateTime.UtcNow.AddDays(30),
                TravelPlanId = planId
            };

            _db.SharedPlans.Add(shared);
            await _db.SaveChangesAsync();

            return new ShareResponseDto
            {
                Token = token,
                ShareUrl = dto.AccessType == "Edit"
                    ? $"http://localhost:5173/login?shareToken={token}"
                    : $"http://localhost:5173/shared/{token}",
                AccessType = dto.AccessType
            };
        }

        public async Task<SharedPlanResponseDto?> GetByTokenAsync(string token)
        {
            var shared = await _db.SharedPlans
                .Include(s => s.TravelPlan).ThenInclude(p => p.Destinations)
                .Include(s => s.TravelPlan).ThenInclude(p => p.Activities)
                .Include(s => s.TravelPlan).ThenInclude(p => p.Expenses)
                .Include(s => s.TravelPlan).ThenInclude(p => p.ChecklistItems)
                .FirstOrDefaultAsync(s => s.Token == token);

            if (shared == null || shared.ExpiresAt < DateTime.UtcNow)
                return null;

            return new SharedPlanResponseDto
            {
                Plan = _mapper.Map<TravelPlanResponseDto>(shared.TravelPlan),
                AccessType = shared.AccessType.ToString()
            };
        }

        public async Task<bool> AcceptShareTokenAsync(string token, int userId)
        {
            var shared = await _db.SharedPlans
                .FirstOrDefaultAsync(s => s.Token == token && s.ExpiresAt > DateTime.UtcNow);
            if (shared == null) return false;

            var existing = await _db.PlanAccesses
                .FirstOrDefaultAsync(a => a.TravelPlanId == shared.TravelPlanId && a.UserId == userId);

            if (existing != null)
            {
                if (shared.AccessType == ShareAccessType.Edit && existing.AccessType != ShareAccessType.Edit)
                {
                    existing.AccessType = ShareAccessType.Edit;
                    await _db.SaveChangesAsync();
                }
                return true;
            }

            _db.PlanAccesses.Add(new Models.PlanAccess
            {
                TravelPlanId = shared.TravelPlanId,
                UserId = userId,
                GrantedAt = DateTime.UtcNow,
                AccessType = shared.AccessType
            });
            await _db.SaveChangesAsync();
            return true;
        }
    }
}