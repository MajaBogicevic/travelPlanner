using AutoMapper;
using TravelService.DTO.Checklist;
using TravelService.Models;

namespace TravelService.Mapping
{
    public class ChecklistProfile : Profile
    {
        public ChecklistProfile()
        {
            CreateMap<CreateChecklistItemDto, ChecklistItem>();
            CreateMap<ChecklistItem, ChecklistItemDto>();
        }
    }
}
