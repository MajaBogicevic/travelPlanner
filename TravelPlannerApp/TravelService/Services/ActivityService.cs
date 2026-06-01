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

        public async Task<List<ActivityResponseDto>> GetAllAsync(int planId, int userId)
        {
            var activities = await _db.Activities
                .Where(a => a.TravelPlanId == planId && a.TravelPlan.UserId == userId)
                .OrderBy(a => a.Date)
                .ToListAsync();

            return _mapper.Map<List<ActivityResponseDto>>(activities);
        }

        public async Task<ActivityResponseDto?> GetByIdAsync(int id, int planId, int userId)
        {
            var activity = await _db.Activities
                .FirstOrDefaultAsync(a => a.Id == id && a.TravelPlanId == planId
                    && a.TravelPlan.UserId == userId);

            return activity == null ? null : _mapper.Map<ActivityResponseDto>(activity);
        }

        public async Task<ActivityResponseDto> CreateAsync(int planId, CreateActivityDto dto, int userId)
        {
            var plan = await _db.TravelPlans
                .FirstOrDefaultAsync(p => p.Id == planId && p.UserId == userId);

            if (plan == null) throw new KeyNotFoundException("Plan nije pronađen");

            var activity = _mapper.Map<Activity>(dto);
            activity.TravelPlanId = planId;

            _db.Activities.Add(activity);
            await _db.SaveChangesAsync();

            return _mapper.Map<ActivityResponseDto>(activity);
        }

        public async Task<ActivityResponseDto?> UpdateAsync(int id, int planId, UpdateActivityDto dto, int userId)
        {
            var activity = await _db.Activities
                .FirstOrDefaultAsync(a => a.Id == id && a.TravelPlanId == planId
                    && a.TravelPlan.UserId == userId);

            if (activity == null) return null;

            _mapper.Map(dto, activity);
            await _db.SaveChangesAsync();

            return _mapper.Map<ActivityResponseDto>(activity);
        }

        public async Task<bool> DeleteAsync(int id, int planId, int userId)
        {
            var activity = await _db.Activities
                .FirstOrDefaultAsync(a => a.Id == id && a.TravelPlanId == planId
                    && a.TravelPlan.UserId == userId);

            if (activity == null) return false;

            _db.Activities.Remove(activity);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}