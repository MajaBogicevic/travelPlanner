namespace TravelService.DTO.Destination
{
    public class DestinationResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Location { get; set; }
        public DateTime ArrivalDate { get; set; }
        public DateTime DepartureDate { get; set; }
        public string? Description { get; set; }
    }
}
