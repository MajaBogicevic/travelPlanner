using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TravelService.Data;
using TravelService.DTO.TravelPlan;
using TravelService.Models;

namespace TravelService.Services
{
    public class TravelPlanService : ITravelPlanService
    {
        private readonly TravelDbContext _db;
        private readonly IMapper _mapper;

        public TravelPlanService(TravelDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<List<TravelPlanResponseDto>> GetAllByUserAsync(int userId)
        {
            var plans = await _db.TravelPlans
                .Include(p => p.Destinations)
                .Include(p => p.Activities)
                .Include(p => p.Expenses)
                .Include(p => p.ChecklistItems)
                .Where(p => p.UserId == userId)
                .ToListAsync();

            return _mapper.Map<List<TravelPlanResponseDto>>(plans);
        }

        public async Task<TravelPlanResponseDto?> GetByIdAsync(int id, int userId)
        {
            var plan = await _db.TravelPlans
                .Include(p => p.Destinations)
                .Include(p => p.Activities)
                .Include(p => p.Expenses)
                .Include(p => p.ChecklistItems)
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            return plan == null ? null : _mapper.Map<TravelPlanResponseDto>(plan);
        }

        public async Task<TravelPlanResponseDto> CreateAsync(CreateTravelPlanDto dto, int userId)
        {
            var plan = _mapper.Map<TravelPlan>(dto);
            plan.UserId = userId;

            _db.TravelPlans.Add(plan);
            await _db.SaveChangesAsync();

            return _mapper.Map<TravelPlanResponseDto>(plan);
        }

        public async Task<TravelPlanResponseDto?> UpdateAsync(int id, UpdateTravelPlanDto dto, int userId)
        {
            var plan = await _db.TravelPlans
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (plan == null) return null;

            _mapper.Map(dto, plan);
            await _db.SaveChangesAsync();

            return _mapper.Map<TravelPlanResponseDto>(plan);
        }

        public async Task<bool> DeleteAsync(int id, int userId)
        {
            var plan = await _db.TravelPlans
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (plan == null) return false;

            _db.TravelPlans.Remove(plan);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}