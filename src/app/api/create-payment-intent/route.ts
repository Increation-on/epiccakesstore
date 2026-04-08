import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover'
})

// Курс конвертации BYN → CZK (обновляйте при необходимости)
const BYN_TO_CZK_RATE = 7.2 // 1 BYN ≈ 7.2 CZK

export async function POST(req: Request) {
  try {
    const { amount } = await req.json() // сумма в BYN
    
    // Конвертируем в CZK
    const amountInCZK = amount * BYN_TO_CZK_RATE
    
    // Проверяем минимальную сумму для Stripe (15 CZK)
    if (amountInCZK < 15) {
      return NextResponse.json(
        { error: `Минимальная сумма заказа: ${Math.ceil(15 / BYN_TO_CZK_RATE)} BYN` },
        { status: 400 }
      )
    }
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amountInCZK * 100), // Stripe работает в халержах (сотых долях CZK)
      currency: 'czk', // ← валюта Stripe аккаунта
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error('Stripe error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}