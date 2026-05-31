using AutoMapper;
using TravelService.DTO.Activiry;
using TravelService.Models;

namespace TravelService.Mapping
{
    public class ActivityProfile : Profile
    {
        public ActivityProfile()
        {
            CreateMap<CreateActivityDto, Activity>();
            CreateMap<UpdateActivityDto, Activity>();
            CreateMap<Activity, ActivityResponseDto>().ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));
        }
    }
}
