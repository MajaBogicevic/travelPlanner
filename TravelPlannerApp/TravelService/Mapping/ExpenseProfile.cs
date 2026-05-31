using AutoMapper;
using TravelService.DTO.Expense;
using TravelService.Models;

namespace TravelService.Mapping
{
    public class ExpenseProfile : Profile
    {
        public ExpenseProfile()
        {
            CreateMap<CreateExpenseDto, Expense>();
            CreateMap<UpdateExpenseDto, Expense>();
            CreateMap<Expense, ExpenseResponseDto>().ForMember(d => d.Category, o => o.MapFrom(s => s.Category.ToString()));
        }
    }
}
