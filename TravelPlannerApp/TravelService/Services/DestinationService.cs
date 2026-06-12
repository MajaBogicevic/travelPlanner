using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TravelService.Data;
using TravelService.DTO.Destination;
using TravelService.Models;
namespace TravelService.Services
{
    public class DestinationService : IDestinationService
    {
        private readonly TravelDbContext db;
        private readonly IMapper mapper;
        public DestinationService(TravelDbContext db, IMapper mapper)
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

        public async Task<List<DestinationResponseDto>> GetAllAsync(int planId, int userId)
        {
            if (!await HasAccessAsync(planId, userId)) 
                return new List<DestinationResponseDto>();

            var destinations = await db.Destinations
                .Where(d => d.TravelPlanId == planId)
                .ToListAsync();
            return mapper.Map<List<DestinationResponseDto>>(destinations);
        }

        public async Task<DestinationResponseDto?> GetByIdAsync(int id, int planId, int userId)
        {
            if (!await HasAccessAsync(planId, userId)) 
                return null;

            var destination = await db.Destinations.FirstOrDefaultAsync(d => d.Id == id && d.TravelPlanId == planId);

            if (destination == null)
            {
                return null;
            }
            else
            {
                return mapper.Map<DestinationResponseDto>(destination);
            }
        }

        public async Task<DestinationResponseDto> CreateAsync(int planId, CreateDestinationDto dto, int userId)
        {
            if (!await HasEditAccessAsync(planId, userId)) 
                throw new KeyNotFoundException("Plan nije pronadjen");

            var destination = mapper.Map<Destination>(dto);
            destination.TravelPlanId = planId;
            db.Destinations.Add(destination);
            await db.SaveChangesAsync();
            return mapper.Map<DestinationResponseDto>(destination);
        }

        public async Task<DestinationResponseDto?> UpdateAsync(int id, int planId, UpdateDestinationDto dto, int userId)
        {
            if (!await HasEditAccessAsync(planId, userId)) 
                return null;

            var destination = await db.Destinations.FirstOrDefaultAsync(d => d.Id == id && d.TravelPlanId == planId);
            if (destination == null) 
                return null;

            mapper.Map(dto, destination);
            await db.SaveChangesAsync();
            return mapper.Map<DestinationResponseDto>(destination);
        }

        public async Task<bool> DeleteAsync(int id, int planId, int userId)
        {
            if (!await HasEditAccessAsync(planId, userId)) 
                return false;
            var destination = await db.Destinations.FirstOrDefaultAsync(d => d.Id == id && d.TravelPlanId == planId);
            if (destination == null) 
                return false;

            db.Destinations.Remove(destination);
            await db.SaveChangesAsync();
            return true;
        }
    }
}