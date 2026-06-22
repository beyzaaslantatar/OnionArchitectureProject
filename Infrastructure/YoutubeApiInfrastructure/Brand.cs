using YoutubeApiDomain.Common;

namespace YoutubeApiDomain.Entities
{
    public class Brand : EntityBase
    {
        public Brand()
        {
            
        }
        public Brand(string name)
        {
            Name = name;
        }

        public required string Name { get; set; }
        //public ICollection<Product> Products { get; set; } ?? bunu niye yazmadık
        
    }
}
