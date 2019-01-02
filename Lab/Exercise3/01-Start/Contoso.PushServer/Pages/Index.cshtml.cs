using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Contoso.PushServer.Models;

namespace Contoso.PushServer.Pages
{
    public class IndexModel : PageModel
    {
        public List<PushChannel> Channels { get; set; }

        private string databasePath = $"{Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData)}\\pushchannels.db";

        public IndexModel()
        {
        }

        public async Task OnGet()
        {
            HttpClient client = new HttpClient();
            string json = await client.GetStringAsync("http://localhost:5000/api/push/channel");
            var channels = JsonConvert.DeserializeObject<List<PushChannel>>(json);
            Channels = channels;
        }
    }
}
