using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace YoutubeApiApplication.Interfaces.RedisCache
{
    public interface ICacheRemoverCommand
    {
        string CacheKey { get; }
    }
}
