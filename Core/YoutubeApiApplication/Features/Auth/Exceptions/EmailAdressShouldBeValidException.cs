using YoutubeApiApplication.Bases;

namespace YoutubeApiApplication.Features.Auth.Exceptions
{
    public class EmailAdressShouldBeValidException : BaseExceptions
    {
        public EmailAdressShouldBeValidException() : base("This email address does not exist.") { }
    }
}
