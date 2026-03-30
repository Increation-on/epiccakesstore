interface ProductStockStatusProps {
  stock: number;
}

export const ProductStockStatus = ({ stock }: ProductStockStatusProps) => {
  if (stock === 0) {
    return (
      <span className="inline-block px-2 py-1 bg-red-50 text-red-600 rounded-md text-sm font-medium">
        Нет в наличии
      </span>
    );
  }
  
  if (stock <= 5) {
    return (
      <span className="inline-block px-2 py-1 bg-orange-50 text-orange-600 rounded-md text-sm font-medium">
        Осталось всего {stock} шт!
      </span>
    );
  }
  
  return (
    <span className="inline-block px-2 py-1 bg-green-50 text-green-600 rounded-md text-sm font-medium">
      В наличии
    </span>
  );
};