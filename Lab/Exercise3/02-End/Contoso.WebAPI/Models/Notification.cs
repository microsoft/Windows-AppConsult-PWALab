using Newtonsoft.Json;

namespace Contoso.WebAPI.Models
{
    public class Notification
    {
        [JsonProperty("title")]
        public string Title { get; set; }

        [JsonProperty("message")]
        public string Message { get; set; }
    }
}
    