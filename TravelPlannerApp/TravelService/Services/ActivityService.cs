using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TravelService.Data;
using TravelService.DTO.Activiry;
using TravelService.Models;
namespace TravelService.Services
{
    public class ActivityService : IActivityService
    {
        private readonly TravelDbContext db;
        private readonly IMapper mapper;
        public ActivityService(TravelDbContext db, IMapper mapper)
        {
            this.db = db;
            this.mapper = mapper;
        }

        private async Task<bool> HasAccessAsync(int planId, int userId)
        {
            return await db.TravelPlans.AnyAsync(p => p.Id == planId && p.UserId == userId)|| await db.PlanAccesses.AnyAsync(a => a.TravelPlanId == planId && a.UserId == userId);
        }

        private async Task<bool> HasEditAccessAsync(int planId, int userId)
        {
            return await db.TravelPlans.AnyAsync(p => p.Id == planId && p.UserId == userId) || await db.PlanAccesses.AnyAsync(a => a.TravelPlanId == planId && a.UserId == userId && a.AccessType == ShareAccessType.Edit);
        }

        public async Task<List<ActivityResponseDto>> GetAllAsync(int planId, int userId)
        {
            if (!await HasAccessAsync(planId, userId)) return new List<ActivityResponseDto>();
            var activities = await db.Activities
                .Where(a => a.TravelPlanId == planId)
                .OrderBy(a => a.Date)
                .ToListAsync();
            return mapper.Map<List<ActivityResponseDto>>(activities);
        }

        public async Task<ActivityResponseDto?> GetByIdAsync(int id, int planId, int userId)
        {
            if (!await HasAccessAsync(planId, userId)) return null;
            var activity = await db.Activities.FirstOrDefaultAsync(a => a.Id == id && a.TravelPlanId == planId);

            if (activity == null)
            {
                return null;
            }
            else
            {
                return mapper.Map<ActivityResponseDto>(activity);
            }
        }

        public async Task<ActivityResponseDto> CreateAsync(int planId, CreateActivityDto dto, int userId)
        {
            if (!await HasEditAccessAsync(planId, userId)) 
                throw new KeyNotFoundException("Plan nije pronadjen");

            var activity = mapper.Map<Activity>(dto);
            activity.TravelPlanId = planId;
            db.Activities.Add(activity);
            await db.SaveChangesAsync();
            return mapper.Map<ActivityResponseDto>(activity);
        }

        public async Task<ActivityResponseDto?> UpdateAsync(int id, int planId, UpdateActivityDto dto, int userId)
        {
            if (!await HasEditAccessAsync(planId, userId)) 
                return null;

            var activity = await db.Activities.FirstOrDefaultAsync(a => a.Id == id && a.TravelPlanId == planId);
            if (activity == null) 
                return null;

            mapper.Map(dto, activity);
            await db.SaveChangesAsync();
            return mapper.Map<ActivityResponseDto>(activity);
        }

        public async Task<bool> DeleteAsync(int id, int planId, int userId)
        {
            if (!await HasEditAccessAsync(planId, userId)) 
                return false;

            var activity = await db.Activities.FirstOrDefaultAsync(a => a.Id == id && a.TravelPlanId == planId);
            if (activity == null) 
                return false;

            db.Activities.Remove(activity);
            await db.SaveChangesAsync();
            return true;
        }
    }
}