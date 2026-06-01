using TravelService.DTO.Share;
using TravelService.DTOs.Share;

namespace TravelService.Services
{
    public interface IShareService
    {
        Task<ShareResponseDto> CreateShareTokenAsync(int planId, CreateShareDto dto, int userId);
        Task<SharedPlanResponseDto?> GetByTokenAsync(string token);
    }
}