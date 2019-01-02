namespace Contoso.WebAPI.Models
{
    public class PushChannel
    {
        public int Id { get; set; }

        public string ChannelUri { get; set; }

        public string P256Dh { get; set; }

        public string Auth { get; set; }
    }
}
