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
        private readonly IChecklistService service;

        public ChecklistController(IChecklistService service)
        {
            this.service = service;
        }

        private int CurrentUserId => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        [HttpGet]
        public async Task<IActionResult> GetAll(int planId)
        {
            var result = await service.GetAllAsync(planId, CurrentUserId);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(int planId, [FromBody] CreateChecklistItemDto dto)
        {
            if (!ModelState.IsValid) 
                return BadRequest(ModelState);

            var item = await service.CreateAsync(planId, dto, CurrentUserId);
            return Ok(item);
        }

        [HttpPatch("{id}/toggle")]
        public async Task<IActionResult> Toggle(int planId, int id)
        {
            var item = await service.ToggleAsync(id, planId, CurrentUserId);
            if (item == null)
            {
                return NotFound();
            }
            else
            {
                return Ok(item);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int planId, int id)
        {
            var ok = await service.DeleteAsync(id, planId, CurrentUserId);
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