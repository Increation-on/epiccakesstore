// app/products/page.tsx
const mockProducts = [
  {
    id: 1,
    name: 'Торт "Наполеон"',
    price: 1200,
    description: 'Классический слоёный торт с заварным кремом',
    image: '/images/cake-1.jpg' // потом добавим картинки
  },
  {
    id: 2,
    name: 'Капкейки ванильные',
    price: 350,
    description: 'Набор из 4 штук с крем-чизом',
    image: '/images/cupcakes-1.jpg'
  },
  {
    id: 3,
    name: 'Чизкейк нью-йорк',
    price: 900,
    description: 'Нежный сливочный чизкейк на песочной основе',
    image: '/images/cheesecake-1.jpg'
  }
];

export default function ProductsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Каталог товаров</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProducts.map((product) => (
          <div key={product.id} className="border rounded-lg p-4 shadow-sm">
            <div className="bg-gray-200 h-48 mb-4 rounded flex items-center justify-center text-gray-500">
              [Фото: {product.name}]
            </div>
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p className="text-gray-600 mt-2">{product.description}</p>
            <p className="text-lg font-bold mt-4">{product.price} ₽</p>
            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              В корзину
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}