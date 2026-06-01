using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TravelService.Data;
using TravelService.DTO.Expense;
using TravelService.Models;

namespace TravelService.Services
{
    public class ExpenseService : IExpenseService
    {
        private readonly TravelDbContext _db;
        private readonly IMapper _mapper;

        public ExpenseService(TravelDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<List<ExpenseResponseDto>> GetAllAsync(int planId, int userId)
        {
            var expenses = await _db.Expenses
                .Where(e => e.TravelPlanId == planId && e.TravelPlan.UserId == userId)
                .ToListAsync();

            return _mapper.Map<List<ExpenseResponseDto>>(expenses);
        }

        public async Task<ExpenseResponseDto> CreateAsync(int planId, CreateExpenseDto dto, int userId)
        {
            var plan = await _db.TravelPlans
                .FirstOrDefaultAsync(p => p.Id == planId && p.UserId == userId);

            if (plan == null) throw new KeyNotFoundException("Plan nije pronađen");

            var expense = _mapper.Map<Expense>(dto);
            expense.TravelPlanId = planId;

            _db.Expenses.Add(expense);
            await _db.SaveChangesAsync();

            return _mapper.Map<ExpenseResponseDto>(expense);
        }

        public async Task<ExpenseResponseDto?> UpdateAsync(int id, int planId, UpdateExpenseDto dto, int userId)
        {
            var expense = await _db.Expenses
                .FirstOrDefaultAsync(e => e.Id == id && e.TravelPlanId == planId
                    && e.TravelPlan.UserId == userId);

            if (expense == null) return null;

            _mapper.Map(dto, expense);
            await _db.SaveChangesAsync();

            return _mapper.Map<ExpenseResponseDto>(expense);
        }

        public async Task<bool> DeleteAsync(int id, int planId, int userId)
        {
            var expense = await _db.Expenses
                .FirstOrDefaultAsync(e => e.Id == id && e.TravelPlanId == planId
                    && e.TravelPlan.UserId == userId);

            if (expense == null) return false;

            _db.Expenses.Remove(expense);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}