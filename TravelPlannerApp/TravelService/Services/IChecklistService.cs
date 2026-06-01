using TravelService.DTO.Checklist;

namespace TravelService.Services
{
    public interface IChecklistService
    {
        Task<List<ChecklistItemDto>> GetAllAsync(int planId, int userId);
        Task<ChecklistItemDto> CreateAsync(int planId, CreateChecklistItemDto dto, int userId);
        Task<ChecklistItemDto?> ToggleAsync(int id, int planId, int userId);
        Task<bool> DeleteAsync(int id, int planId, int userId);
    }
}