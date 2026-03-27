'use client'

import { OrderStatusBadge } from "@/components/features/shared/OrderStatusBadge"
import { RepeatOrderButton } from "./RepeatOrderButton"
import Image from "next/image"
import Link from "next/link"

function formatDate(date: Date) {
    return new Date(date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

function getFirstImage(imagesJson: string | null): string | null {
    if (!imagesJson) return null
    try {
        const images = JSON.parse(imagesJson)
        return Array.isArray(images) && images.length > 0 ? images[0] : null
    } catch {
        return null
    }
}

export default function OrderDetailsContent({ order }: { order: any }) {
    const itemsForRepeat = order.orderItems.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity
    }))

    return (
        <div>
            {/* Заголовок */}
            <div className="mb-6">
                <Link
                    href="/profile/orders"
                    className="text-(--pink) hover:underline inline-block mb-2"
                >
                    ← Все заказы
                </Link>
                <h1 className="text-2xl font-bold text-(--text)">
                    Заказ №{order.id.slice(-8)}
                </h1>
                <p className="text-(--text-muted)">
                    от {formatDate(order.createdAt)}
                </p>
            </div>

            {/* Сетка */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Левая колонка */}
                <div className="md:col-span-2 space-y-6">
                    {/* Товары */}
                    <div className="border border-(--border) rounded-lg p-4 bg-white">
                        <h2 className="font-semibold text-lg text-(--text) mb-4">Состав заказа</h2>
                        <div className="space-y-4">
                            {order.orderItems.map((item: any) => (
                                <div key={item.id} className="flex gap-4 pb-4 border-b border-(--border) last:border-0">
                                    <div className="w-20 h-20 relative shrink-0">
                                        {item.product?.images ? (
                                            <Image
                                                src={getFirstImage(item.product.images) || '/placeholder.jpg'}
                                                alt={item.product.name}
                                                fill
                                                className="object-cover rounded"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-(--mint) rounded flex items-center justify-center">
                                                <span className="text-2xl">🍰</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <Link
                                            href={`/products/${item.product?.id}`}
                                            className="font-medium text-(--text) hover:text-(--pink)"
                                        >
                                            {item.product?.name || 'Товар'}
                                        </Link>
                                        <p className="text-sm text-(--text-muted) mt-1">
                                            {item.quantity} × {item.productPrice} ₽
                                        </p>
                                    </div>

                                    <div className="text-right font-medium text-(--pink)">
                                        {item.quantity * item.productPrice} ₽
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <RepeatOrderButton items={itemsForRepeat} />
                </div>

                {/* Правая колонка */}
                <div className="space-y-4">
                    <div className="border border-(--border) rounded-lg p-4 bg-white">
                        <h3 className="font-semibold text-(--text) mb-2">Статус</h3>
                        <OrderStatusBadge status={order.status} />
                    </div>

                    <div className="border border-(--border) rounded-lg p-4 bg-white">
                        <h3 className="font-semibold text-(--text) mb-2">Доставка</h3>
                        <div className="space-y-2 text-sm text-(--text-muted)">
                            <p><span className="text-(--text)">Получатель:</span><br />{order.fullName}</p>
                            <p><span className="text-(--text)">Адрес:</span><br />{order.address}</p>
                            <p><span className="text-(--text)">Телефон:</span><br />{order.phone}</p>
                            <p><span className="text-(--text)">Email:</span><br />{order.email}</p>
                        </div>
                    </div>

                    <div className="border border-(--border) rounded-lg p-4 bg-white">
                        <h3 className="font-semibold text-(--text) mb-2">Оплата</h3>
                        <p className="text-sm text-(--text-muted)">
                            {order.paymentMethod === 'card' ? '💳 Картой онлайн' : '💵 Наличными при получении'}
                        </p>
                    </div>

                    <div className="border border-(--border) rounded-lg p-4 bg-(--bg)">
                        <div className="flex justify-between items-center font-bold">
                            <span className="text-(--text)">Итого:</span>
                            <span className="text-xl text-(--pink)">{order.total} ₽</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}