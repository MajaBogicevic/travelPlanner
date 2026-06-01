using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TravelService.DTO.Activiry;
using TravelService.Services;

namespace TravelService.Controllers
{
    [ApiController]
    [Route("api/travel-plans/{planId}/activities")]
    [Authorize]
    public class ActivitiesController : ControllerBase
    {
        private readonly IActivityService _service;

        public ActivitiesController(IActivityService service)
        {
            _service = service;
        }

        private int CurrentUserId =>
            int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        [HttpGet]
        public async Task<IActionResult> GetAll(int planId)
            => Ok(await _service.GetAllAsync(planId, CurrentUserId));

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int planId, int id)
        {
            var activity = await _service.GetByIdAsync(id, planId, CurrentUserId);
            return activity == null ? NotFound() : Ok(activity);
        }

        [HttpPost]
        public async Task<IActionResult> Create(int planId, [FromBody] CreateActivityDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var activity = await _service.CreateAsync(planId, dto, CurrentUserId);
            return CreatedAtAction(nameof(GetById), new { planId, id = activity.Id }, activity);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int planId, int id, [FromBody] UpdateActivityDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var activity = await _service.UpdateAsync(id, planId, dto, CurrentUserId);
            return activity == null ? NotFound() : Ok(activity);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int planId, int id)
        {
            var ok = await _service.DeleteAsync(id, planId, CurrentUserId);
            return ok ? NoContent() : NotFound();
        }
    }
}