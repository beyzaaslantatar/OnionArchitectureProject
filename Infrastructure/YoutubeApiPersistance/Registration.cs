using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using YoutubeApiApplication.Interfaces.Repositories;
using YoutubeApiApplication.Interfaces.UnitOfWorks;
using YoutubeApiPersistance.Context;
using YoutubeApiPersistance.Repositories;
using YoutubeApiPersistance.UnitOfWorks;

namespace YoutubeApiPersistance
{
    public static class Registration
    {
        public static void AddPersistance(this IServiceCollection services , IConfiguration configuration)
        {
            services.AddDbContext<AppDbContext>(opt => 
            opt.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

            services.AddScoped(typeof(IReadRepository<>) , typeof(ReadRepository<>));
            services.AddScoped(typeof(IWriteRepository<>), typeof(WriteRepository<>));

            services.AddScoped<IUnitOfWork , UnitOfWork>();

        }
    }
}
