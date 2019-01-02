using System;
using System.Threading.Tasks;
using LiteDB;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Contoso.WebAPI.Models;
using WebPush;
using System.Collections.Generic;

namespace PushApp.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PushController : ControllerBase
    {
        private string databasePath;
        private string privateKey;
        private string publicKey;

        public PushController(IConfiguration configuration)
        {
            databasePath = configuration["DatabasePath"];
            publicKey = configuration["VAPIDPublicKey"];
            privateKey = configuration["VAPIDPrivateKey"];
        }

        [HttpGet("key")]
        public ActionResult Key()
        {
            return new JsonResult(publicKey);
        }

        [HttpPost("channel")]
        public ActionResult SaveChannel(Subscription subscription)
        {
            using (var db = new LiteDatabase(databasePath))
            {
                PushChannel channel = new PushChannel
                {
                    ChannelUri = subscription.DeviceSubscription.Endpoint.ToString(),
                    P256Dh = subscription.DeviceSubscription.Keys.P256Dh,
                    Auth = subscription.DeviceSubscription.Keys.Auth
                };

                var channels = db.GetCollection<PushChannel>();
                channels.Insert(channel);

                return new OkResult();
            }
        }

        [HttpGet("channel")]
        public ActionResult<List<PushChannel>> GetChannels()
        {
            using (var db = new LiteDatabase(databasePath))
            {
                var channels = db.GetCollection<PushChannel>();
                var list = channels.FindAll();
                return new OkObjectResult(list);
            }
        }

        [HttpPost("notification")]
        public async Task<ActionResult> SendNotification(PushChannel channel)
        {
            WebPushClient client = new WebPushClient();
            VapidDetails vapiDetails = new VapidDetails("https://aka.ms/appconsultblog", publicKey, privateKey);
            PushSubscription subscription = new PushSubscription(channel.ChannelUri, channel.P256Dh, channel.Auth);

            Notification message = new Notification
            {
                Title = "Test notification",
                Message = "Hey, you have a notification!"
            };

            string json = JsonConvert.SerializeObject(message);

            await client.SendNotificationAsync(subscription, json, vapiDetails);

            return new OkResult();
        }
    }
}
