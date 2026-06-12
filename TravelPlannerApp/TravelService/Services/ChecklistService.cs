using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TravelService.Data;
using TravelService.DTO.Checklist;
using TravelService.Models;
namespace TravelService.Services
{
    public class ChecklistService : IChecklistService
    {
        private readonly TravelDbContext db;
        private readonly IMapper mapper;
        public ChecklistService(TravelDbContext db, IMapper mapper)
        {
            this.db = db;
            this.mapper = mapper;
        }

        private async Task<bool> HasAccessAsync(int planId, int userId)
        {
            return await db.TravelPlans.AnyAsync(p => p.Id == planId && p.UserId == userId) || await db.PlanAccesses.AnyAsync(a => a.TravelPlanId == planId && a.UserId == userId);
        }

        private async Task<bool> HasEditAccessAsync(int planId, int userId)
        {
            return await db.TravelPlans.AnyAsync(p => p.Id == planId && p.UserId == userId) || await db.PlanAccesses.AnyAsync(a => a.TravelPlanId == planId && a.UserId == userId && a.AccessType == ShareAccessType.Edit);
        }

        public async Task<List<ChecklistItemDto>> GetAllAsync(int planId, int userId)
        {
            if (!await HasAccessAsync(planId, userId))
                return new List<ChecklistItemDto>();

            var items = await db.ChecklistItems
                .Where(c => c.TravelPlanId == planId)
                .ToListAsync();

            return mapper.Map<List<ChecklistItemDto>>(items);
        }

        public async Task<ChecklistItemDto> CreateAsync(int planId, CreateChecklistItemDto dto, int userId)
        {
            if (!await HasEditAccessAsync(planId, userId)) 
                throw new KeyNotFoundException("Plan nije pronadjen");

            var item = mapper.Map<ChecklistItem>(dto);
            item.TravelPlanId = planId;
            db.ChecklistItems.Add(item);
            await db.SaveChangesAsync();
            return mapper.Map<ChecklistItemDto>(item);
        }

        public async Task<ChecklistItemDto?> ToggleAsync(int id, int planId, int userId)
        {
            if (!await HasEditAccessAsync(planId, userId))
                return null;

            var item = await db.ChecklistItems.FirstOrDefaultAsync(c => c.Id == id && c.TravelPlanId == planId);
            if (item == null) 
                return null;

            item.IsCompleted = !item.IsCompleted;
            await db.SaveChangesAsync();
            return mapper.Map<ChecklistItemDto>(item);
        }

        public async Task<bool> DeleteAsync(int id, int planId, int userId)
        {
            if (!await HasEditAccessAsync(planId, userId)) 
                return false;

            var item = await db.ChecklistItems.FirstOrDefaultAsync(c => c.Id == id && c.TravelPlanId == planId);
            if (item == null) 
                return false;

            db.ChecklistItems.Remove(item);
            await db.SaveChangesAsync();
            return true;
        }
    }
}