using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using YoutubeApiDomain.Common;
using YoutubeApiDomain.Entities;

namespace YoutubeApiDomain.Entities
{
    public class Category : EntityBase, IEntityBase
    {

        public Category()
        {
            
        }
        public Category(int parentId, string name, int priority)
        {
            Name = name;
            Priority = priority;
            ParentId = parentId;
            
        }
        public required int ParentId { get; set; }
        public required string Name { get; set; }
        public required int Priority { get; set; }

        public ICollection<Detail> Details { get; set; }
        public ICollection<ProductCategory> ProductCategories { get; set; }
    }
}