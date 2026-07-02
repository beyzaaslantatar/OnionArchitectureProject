using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using YoutubeApiApplication.Bases;

namespace YoutubeApiApplication.Features.Auth.Exceptions
{
    public class UserAlreadyExistException : BaseExceptions
    {
        public UserAlreadyExistException() : base("This user is already exists.") { }
    }
}
