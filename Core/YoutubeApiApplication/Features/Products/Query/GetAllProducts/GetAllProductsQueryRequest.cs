using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using YoutubeApiApplication.Interfaces.RedisCache;

namespace YoutubeApiApplication.Features.Products.Query.GetAllProducts
{
    public class GetAllProductsQueryRequest : IRequest<IList<GetAllProductsQueryResponse>> , ICacheableQuery
    {
        public string CacheKey => "GetAllProducts";
        public double CacheTime => 60;
    }
}
