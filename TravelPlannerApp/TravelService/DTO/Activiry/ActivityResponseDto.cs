namespace TravelService.DTO.Activiry
{
    public class ActivityResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string? Time { get; set; }
        public string? Location { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string? Description { get; set; }
        public decimal? EstimatedCost { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
