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
        private readonly ITravelPlanService service;

        public TravelPlansController(ITravelPlanService service)
        {
            this.service = service;
        }

        private int CurrentUserId => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await service.GetAllByUserAsync(CurrentUserId);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var plan = await service.GetByIdAsync(id, CurrentUserId);
            if (plan == null)
            {
                return NotFound();
            }
            else
            {
                return Ok(plan);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTravelPlanDto dto)
        {
            if (!ModelState.IsValid) 
                return BadRequest(ModelState);

            if (dto.EndDate < dto.StartDate)
                return BadRequest(new { message = "Krajnji datum ne može biti pre početnog" });

            if (dto.Budget < 0)
                return BadRequest(new { message = "Budžet ne može biti negativan" });

            var plan = await service.CreateAsync(dto, CurrentUserId);
            return CreatedAtAction(nameof(GetById), new { id = plan.Id }, plan);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateTravelPlanDto dto)
        {
            if (!ModelState.IsValid) 
                return BadRequest(ModelState);

            if (dto.EndDate < dto.StartDate)
                return BadRequest(new { message = "Krajnji datum ne može biti pre početnog" });

            if (dto.Budget < 0)
                return BadRequest(new { message = "Budžet ne može biti negativan" });

            var plan = await service.UpdateAsync(id, dto, CurrentUserId);
            if (plan == null)
            {
                return NotFound();
            }
            else
            {
                return Ok(plan);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await service.DeleteAsync(id, CurrentUserId);
            if (ok)
            {
                return NoContent();
            }
            else
            {
                return NotFound();
            }
        }

        [HttpGet("shared")]
        public async Task<IActionResult> GetSharedPlans()
        {
            var sharedPlanIds = await service.GetSharedPlanIdsAsync(CurrentUserId);
            return Ok(sharedPlanIds);
        }

        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllPlans()
        {
            var plans = await service.GetAllPlansAsync();
            return Ok(plans);
        }

        [HttpDelete("admin/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAsAdmin(int id)
        {
            var ok = await service.DeleteAsAdminAsync(id);
            if (ok)
            {
                return NoContent();
            }
            else
            {
                return NotFound();
            }
        }
    }
}