using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TravelService.DTO.TravelPlan;
using TravelService.Services;

namespace TravelService.Controllers
{
    [ApiController]
    [Route("api/travel-plans")]
    [Authorize]
    public class TravelPlansController : ControllerBase
    {
        private readonly ITravelPlanService _service;

        public TravelPlansController(ITravelPlanService service)
        {
            _service = service;
        }

        private int CurrentUserId =>
            int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        [HttpGet]
        public async Task<IActionResult> GetAll()
            => Ok(await _service.GetAllByUserAsync(CurrentUserId));

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var plan = await _service.GetByIdAsync(id, CurrentUserId);
            return plan == null ? NotFound() : Ok(plan);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTravelPlanDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (dto.EndDate < dto.StartDate)
                return BadRequest(new { message = "Krajnji datum ne može biti prije početnog" });

            if (dto.Budget < 0)
                return BadRequest(new { message = "Budžet ne može biti negativan" });

            var plan = await _service.CreateAsync(dto, CurrentUserId);
            return CreatedAtAction(nameof(GetById), new { id = plan.Id }, plan);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateTravelPlanDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (dto.EndDate < dto.StartDate)
                return BadRequest(new { message = "Krajnji datum ne može biti prije početnog" });

            if (dto.Budget < 0)
                return BadRequest(new { message = "Budžet ne može biti negativan" });

            var plan = await _service.UpdateAsync(id, dto, CurrentUserId);
            return plan == null ? NotFound() : Ok(plan);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _service.DeleteAsync(id, CurrentUserId);
            return ok ? NoContent() : NotFound();
        }

        [HttpGet("shared")]
        public async Task<IActionResult> GetSharedPlans()
        {
            var sharedPlanIds = await _service.GetSharedPlanIdsAsync(CurrentUserId);
            return Ok(sharedPlanIds);
        }

        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllPlans()
        {
            var plans = await _service.GetAllPlansAsync();
            return Ok(plans);
        }

        [HttpDelete("admin/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAsAdmin(int id)
        {
            var ok = await _service.DeleteAsAdminAsync(id);
            return ok ? NoContent() : NotFound();
        }
    }
}