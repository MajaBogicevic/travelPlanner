using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TravelService.DTO.Expense;
using TravelService.Services;

namespace TravelService.Controllers
{
    [ApiController]
    [Route("api/travel-plans/{planId}/expenses")]
    [Authorize]
    public class ExpensesController : ControllerBase
    {
        private readonly IExpenseService _service;

        public ExpensesController(IExpenseService service)
        {
            _service = service;
        }

        private int CurrentUserId =>
            int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        [HttpGet]
        public async Task<IActionResult> GetAll(int planId)
            => Ok(await _service.GetAllAsync(planId, CurrentUserId));

        [HttpPost]
        public async Task<IActionResult> Create(int planId, [FromBody] CreateExpenseDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var expense = await _service.CreateAsync(planId, dto, CurrentUserId);
            return Ok(expense);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int planId, int id, [FromBody] UpdateExpenseDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var expense = await _service.UpdateAsync(id, planId, dto, CurrentUserId);
            return expense == null ? NotFound() : Ok(expense);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int planId, int id)
        {
            var ok = await _service.DeleteAsync(id, planId, CurrentUserId);
            return ok ? NoContent() : NotFound();
        }
    }
}