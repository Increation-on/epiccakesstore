import { WithId } from "../core"

export type Order = {
  id: WithId
  status: string
  total: number
  createdAt: string
  fullName: string      // данные покупателя
  email: string
  phone: string
  address: string
  paymentMethod: string
  user: {
    name: string | null
    email: string
  } | null
  orderItems: Array<{
    quantity: number
    productPrice: number  // цена на момент заказа
    productName: string   // название на момент заказа
    product: {
      id: WithId
      name: string
      price: number
      images: string
    } | null
  }>
}