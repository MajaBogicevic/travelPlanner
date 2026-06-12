using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TravelService.Data;
using TravelService.DTO.Checklist;
using TravelService.Models;
namespace TravelService.Services
{
    public class ChecklistService : IChecklistService
    {
        private readonly TravelDbContext _db;
        private readonly IMapper _mapper;
        public ChecklistService(TravelDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        private async Task<bool> HasAccessAsync(int planId, int userId)
        {
            return await _db.TravelPlans.AnyAsync(p => p.Id == planId && p.UserId == userId)
                || await _db.PlanAccesses.AnyAsync(a => a.TravelPlanId == planId && a.UserId == userId);
        }

        private async Task<bool> HasEditAccessAsync(int planId, int userId)
        {
            return await _db.TravelPlans.AnyAsync(p => p.Id == planId && p.UserId == userId)
                || await _db.PlanAccesses.AnyAsync(a => a.TravelPlanId == planId && a.UserId == userId && a.AccessType == ShareAccessType.Edit);
        }

        public async Task<List<ChecklistItemDto>> GetAllAsync(int planId, int userId)
        {
            if (!await HasAccessAsync(planId, userId)) return new List<ChecklistItemDto>();
            var items = await _db.ChecklistItems
                .Where(c => c.TravelPlanId == planId)
                .ToListAsync();
            return _mapper.Map<List<ChecklistItemDto>>(items);
        }

        public async Task<ChecklistItemDto> CreateAsync(int planId, CreateChecklistItemDto dto, int userId)
        {
            if (!await HasEditAccessAsync(planId, userId)) throw new KeyNotFoundException("Plan nije pronadjen");
            var item = _mapper.Map<ChecklistItem>(dto);
            item.TravelPlanId = planId;
            _db.ChecklistItems.Add(item);
            await _db.SaveChangesAsync();
            return _mapper.Map<ChecklistItemDto>(item);
        }

        public async Task<ChecklistItemDto?> ToggleAsync(int id, int planId, int userId)
        {
            if (!await HasEditAccessAsync(planId, userId)) return null;
            var item = await _db.ChecklistItems
                .FirstOrDefaultAsync(c => c.Id == id && c.TravelPlanId == planId);
            if (item == null) return null;
            item.IsCompleted = !item.IsCompleted;
            await _db.SaveChangesAsync();
            return _mapper.Map<ChecklistItemDto>(item);
        }

        public async Task<bool> DeleteAsync(int id, int planId, int userId)
        {
            if (!await HasEditAccessAsync(planId, userId)) return false;
            var item = await _db.ChecklistItems
                .FirstOrDefaultAsync(c => c.Id == id && c.TravelPlanId == planId);
            if (item == null) return false;
            _db.ChecklistItems.Remove(item);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}