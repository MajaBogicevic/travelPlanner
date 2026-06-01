using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TravelService.DTO.Checklist;
using TravelService.Services;

namespace TravelService.Controllers
{
    [ApiController]
    [Route("api/travel-plans/{planId}/checklist")]
    [Authorize]
    public class ChecklistController : ControllerBase
    {
        private readonly IChecklistService _service;

        public ChecklistController(IChecklistService service)
        {
            _service = service;
        }

        private int CurrentUserId =>
            int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        [HttpGet]
        public async Task<IActionResult> GetAll(int planId)
            => Ok(await _service.GetAllAsync(planId, CurrentUserId));

        [HttpPost]
        public async Task<IActionResult> Create(int planId, [FromBody] CreateChecklistItemDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var item = await _service.CreateAsync(planId, dto, CurrentUserId);
            return Ok(item);
        }

        [HttpPatch("{id}/toggle")]
        public async Task<IActionResult> Toggle(int planId, int id)
        {
            var item = await _service.ToggleAsync(id, planId, CurrentUserId);
            return item == null ? NotFound() : Ok(item);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int planId, int id)
        {
            var ok = await _service.DeleteAsync(id, planId, CurrentUserId);
            return ok ? NoContent() : NotFound();
        }
    }
}