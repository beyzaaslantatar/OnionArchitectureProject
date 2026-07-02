using YoutubeApiApplication.Bases;

namespace YoutubeApiApplication.Features.Auth.Exceptions
{
    public class EmailOrPasswordShouldNotBeInvalidException : BaseExceptions
    {
        public EmailOrPasswordShouldNotBeInvalidException() : base("Username or password is not correct.") { }
    }

}
