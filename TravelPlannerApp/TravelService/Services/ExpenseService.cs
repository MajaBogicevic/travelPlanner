using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TravelService.Data;
using TravelService.DTO.Expense;
using TravelService.Models;
namespace TravelService.Services
{
    public class ExpenseService : IExpenseService
    {
        private readonly TravelDbContext db;
        private readonly IMapper mapper;
        public ExpenseService(TravelDbContext db, IMapper mapper)
        {
            this.db = db;
            this.mapper = mapper;
        }

        private async Task<bool> HasAccessAsync(int planId, int userId)
        {
            return await db.TravelPlans.AnyAsync(p => p.Id == planId && p.UserId == userId) || await db.PlanAccesses.AnyAsync(a => a.TravelPlanId == planId && a.UserId == userId);
        }

        private async Task<bool> HasEditAccessAsync(int planId, int userId)
        {
            return await db.TravelPlans.AnyAsync(p => p.Id == planId && p.UserId == userId) || await db.PlanAccesses.AnyAsync(a => a.TravelPlanId == planId && a.UserId == userId && a.AccessType == ShareAccessType.Edit);
        }

        public async Task<List<ExpenseResponseDto>> GetAllAsync(int planId, int userId)
        {
            if (!await HasAccessAsync(planId, userId)) 
                return new List<ExpenseResponseDto>();

            var expenses = await db.Expenses
                .Where(e => e.TravelPlanId == planId)
                .ToListAsync();
            return mapper.Map<List<ExpenseResponseDto>>(expenses);
        }

        public async Task<ExpenseResponseDto> CreateAsync(int planId, CreateExpenseDto dto, int userId)
        {
            if (!await HasEditAccessAsync(planId, userId)) 
                throw new KeyNotFoundException("Plan nije pronadjen");

            var expense = mapper.Map<Expense>(dto);
            expense.TravelPlanId = planId;
            db.Expenses.Add(expense);
            await db.SaveChangesAsync();
            return mapper.Map<ExpenseResponseDto>(expense);
        }

        public async Task<ExpenseResponseDto?> UpdateAsync(int id, int planId, UpdateExpenseDto dto, int userId)
        {
            if (!await HasEditAccessAsync(planId, userId)) 
                return null;

            var expense = await db.Expenses.FirstOrDefaultAsync(e => e.Id == id && e.TravelPlanId == planId);
            if (expense == null) 
                return null;

            mapper.Map(dto, expense);
            await db.SaveChangesAsync();
            return mapper.Map<ExpenseResponseDto>(expense);
        }

        public async Task<bool> DeleteAsync(int id, int planId, int userId)
        {
            if (!await HasEditAccessAsync(planId, userId)) 
                return false;

            var expense = await db.Expenses.FirstOrDefaultAsync(e => e.Id == id && e.TravelPlanId == planId);
            if (expense == null) 
                return false;

            db.Expenses.Remove(expense);
            await db.SaveChangesAsync();
            return true;
        }
    }
}