'use client'

import { Product } from "@/types/domain/product.types";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { useCartStore } from "@/store/cart.store";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "@/lib/toast";
import { Price } from "@/components/ui/Price";

type ProductCardProps = {
  product: Product;
};

export const ProductCard = ({ product }: ProductCardProps) => {
  const router = useRouter();
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const addItem = useCartStore(state => state.addItem);
  const getItemQuantity = useCartStore(state => state.getItemQuantity);
  const items = useCartStore(state => state.items);
  const [imgError, setImgError] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isInStock, setIsInStock] = useState(product.inStock);
  const [isAdding, setIsAdding] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);

  // Проверяем актуальный stock после монтирования
  useEffect(() => {
    const checkStock = async () => {
      try {
        const res = await fetch('/api/products/by-ids', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: [product.id] })
        });
        const data = await res.json();
        if (data && data[0]) {
          setIsInStock(data[0].stock > 0);
        }
      } catch (error) {
        console.error('Ошибка проверки stock:', error);
      }
    };
    
    checkStock();
  }, [product.id]);

  // Следим за количеством в корзине
  useEffect(() => {
    const quantity = getItemQuantity(product.id);
    setCartQuantity(quantity);
  }, [items, product.id, getItemQuantity]);

  const canAddMore = isInStock && cartQuantity < product.stock;
  const remaining = product.stock - cartQuantity;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canAddMore || isAdding) return;
    
    setIsAdding(true);
    try {
      await addItem(String(product.id), 1);
      toast.success(`${product.name} добавлен в корзину`);
    } catch (error) {
      console.error('Ошибка добавления:', error);
      toast.error('Ошибка при добавлении в корзину');
    } finally {
      setIsAdding(false);
    }
  };

  const handleCardClick = () => {
    setIsNavigating(true);
    router.push(`/products/${product.id}`);
  };

  const imageUrl = useMemo(() => {
    if (!product.images) return null;
    try {
      const parsed = typeof product.images === 'string' 
        ? JSON.parse(product.images) 
        : product.images;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
    } catch {
      return null;
    }
  }, [product.images]);

  const isBlobUrl = imageUrl?.startsWith('https://');
  const hasValidImage = imageUrl && 
    (imageUrl.startsWith('/') || imageUrl.startsWith('https://')) &&
    !imgError;

  // Компонент кнопки для неавторизованных
  const LoginToBuyButton = () => (
    <Link href="/login" className="block w-full">
      <Button
        size="md"
        className="mt-4 w-full"
        variant="outline"
      >
        Войдите, чтобы купить
      </Button>
    </Link>
  );

  // Текст кнопки в зависимости от состояния
  const getButtonText = () => {
    if (isAdding) return 'Добавляем...';
    if (!canAddMore && cartQuantity >= product.stock) return 'Товар закончился';
    if (!isInStock) return 'Нет в наличии';
    return 'В корзину';
  };

  return (
    <Card className="group p-4 border-none rounded-[20px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.1)]! transition-all duration-250 relative">
      {isNavigating && (
        <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent" />
        </div>
      )}

      <div
        className="bg-(--mint) mb-4 rounded-lg overflow-hidden cursor-pointer relative aspect-square"
        onClick={handleCardClick}
      >
        {hasValidImage ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition group-hover:scale-105"
            onError={() => setImgError(true)}
            loading="lazy"
            unoptimized={isBlobUrl}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-(--text-muted)">
            🍰
          </div>
        )}
        
        {!isInStock && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium z-10">
            Нет в наличии
          </div>
        )}
        
        {isInStock && remaining > 0 && remaining <= 3 && (
          <div className="absolute bottom-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-medium z-10">
            Осталось {remaining} шт.
          </div>
        )}
      </div>

      <h2
        className="text-xl font-semibold text-(--text) font-serif line-clamp-1 cursor-pointer hover:text-(--pink) transition"
        onClick={handleCardClick}
      >
        {product.name}
      </h2>

      <p className="text-(--text-muted) mt-2 text-sm line-clamp-2">
        {product.description}
      </p>

      <p className="text-2xl font-bold mt-4 text-(--pink)">
        <Price price={product.price} />
      </p>

      {isAuthenticated && (
        <Button
          size="md"
          className="mt-4 w-full text-white"
          onClick={handleAddToCart}
          disabled={!canAddMore || isAdding}
        >
          {getButtonText()}
        </Button>
      )}
    </Card>
  );
};

export default ProductCard;