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
    }
}
