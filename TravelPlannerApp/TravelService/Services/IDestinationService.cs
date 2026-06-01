using TravelService.DTO.Destination;

namespace TravelService.Services
{
    public interface IDestinationService
    {
        Task<List<DestinationResponseDto>> GetAllAsync(int planId, int userId);
        Task<DestinationResponseDto?> GetByIdAsync(int id, int planId, int userId);
        Task<DestinationResponseDto> CreateAsync(int planId, CreateDestinationDto dto, int userId);
        Task<DestinationResponseDto?> UpdateAsync(int id, int planId, UpdateDestinationDto dto, int userId);
        Task<bool> DeleteAsync(int id, int planId, int userId);
    }
}