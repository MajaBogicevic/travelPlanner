using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TravelService.DTO.Share;
using TravelService.Services;

namespace TravelService.Controllers
{
    [ApiController]
    [Route("api")]
    public class ShareController : ControllerBase
    {
        private readonly IShareService _service;

        public ShareController(IShareService service)
        {
            _service = service;
        }

        private int CurrentUserId =>
            int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        [HttpPost("travel-plans/{planId}/share")]
        [Authorize]
        public async Task<IActionResult> CreateShareToken(int planId, [FromBody] CreateShareDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                var result = await _service.CreateShareTokenAsync(planId, dto, CurrentUserId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpGet("shared/{token}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByToken(string token)
        {
            var result = await _service.GetByTokenAsync(token);
            if (result == null)
                return NotFound(new { message = "Token nije validan ili je istekao" });
            return Ok(result);
        }
    }
}