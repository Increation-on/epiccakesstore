// types/api/admin.types.ts
import { Product} from '@/types/domain/product.types'

export type AdminProductsResponse = Product[]

export type CreateProductRequest = {
  name: string
  description: string
  price: number
  images: string | string[]
  inStock: boolean
  categoryIds: string[]  // для связи многие-ко-многим
}