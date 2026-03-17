// app/profile/orders/[id]/page.tsx
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { OrderStatusBadge } from "@/components/features/shared/OrderStatusBadge"
import { RepeatOrderButton } from "./RepeatOrderButton"

// Функция для форматирования даты
function formatDate(date: Date) {
    return new Date(date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

export default async function ProfileOrderPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const session = await getServerSession(authOptions)

    // Получаем заказ с товарами
    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            orderItems: {
                include: {
                    product: true
                }
            }
        }
    })

    // Проверяем, что заказ существует
    if (!order) {
        notFound()
    }

    // Проверяем что это заказ текущего пользователя
    if (order.userId !== session?.user?.id) {
        redirect('/profile/orders')
    }

    // Группируем товары для повторного заказа
    const itemsForRepeat = order.orderItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
    }))

    function getFirstImage(imagesJson: string | null): string | null {
        if (!imagesJson) return null
        try {
            const images = JSON.parse(imagesJson)
            return Array.isArray(images) && images.length > 0 ? images[0] : null
        } catch {
            return null
        }
    }

    return (
        <div>
            {/* Заголовок с навигацией назад */}
            <div className="mb-6">
                <Link
                    href="/profile/orders"
                    className="text-blue-600 hover:underline inline-block mb-2"
                >
                    ← Все заказы
                </Link>
                <h1 className="text-2xl font-bold">
                    Заказ №{order.id.slice(-8)}
                </h1>
                <p className="text-gray-600">
                    от {formatDate(order.createdAt)}
                </p>
            </div>

            {/* Сетка: основное + боковая панель */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Левая колонка - состав заказа */}
                <div className="md:col-span-2 space-y-6">
                    {/* Товары в заказе */}
                    <div className="border rounded-lg p-4">
                        <h2 className="font-semibold text-lg mb-4">Состав заказа</h2>
                        <div className="space-y-4">
                            {order.orderItems.map((item) => (
                                <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                                    {/* Картинка товара */}
                                    {item.product?.images && (
                                        <div className="w-20 h-20 relative shrink-0">
                                            <Image
                                                src={getFirstImage(item.product.images) || '/placeholder.jpg'}
                                                alt={item.product.name}
                                                fill
                                                className="object-cover rounded"
                                            />
                                        </div>
                                    )}

                                    {/* Информация о товаре */}
                                    <div className="flex-1">
                                        <Link
                                            href={`/catalog/${item.product?.id}`}
                                            className="font-medium hover:text-blue-600"
                                        >
                                            {item.product?.name || 'Товар'}
                                        </Link>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {item.quantity} × {item.productPrice} ₽ {/* 👈 ИСПРАВЛЕНО: productPrice вместо price */}
                                        </p>
                                    </div>

                                    {/* Сумма за этот товар */}
                                    <div className="text-right font-medium">
                                        {item.quantity * item.productPrice} ₽ {/* 👈 ИСПРАВЛЕНО: productPrice вместо price */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Кнопка "Повторить заказ" */}
                    <RepeatOrderButton items={itemsForRepeat} />
                </div>

                {/* Правая колонка - информация о заказе */}
                <div className="space-y-4">
                    {/* Статус заказа */}
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Статус</h3>
                        <OrderStatusBadge status={order.status} />
                    </div>

                    {/* Данные доставки */}
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Доставка</h3>
                        <div className="space-y-2 text-sm">
                            <p>
                                <span className="text-gray-600">Получатель:</span><br />
                                {order.fullName}
                            </p>
                            <p>
                                <span className="text-gray-600">Адрес:</span><br />
                                {order.address}
                            </p>
                            <p>
                                <span className="text-gray-600">Телефон:</span><br />
                                {order.phone}
                            </p>
                            <p>
                                <span className="text-gray-600">Email:</span><br />
                                {order.email}
                            </p>
                        </div>
                    </div>

                    {/* Способ оплаты */}
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Оплата</h3>
                        <p className="text-sm">
                            {order.paymentMethod === 'card'
                                ? '💳 Картой онлайн'
                                : '💵 Наличными при получении'}
                        </p>
                    </div>

                    {/* Итого */}
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-center font-bold">
                            <span>Итого:</span>
                            <span className="text-xl">{order.total} ₽</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}