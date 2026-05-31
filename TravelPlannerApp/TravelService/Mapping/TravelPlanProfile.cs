using TravelService.DTO.TravelPlan;
using TravelService.Models;
using AutoMapper;

namespace TravelService.Mapping
{
    public class TravelPlanProfile : Profile
    {
        public TravelPlanProfile()
        {
            CreateMap<CreateTravelPlanDto, TravelPlan>();
            CreateMap<UpdateTravelPlanDto, TravelPlan>();
            CreateMap<TravelPlan, TravelPlanResponseDto>().ForMember(d => d.TotalExpenses,o => o.MapFrom(s => s.Expenses.Sum(e => e.Amount))).ForMember(d => d.RemainingBudget,o => o.MapFrom(s => s.Budget - s.Expenses.Sum(e => e.Amount)));
        }
    }
}
