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
        private readonly TravelDbContext db;
        private readonly IMapper mapper;
        private readonly INotificationService notificationService;

        public TravelPlanService(TravelDbContext db, IMapper mapper)
        {
            this.db = db;
            this.mapper = mapper;
            this.notificationService = ServiceProxy.Create<INotificationService>(
                new Uri("fabric:/TravelPlannerApp/NotificationService"),
                new ServicePartitionKey(0));
        }

        public async Task<List<TravelPlanResponseDto>> GetAllByUserAsync(int userId)
        {
            var plans = await db.TravelPlans
                .Include(p => p.Destinations)
                .Include(p => p.Activities)
                .Include(p => p.Expenses)
                .Include(p => p.ChecklistItems)
                .Where(p => p.UserId == userId)
                .ToListAsync();

            return mapper.Map<List<TravelPlanResponseDto>>(plans);
        }

        public async Task<TravelPlanResponseDto?> GetByIdAsync(int id, int userId)
        {
            var plan = await db.TravelPlans
                .Include(p => p.Destinations)
                .Include(p => p.Activities)
                .Include(p => p.Expenses)
                .Include(p => p.ChecklistItems)
                .FirstOrDefaultAsync(p => p.Id == id && (p.UserId == userId || db.PlanAccesses.Any(a => a.TravelPlanId == id && a.UserId == userId)));
            return plan == null ? null : mapper.Map<TravelPlanResponseDto>(plan);
        }

        public async Task<TravelPlanResponseDto> CreateAsync(CreateTravelPlanDto dto, int userId)
        {
            var plan = mapper.Map<TravelPlan>(dto);
            plan.UserId = userId;
            db.TravelPlans.Add(plan);
            await db.SaveChangesAsync();

            await notificationService.PublishAsync(new TravelPlanEvent
            {
                EventType = "PLAN_CREATED",
                UserId = userId,
                PlanName = plan.Name,
                Timestamp = DateTime.UtcNow
            });

            return mapper.Map<TravelPlanResponseDto>(plan);
        }

        public async Task<TravelPlanResponseDto?> UpdateAsync(int id, UpdateTravelPlanDto dto, int userId)
        {
            var plan = await db.TravelPlans.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (plan == null) 
                return null;

            mapper.Map(dto, plan);
            await db.SaveChangesAsync();

            await notificationService.PublishAsync(new TravelPlanEvent
            {
                EventType = "PLAN_UPDATED",
                UserId = userId,
                PlanName = plan.Name,
                Timestamp = DateTime.UtcNow
            });

            return mapper.Map<TravelPlanResponseDto>(plan);
        }

        public async Task<bool> DeleteAsync(int id, int userId)
        {
            var plan = await db.TravelPlans.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (plan == null) 
                return false;

            db.TravelPlans.Remove(plan);
            await db.SaveChangesAsync();

            await notificationService.PublishAsync(new TravelPlanEvent
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
            var sharedPlanIds = await db.PlanAccesses
                .Where(a => a.UserId == userId)
                .Select(a => a.TravelPlanId)
                .ToListAsync();

            var plans = await db.TravelPlans
                .Include(p => p.Destinations)
                .Include(p => p.Activities)
                .Include(p => p.Expenses)
                .Include(p => p.ChecklistItems)
                .Where(p => sharedPlanIds.Contains(p.Id))
                .ToListAsync();

            return mapper.Map<List<TravelPlanResponseDto>>(plans);
        }

        public async Task<List<TravelPlanResponseDto>> GetAllPlansAsync()
        {
            var plans = await db.TravelPlans
                .Include(p => p.Destinations)
                .Include(p => p.Activities)
                .Include(p => p.Expenses)
                .Include(p => p.ChecklistItems)
                .ToListAsync();
            return mapper.Map<List<TravelPlanResponseDto>>(plans);
        }

        public async Task<bool> DeleteAsAdminAsync(int id)
        {
            var plan = await db.TravelPlans.FirstOrDefaultAsync(p => p.Id == id);
            if (plan == null) 
                return false;

            db.TravelPlans.Remove(plan);
            await db.SaveChangesAsync();

            await notificationService.PublishAsync(new TravelPlanEvent
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