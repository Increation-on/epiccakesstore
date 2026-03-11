// src/app/api/webhooks/stripe/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET! // добавим потом
    )
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object
    const orderId = paymentIntent.metadata.orderId

    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID' }
      })

      // Очищаем корзину
      const order = await prisma.order.findUnique({
        where: { id: orderId }
      })
      if (order?.userId) {
        await prisma.cart.deleteMany({
          where: { userId: order.userId }
        })
      }
    }
  }

  return NextResponse.json({ received: true })
}