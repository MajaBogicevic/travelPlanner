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
        private readonly IActivityService service;

        public ActivitiesController(IActivityService service)
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

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int planId, int id)
        {
            var activity = await service.GetByIdAsync(id, planId, CurrentUserId);
            if (activity == null)
            {
                return NotFound();
            }
            else
            {
                return Ok(activity);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create(int planId, [FromBody] CreateActivityDto dto)
        {
            if (!ModelState.IsValid) 
                return BadRequest(ModelState);

            var activity = await service.CreateAsync(planId, dto, CurrentUserId);
            return CreatedAtAction(nameof(GetById), new { planId, id = activity.Id }, activity);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int planId, int id, [FromBody] UpdateActivityDto dto)
        {
            if (!ModelState.IsValid) 
                return BadRequest(ModelState);

            var activity = await service.UpdateAsync(id, planId, dto, CurrentUserId);
            if (activity == null)
            {
                return NotFound();
            }
            else
            {
                return Ok(activity);
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