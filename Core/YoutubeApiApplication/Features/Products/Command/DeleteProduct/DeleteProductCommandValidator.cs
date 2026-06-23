using FluentValidation;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using YoutubeApiApplication.Features.Products.Command.CreateProduct;

namespace YoutubeApiApplication.Features.Products.Command.DeleteProduct
{
    public class DeleteProductCommandValidator : AbstractValidator<DeleteProductCommandRequest>
    {
        public DeleteProductCommandValidator()
        {
            RuleFor(x => x.Id)
               .GreaterThan(0);
        }
    }
}
