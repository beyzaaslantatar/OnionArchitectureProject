using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using YoutubeApiApplication.Bases;
using YoutubeApiApplication.Features.Auth.Exceptions;
using YoutubeApiDomain.Entities;

namespace YoutubeApiApplication.Features.Auth.Rules
{
    public class AuthRules : BaseRules
    {
        public Task UserShouldNotBeExist(User? user)
        {
            if (user is not null) throw new UserAlreadyExistException();
            return Task.CompletedTask;
        }
    }
}
