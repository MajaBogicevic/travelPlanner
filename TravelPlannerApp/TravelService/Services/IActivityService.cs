using TravelService.DTO.Activiry;

namespace TravelService.Services
{
    public interface IActivityService
    {
        Task<List<ActivityResponseDto>> GetAllAsync(int planId, int userId);
        Task<ActivityResponseDto?> GetByIdAsync(int id, int planId, int userId);
        Task<ActivityResponseDto> CreateAsync(int planId, CreateActivityDto dto, int userId);
        Task<ActivityResponseDto?> UpdateAsync(int id, int planId, UpdateActivityDto dto, int userId);
        Task<bool> DeleteAsync(int id, int planId, int userId);
    }
}