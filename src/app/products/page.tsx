// app/products/page.tsx
import ProductCard from "@/components/features/ProductCard";

const mockProducts = [
    {
        id: 1,
        name: 'Торт "Наполеон"',
        price: 1200,
        description: 'Классический слоёный торт с заварным кремом',
        imageUrls: [],  // пустой массив (было image)
        categoryId: 1,
        stockQuantity: 10,
        createdAt: new Date('2024-01-01'),  // фиксированная дата
        updatedAt: new Date('2024-01-01')
    },
    {
    id: 2,
    name: 'Торт "Гай Юлий Цезарь"',
    price: 1600,
    description: 'Классический слоёный торт с заварным кремом',
    imageUrls: [],  // пустой массив (было image)
    categoryId: 1,
    stockQuantity: 10,
    createdAt: new Date('2024-01-01'),  // фиксированная дата
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 3,
    name: 'Торт "Иоган Себастиан Бах"',
    price: 1800,
    description: 'Классический слоёный торт с заварным кремом',
    imageUrls: [],  // пустой массив (было image)
    categoryId: 1,
    stockQuantity: 10,
    createdAt: new Date('2024-01-01'),  // фиксированная дата
    updatedAt: new Date('2024-01-01')
  },
];

export default function ProductsPage() {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Каталог товаров</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}