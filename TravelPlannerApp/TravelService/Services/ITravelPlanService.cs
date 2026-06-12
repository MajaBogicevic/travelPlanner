using TravelService.DTO.TravelPlan;

namespace TravelService.Services
{
    public interface ITravelPlanService
    {
        Task<List<TravelPlanResponseDto>> GetAllByUserAsync(int userId);
        Task<TravelPlanResponseDto?> GetByIdAsync(int id, int userId);
        Task<TravelPlanResponseDto> CreateAsync(CreateTravelPlanDto dto, int userId);
        Task<TravelPlanResponseDto?> UpdateAsync(int id, UpdateTravelPlanDto dto, int userId);
        Task<bool> DeleteAsync(int id, int userId);
        Task<List<TravelPlanResponseDto>> GetSharedPlanIdsAsync(int userId);
        Task<List<TravelPlanResponseDto>> GetAllPlansAsync();
        Task<bool> DeleteAsAdminAsync(int id);
    }
}