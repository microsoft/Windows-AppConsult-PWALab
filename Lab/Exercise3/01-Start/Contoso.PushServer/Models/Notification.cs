using Newtonsoft.Json;

namespace Contoso.PushServer.Models
{
    public class Notification
    {
        [JsonProperty("title")]
        public string Title { get; set; }

        [JsonProperty("message")]
        public string Message { get; set; }
    }
}
    