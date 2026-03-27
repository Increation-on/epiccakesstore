import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Metadata } from "next"
import OrderDetailsContent from "./OrderDetailsContent"

export async function generateMetadata({
    params
}: {
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const { id } = await params
    return {
        title: `Заказ №${id.slice(-8)} | EpicCakes`,
        description: 'Детали вашего заказа в EpicCakesStore',
    }
}

export default async function ProfileOrderPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const session = await getServerSession(authOptions)

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

    if (!order) {
        notFound()
    }

    if (order.userId !== session?.user?.id) {
        redirect('/profile/orders')
    }

    return <OrderDetailsContent order={order} />
}