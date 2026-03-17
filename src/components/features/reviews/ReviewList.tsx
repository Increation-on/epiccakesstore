import { prisma } from '@/lib/prisma'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

interface Props {
  productId: string
}

async function getReviews(productId: string) {
  const reviews = await prisma.review.findMany({
    where: {
      productId,
      status: 'approved',
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  return reviews
}

export async function ReviewList({ productId }: Props) {
  const reviews = await getReviews(productId)

  if (reviews.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        Пока нет отзывов. Будьте первым!
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Отзывы ({reviews.length})</h2>
      
      {reviews.map((review) => (
        <div key={review.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="font-semibold">
                {review.user.name || 'Пользователь'}
              </span>
              <span className="text-gray-500 text-sm ml-2">
                {formatDistanceToNow(new Date(review.createdAt), {
                  addSuffix: true,
                  locale: ru,
                })}
              </span>
            </div>
            <div className="flex text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star}>
                  {star <= review.rating ? '★' : '☆'}
                </span>
              ))}
            </div>
          </div>
          <p className="text-gray-700">{review.text}</p>
        </div>
      ))}
    </div>
  )
}