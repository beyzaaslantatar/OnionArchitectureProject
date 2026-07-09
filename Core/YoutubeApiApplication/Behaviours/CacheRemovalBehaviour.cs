using MediatR;
using Microsoft.Extensions.Caching.Distributed;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using YoutubeApiApplication.Interfaces.RedisCache;

namespace YoutubeApiApplication.Behaviours
{
    public class CacheRemovalBehaviour<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse> 
        where TRequest : ICacheRemoverCommand
    {
        private readonly IDistributedCache _cache;
        public CacheRemovalBehaviour(IDistributedCache cache)
        {
            _cache = cache;
        }

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            var response = await next();

            await _cache.RemoveAsync(request.CacheKey, cancellationToken);

            return response;
        }
    }
}
