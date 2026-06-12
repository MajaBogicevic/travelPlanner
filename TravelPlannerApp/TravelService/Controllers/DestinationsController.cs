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
        private readonly IDestinationService service;

        public DestinationsController(IDestinationService service)
        {
            this.service = service;
        }

        private int CurrentUserId =>
            int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        [HttpGet]
        public async Task<IActionResult> GetAll(int planId)
        {
            var result = await service.GetAllAsync(planId, CurrentUserId);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int planId, int id)
        {
            var destination = await service.GetByIdAsync(id, planId, CurrentUserId);
            if (destination == null)
            {
                return NotFound();
            }
            else
            {
                return Ok(destination);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create(int planId, [FromBody] CreateDestinationDto dto)
        {
            if (!ModelState.IsValid) 
                return BadRequest(ModelState);

            if (dto.DepartureDate < dto.ArrivalDate)
                return BadRequest(new { message = "Datum odlaska ne može biti prije dolaska" });

            var destination = await service.CreateAsync(planId, dto, CurrentUserId);
            return CreatedAtAction(nameof(GetById), new { planId, id = destination.Id }, destination);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int planId, int id, [FromBody] UpdateDestinationDto dto)
        {
            if (!ModelState.IsValid) 
                return BadRequest(ModelState);

            if (dto.DepartureDate < dto.ArrivalDate)
                return BadRequest(new { message = "Datum odlaska ne može biti prije dolaska" });

            var destination = await service.UpdateAsync(id, planId, dto, CurrentUserId);
            if (destination == null)
            {
                return NotFound();
            }
            else
            {
                return Ok(destination);
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