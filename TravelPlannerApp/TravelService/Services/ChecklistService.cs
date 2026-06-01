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

        public async Task<List<ChecklistItemDto>> GetAllAsync(int planId, int userId)
        {
            var items = await _db.ChecklistItems
                .Where(c => c.TravelPlanId == planId && c.TravelPlan.UserId == userId)
                .ToListAsync();

            return _mapper.Map<List<ChecklistItemDto>>(items);
        }

        public async Task<ChecklistItemDto> CreateAsync(int planId, CreateChecklistItemDto dto, int userId)
        {
            var plan = await _db.TravelPlans
                .FirstOrDefaultAsync(p => p.Id == planId && p.UserId == userId);

            if (plan == null) throw new KeyNotFoundException("Plan nije pronađen");

            var item = _mapper.Map<ChecklistItem>(dto);
            item.TravelPlanId = planId;

            _db.ChecklistItems.Add(item);
            await _db.SaveChangesAsync();

            return _mapper.Map<ChecklistItemDto>(item);
        }

        public async Task<ChecklistItemDto?> ToggleAsync(int id, int planId, int userId)
        {
            var item = await _db.ChecklistItems
                .FirstOrDefaultAsync(c => c.Id == id && c.TravelPlanId == planId
                    && c.TravelPlan.UserId == userId);

            if (item == null) return null;

            item.IsCompleted = !item.IsCompleted;
            await _db.SaveChangesAsync();

            return _mapper.Map<ChecklistItemDto>(item);
        }

        public async Task<bool> DeleteAsync(int id, int planId, int userId)
        {
            var item = await _db.ChecklistItems
                .FirstOrDefaultAsync(c => c.Id == id && c.TravelPlanId == planId
                    && c.TravelPlan.UserId == userId);

            if (item == null) return false;

            _db.ChecklistItems.Remove(item);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}