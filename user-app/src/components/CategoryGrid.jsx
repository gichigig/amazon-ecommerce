import { Link } from 'react-router-dom'

const defaultCategories = [
  {
    title: 'Electronics',
    items: [
      { name: 'Smartphones', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop' },
      { name: 'Laptops', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop' },
      { name: 'Headphones', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop' },
      { name: 'Smart Watches', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop' }
    ],
    link: '/?category=electronics'
  },
  {
    title: 'Fashion',
    items: [
      { name: 'Dresses', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=300&fit=crop' },
      { name: 'Shirts', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop' },
      { name: 'Shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop' },
      { name: 'Handbags', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&h=300&fit=crop' }
    ],
    link: '/?category=fashion'
  },
  {
    title: 'Home & Kitchen',
    items: [
      { name: 'Cookware', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop' },
      { name: 'Furniture', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=300&fit=crop' },
      { name: 'Decor', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=300&h=300&fit=crop' },
      { name: 'Bedding', image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=300&h=300&fit=crop' }
    ],
    link: '/?category=home'
  },
  {
    title: 'Beauty & Health',
    items: [
      { name: 'Skincare', image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=300&h=300&fit=crop' },
      { name: 'Makeup', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=300&h=300&fit=crop' },
      { name: 'Perfumes', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=300&h=300&fit=crop' },
      { name: 'Hair Care', image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=300&h=300&fit=crop' }
    ],
    link: '/?category=beauty'
  }
]

export default function CategoryGrid({ categories = defaultCategories }) {
  return (
    <div className="category-grid-container">
      {categories.map((category, index) => (
        <div key={index} className="category-card">
          <h2 className="category-card-title">{category.title}</h2>
          <div className="category-items-grid">
            {category.items.slice(0, 4).map((item, itemIndex) => (
              <Link 
                key={itemIndex} 
                to={category.link || '#'} 
                className="category-item"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="category-item-image"
                />
                <p className="category-item-name">{item.name}</p>
              </Link>
            ))}
          </div>
          <Link to={category.link || '#'} className="category-see-more">
            See all deals
          </Link>
        </div>
      ))}
    </div>
  )
}
