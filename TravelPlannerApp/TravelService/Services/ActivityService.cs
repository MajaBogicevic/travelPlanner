using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TravelService.Data;
using TravelService.DTO.Activiry;
using TravelService.Models;
namespace TravelService.Services
{
    public class ActivityService : IActivityService
    {
        private readonly TravelDbContext _db;
        private readonly IMapper _mapper;
        public ActivityService(TravelDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        private async Task<bool> HasAccessAsync(int planId, int userId)
        {
            return await _db.TravelPlans.AnyAsync(p => p.Id == planId && p.UserId == userId)
                || await _db.PlanAccesses.AnyAsync(a => a.TravelPlanId == planId && a.UserId == userId);
        }

        public async Task<List<ActivityResponseDto>> GetAllAsync(int planId, int userId)
        {
            if (!await HasAccessAsync(planId, userId)) return new List<ActivityResponseDto>();
            var activities = await _db.Activities
                .Where(a => a.TravelPlanId == planId)
                .OrderBy(a => a.Date)
                .ToListAsync();
            return _mapper.Map<List<ActivityResponseDto>>(activities);
        }

        public async Task<ActivityResponseDto?> GetByIdAsync(int id, int planId, int userId)
        {
            if (!await HasAccessAsync(planId, userId)) return null;
            var activity = await _db.Activities
                .FirstOrDefaultAsync(a => a.Id == id && a.TravelPlanId == planId);
            return activity == null ? null : _mapper.Map<ActivityResponseDto>(activity);
        }

        public async Task<ActivityResponseDto> CreateAsync(int planId, CreateActivityDto dto, int userId)
        {
            if (!await HasAccessAsync(planId, userId)) throw new KeyNotFoundException("Plan nije pronadjen");
            var activity = _mapper.Map<Activity>(dto);
            activity.TravelPlanId = planId;
            _db.Activities.Add(activity);
            await _db.SaveChangesAsync();
            return _mapper.Map<ActivityResponseDto>(activity);
        }

        public async Task<ActivityResponseDto?> UpdateAsync(int id, int planId, UpdateActivityDto dto, int userId)
        {
            if (!await HasAccessAsync(planId, userId)) return null;
            var activity = await _db.Activities
                .FirstOrDefaultAsync(a => a.Id == id && a.TravelPlanId == planId);
            if (activity == null) return null;
            _mapper.Map(dto, activity);
            await _db.SaveChangesAsync();
            return _mapper.Map<ActivityResponseDto>(activity);
        }

        public async Task<bool> DeleteAsync(int id, int planId, int userId)
        {
            if (!await HasAccessAsync(planId, userId)) return false;
            var activity = await _db.Activities
                .FirstOrDefaultAsync(a => a.Id == id && a.TravelPlanId == planId);
            if (activity == null) return false;
            _db.Activities.Remove(activity);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}