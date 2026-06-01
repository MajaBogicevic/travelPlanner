using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TravelService.DTO.Destination;
using TravelService.Services;

namespace TravelService.Controllers
{
    [ApiController]
    [Route("api/travel-plans/{planId}/destinations")]
    [Authorize]
    public class DestinationsController : ControllerBase
    {
        private readonly IDestinationService _service;

        public DestinationsController(IDestinationService service)
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
            var destination = await _service.GetByIdAsync(id, planId, CurrentUserId);
            return destination == null ? NotFound() : Ok(destination);
        }

        [HttpPost]
        public async Task<IActionResult> Create(int planId, [FromBody] CreateDestinationDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (dto.DepartureDate < dto.ArrivalDate)
                return BadRequest(new { message = "Datum odlaska ne može biti prije dolaska" });
            var destination = await _service.CreateAsync(planId, dto, CurrentUserId);
            return CreatedAtAction(nameof(GetById), new { planId, id = destination.Id }, destination);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int planId, int id, [FromBody] UpdateDestinationDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (dto.DepartureDate < dto.ArrivalDate)
                return BadRequest(new { message = "Datum odlaska ne može biti prije dolaska" });
            var destination = await _service.UpdateAsync(id, planId, dto, CurrentUserId);
            return destination == null ? NotFound() : Ok(destination);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int planId, int id)
        {
            var ok = await _service.DeleteAsync(id, planId, CurrentUserId);
            return ok ? NoContent() : NotFound();
        }
    }
}