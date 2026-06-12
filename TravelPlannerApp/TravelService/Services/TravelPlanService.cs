using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using Microsoft.ServiceFabric.Services.Client;
using Shared.Events;
using Shared.Interface;
using TravelService.Data;
using TravelService.DTO.TravelPlan;
using TravelService.Models;

namespace TravelService.Services
{
    public class TravelPlanService : ITravelPlanService
    {
        private readonly TravelDbContext _db;
        private readonly IMapper _mapper;
        private readonly INotificationService _notificationService;

        public TravelPlanService(TravelDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
            _notificationService = ServiceProxy.Create<INotificationService>(
                new Uri("fabric:/TravelPlannerApp/NotificationService"),
                new ServicePartitionKey(0));
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
                .FirstOrDefaultAsync(p => p.Id == id &&
                    (p.UserId == userId || _db.PlanAccesses.Any(a => a.TravelPlanId == id && a.UserId == userId)));
            return plan == null ? null : _mapper.Map<TravelPlanResponseDto>(plan);
        }

        public async Task<TravelPlanResponseDto> CreateAsync(CreateTravelPlanDto dto, int userId)
        {
            var plan = _mapper.Map<TravelPlan>(dto);
            plan.UserId = userId;
            _db.TravelPlans.Add(plan);
            await _db.SaveChangesAsync();

            await _notificationService.PublishAsync(new TravelPlanEvent
            {
                EventType = "PLAN_CREATED",
                UserId = userId,
                PlanName = plan.Name,
                Timestamp = DateTime.UtcNow
            });

            return _mapper.Map<TravelPlanResponseDto>(plan);
        }

        public async Task<TravelPlanResponseDto?> UpdateAsync(int id, UpdateTravelPlanDto dto, int userId)
        {
            var plan = await _db.TravelPlans
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (plan == null) return null;

            _mapper.Map(dto, plan);
            await _db.SaveChangesAsync();

            await _notificationService.PublishAsync(new TravelPlanEvent
            {
                EventType = "PLAN_UPDATED",
                UserId = userId,
                PlanName = plan.Name,
                Timestamp = DateTime.UtcNow
            });

            return _mapper.Map<TravelPlanResponseDto>(plan);
        }

        public async Task<bool> DeleteAsync(int id, int userId)
        {
            var plan = await _db.TravelPlans
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (plan == null) return false;

            _db.TravelPlans.Remove(plan);
            await _db.SaveChangesAsync();

            await _notificationService.PublishAsync(new TravelPlanEvent
            {
                EventType = "PLAN_DELETED",
                UserId = userId,
                PlanName = plan.Name,
                Timestamp = DateTime.UtcNow
            });

            return true;
        }

        public async Task<List<TravelPlanResponseDto>> GetSharedPlanIdsAsync(int userId)
        {
            var sharedPlanIds = await _db.PlanAccesses
                .Where(a => a.UserId == userId)
                .Select(a => a.TravelPlanId)
                .ToListAsync();

            var plans = await _db.TravelPlans
                .Include(p => p.Destinations)
                .Include(p => p.Activities)
                .Include(p => p.Expenses)
                .Include(p => p.ChecklistItems)
                .Where(p => sharedPlanIds.Contains(p.Id))
                .ToListAsync();

            return _mapper.Map<List<TravelPlanResponseDto>>(plans);
        }

        public async Task<List<TravelPlanResponseDto>> GetAllPlansAsync()
        {
            var plans = await _db.TravelPlans
                .Include(p => p.Destinations)
                .Include(p => p.Activities)
                .Include(p => p.Expenses)
                .Include(p => p.ChecklistItems)
                .ToListAsync();
            return _mapper.Map<List<TravelPlanResponseDto>>(plans);
        }

        public async Task<bool> DeleteAsAdminAsync(int id)
        {
            var plan = await _db.TravelPlans.FirstOrDefaultAsync(p => p.Id == id);
            if (plan == null) return false;

            _db.TravelPlans.Remove(plan);
            await _db.SaveChangesAsync();

            await _notificationService.PublishAsync(new TravelPlanEvent
            {
                EventType = "PLAN_DELETED_BY_ADMIN",
                UserId = plan.UserId,
                PlanName = plan.Name,
                Timestamp = DateTime.UtcNow
            });

            return true;
        }
    }
}