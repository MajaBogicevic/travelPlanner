using Microsoft.ServiceFabric.Services.Remoting;
using Shared.Events;

namespace Shared.Interface
{
    public interface INotificationService : IService
    {
        Task PublishAsync(TravelPlanEvent planEvent);
    }
}
