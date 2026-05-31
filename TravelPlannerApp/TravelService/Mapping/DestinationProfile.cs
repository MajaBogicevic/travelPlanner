using AutoMapper;
using TravelService.DTO.Destination;
using TravelService.Models;

namespace TravelService.Mapping
{
    public class DestinationProfile : Profile
    {
        public DestinationProfile()
        {
            CreateMap<CreateDestinationDto, Destination>();
            CreateMap<UpdateDestinationDto, Destination>();
            CreateMap<Destination, DestinationResponseDto>();
        }
    }
}
