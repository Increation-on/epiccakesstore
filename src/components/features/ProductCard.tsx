// src/components/features/ProductCard.tsx
import { Product } from "@/types/domain/product.types";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useCartStore } from "@/store/cart.store"; 
import { useState } from "react";

type ProductCardProps = {
  product: Product;
};

export const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCartStore(state => state.addItem);
  const [imgError, setImgError] = useState(false);

  const handleAddToCart = () => {
    addItem(product.id, 1);
  };

  // Проверяем, есть ли валидное изображение
  const hasValidImage = product.images?.[0] && 
    typeof product.images[0] === 'string' && 
    product.images[0].startsWith('/') && 
    !imgError;

  return (
    <Card className="p-4">
      <div className="bg-gray-200 h-48 mb-4 rounded flex items-center justify-center text-gray-500">
        {hasValidImage ? (
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="object-cover w-full h-full"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="text-gray-400">
            Нет фото
          </div>
        )}
      </div>
      <h2 className="text-xl font-semibold text-gray-500">{product.name}</h2>
      <p className="text-gray-600 mt-2 line-clamp-2">{product.description}</p>
      <p className="text-lg font-bold mt-4 text-amber-400">{product.price} ₽</p>
      <Button 
        size="md" 
        className="mt-4 w-full"
        onClick={handleAddToCart}
      >
        Add to cart
      </Button>
    </Card>
  );
};

export default ProductCard;