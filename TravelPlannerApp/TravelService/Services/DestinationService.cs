using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TravelService.Data;
using TravelService.DTO.Destination;
using TravelService.Models;

namespace TravelService.Services
{
    public class DestinationService : IDestinationService
    {
        private readonly TravelDbContext _db;
        private readonly IMapper _mapper;

        public DestinationService(TravelDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<List<DestinationResponseDto>> GetAllAsync(int planId, int userId)
        {
            var destinations = await _db.Destinations
                .Where(d => d.TravelPlanId == planId && d.TravelPlan.UserId == userId)
                .ToListAsync();

            return _mapper.Map<List<DestinationResponseDto>>(destinations);
        }

        public async Task<DestinationResponseDto?> GetByIdAsync(int id, int planId, int userId)
        {
            var destination = await _db.Destinations
                .FirstOrDefaultAsync(d => d.Id == id && d.TravelPlanId == planId
                    && d.TravelPlan.UserId == userId);

            return destination == null ? null : _mapper.Map<DestinationResponseDto>(destination);
        }

        public async Task<DestinationResponseDto> CreateAsync(int planId, CreateDestinationDto dto, int userId)
        {
            var plan = await _db.TravelPlans
                .FirstOrDefaultAsync(p => p.Id == planId && p.UserId == userId);

            if (plan == null) throw new KeyNotFoundException("Plan nije pronađen");

            var destination = _mapper.Map<Destination>(dto);
            destination.TravelPlanId = planId;

            _db.Destinations.Add(destination);
            await _db.SaveChangesAsync();

            return _mapper.Map<DestinationResponseDto>(destination);
        }

        public async Task<DestinationResponseDto?> UpdateAsync(int id, int planId, UpdateDestinationDto dto, int userId)
        {
            var destination = await _db.Destinations
                .FirstOrDefaultAsync(d => d.Id == id && d.TravelPlanId == planId
                    && d.TravelPlan.UserId == userId);

            if (destination == null) return null;

            _mapper.Map(dto, destination);
            await _db.SaveChangesAsync();

            return _mapper.Map<DestinationResponseDto>(destination);
        }

        public async Task<bool> DeleteAsync(int id, int planId, int userId)
        {
            var destination = await _db.Destinations
                .FirstOrDefaultAsync(d => d.Id == id && d.TravelPlanId == planId
                    && d.TravelPlan.UserId == userId);

            if (destination == null) return false;

            _db.Destinations.Remove(destination);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}