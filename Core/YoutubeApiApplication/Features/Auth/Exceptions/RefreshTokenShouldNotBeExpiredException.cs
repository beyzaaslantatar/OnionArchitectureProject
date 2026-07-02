using YoutubeApiApplication.Bases;

namespace YoutubeApiApplication.Features.Auth.Exceptions
{
    public class RefreshTokenShouldNotBeExpiredException : BaseExceptions
    {
        public RefreshTokenShouldNotBeExpiredException() : base("The session has expired. Please try to login again.") { }
    }

}
