using System.Runtime.Serialization;

namespace Shared.Events
{
    [DataContract]
    public class TravelPlanEvent
    {
        [DataMember] public string EventType { get; set; } = string.Empty;
        [DataMember] public int UserId { get; set; }
        [DataMember] public string UserEmail { get; set; } = string.Empty;
        [DataMember] public string UserName { get; set; } = string.Empty;
        [DataMember] public string PlanName { get; set; } = string.Empty;
        [DataMember] public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}