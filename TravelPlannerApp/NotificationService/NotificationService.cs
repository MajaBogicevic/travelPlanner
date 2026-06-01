using Microsoft.ServiceFabric.Data.Collections;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Shared.Events;
using Shared.Interface;
using System.Fabric;

namespace NotificationService
{
    /// <summary>
    /// The FabricRuntime creates an instance of this class for each service type instance.
    /// </summary>
    internal sealed class NotificationService : StatefulService, INotificationService
    {
        private const string QueueName = "notification-queue";

        public NotificationService(StatefulServiceContext context) : base(context) { }

        public async Task PublishAsync(TravelPlanEvent planEvent)
        {
            var queue = await StateManager
                .GetOrAddAsync<IReliableQueue<TravelPlanEvent>>(QueueName);

            using var tx = StateManager.CreateTransaction();
            await queue.EnqueueAsync(tx, planEvent);
            await tx.CommitAsync();
        }

        /// <summary>
        /// Optional override to create listeners (like tcp, http) for this service instance.
        /// </summary>
        /// <returns>The collection of listeners.</returns>
        protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners()
            => this.CreateServiceRemotingReplicaListeners();

        protected override async Task RunAsync(CancellationToken cancellationToken)
        {
            var queue = await StateManager
                .GetOrAddAsync<IReliableQueue<TravelPlanEvent>>(QueueName);

            while (true)
            {
                cancellationToken.ThrowIfCancellationRequested();

                using var tx = StateManager.CreateTransaction();
                var result = await queue.TryDequeueAsync(tx, TimeSpan.FromSeconds(5), cancellationToken);
                if (result.HasValue)
                {
                    await ProcessEventAsync(result.Value);
                    await tx.CommitAsync();
                }
                else
                {
                    await Task.Delay(TimeSpan.FromSeconds(5), cancellationToken);
                }
            }
        }

        private Task ProcessEventAsync(TravelPlanEvent evt)
        {
            ServiceEventSource.Current.ServiceMessage(Context,
                $"[{evt.EventType}] Plan: {evt.PlanName}, User: {evt.UserEmail}, Time: {evt.Timestamp}");
            return Task.CompletedTask;
        }
    }
}