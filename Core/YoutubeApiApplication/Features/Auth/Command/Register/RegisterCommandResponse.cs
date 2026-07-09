using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace YoutubeApiApplication.Features.Auth.Command.Register
{
    public class RegisterCommandResponse
    {
        public string Token { get; set; }        // Bu bizim Access Token'ımız
        public string RefreshToken { get; set; } // Bu da bahsettiğimiz Refresh Token
        public DateTime Expiration { get; set; }  // Access Token'ın bitiş süresi    }
    }
}