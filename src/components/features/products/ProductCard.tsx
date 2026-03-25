'use client'

import { Product } from "@/types/domain/product.types";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { useCartStore } from "@/store/cart.store";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type ProductCardProps = {
  product: Product;
};

export const ProductCard = ({ product }: ProductCardProps) => {
  const router = useRouter();
  const addItem = useCartStore(state => state.addItem);
  const [imgError, setImgError] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product.id, 1);
  };

  const handleCardClick = () => {
    router.push(`/products/${product.id}`);
  };

  const isBlobUrl = product.images?.[0]?.startsWith('https://');

  const hasValidImage = product.images?.[0] &&
    typeof product.images[0] === 'string' &&
    (product.images[0].startsWith('/') || product.images[0].startsWith('https://')) &&
    !imgError;

  return (
    <Card className="group p-4 hover:shadow-lg transition">
      {/* Блок с изображением — кликабельный */}
      <div
        className="bg-(--mint) h-48 mb-4 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer relative"
        onClick={handleCardClick}
      >
        {hasValidImage ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition group-hover:scale-105"
            onError={() => setImgError(true)}
            loading="lazy"
            unoptimized={isBlobUrl}
          />
        ) : (
          <div className="text-4xl text-(--text-muted)">🍰</div>
        )}
      </div>

      {/* Название — кликабельное */}
      <h2
        className="text-xl font-semibold text-(--text) font-serif line-clamp-1 cursor-pointer hover:text-(--pink) transition"
        onClick={handleCardClick}
      >
        {product.name}
      </h2>

      {/* Описание */}
      <p className="text-(--text-muted) mt-2 text-sm line-clamp-2">
        {product.description}
      </p>

      {/* Цена */}
      <p className="text-2xl font-bold mt-4 text-(--pink)">
        {product.price} ₽
      </p>

      {/* Кнопка */}
      <Button
        size="md"
        className="mt-4 w-full"
        onClick={handleAddToCart}
      >
        В корзину
      </Button>
    </Card>
  );
};

export default ProductCard;