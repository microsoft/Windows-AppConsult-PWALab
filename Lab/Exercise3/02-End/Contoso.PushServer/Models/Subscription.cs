using System;
using Newtonsoft.Json;

namespace Contoso.PushServer.Models
{
    public partial class Subscription
    {
        [JsonProperty("subscription")]
        public SubscriptionClass DeviceSubscription { get; set; }
    }

    public partial class SubscriptionClass
    {
        [JsonProperty("endpoint")]
        public Uri Endpoint { get; set; }

        [JsonProperty("expirationTime")]
        public object ExpirationTime { get; set; }

        [JsonProperty("keys")]
        public Keys Keys { get; set; }
    }

    public partial class Keys
    {
        [JsonProperty("p256dh")]
        public string P256Dh { get; set; }

        [JsonProperty("auth")]
        public string Auth { get; set; }
    }
}
