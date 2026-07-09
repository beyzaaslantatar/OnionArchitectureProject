using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using YoutubeApiApplication.Bases;
using YoutubeApiApplication.Behaviours;
using YoutubeApiApplication.Exceptions;
using YoutubeApiApplication.Features.Products.Rules;

namespace YoutubeApiApplication
{
    public static class Registration
    {
        public static void AddApplication(this IServiceCollection services)
        {
            var assembly = Assembly.GetExecutingAssembly();

            services.AddTransient<ExceptionMiddleware>();

            services.AddRulesFromAssemblyContaining(assembly, typeof(BaseRules));

            // 1. Önce MediatR ayağa kalkmalı
            services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(assembly));

            services.AddValidatorsFromAssembly(assembly);
            ValidatorOptions.Global.LanguageManager.Culture = new System.Globalization.CultureInfo("en-US");

            // 2. Önce validasyonlar (kontrol) çalışsın
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(FluentValidationBehaviour<,>));

            // 3. SONRA bizim cache temizleme süzgeci çalışsın
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(CacheRemovalBehaviour<,>));

            // 4. En son varsa mevcut RedisCacheBehaviour çalışsın
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(RedisCacheBehaviour<,>));
        }

        private static IServiceCollection AddRulesFromAssemblyContaining(
            this IServiceCollection services,
            Assembly assembly,
            Type type)
        {
            var types = assembly.GetTypes().Where(t=> t.IsSubclassOf(type) && type != t).ToList();

            foreach (var item in types)
                services.AddTransient(item);

            return services;
        }


    }
}
