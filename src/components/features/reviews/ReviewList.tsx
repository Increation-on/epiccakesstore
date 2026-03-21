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
      <div className="text-(--text-muted) text-center py-8 bg-(--bg) rounded-lg">
        Пока нет отзывов. Будьте первым!
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-(--text) font-serif">
        Отзывы ({reviews.length})
      </h2>
      
      {reviews.map((review) => (
        <div key={review.id} className="border border-(--border) rounded-lg p-5 bg-white">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="font-semibold text-(--text)">
                {review.user.name || 'Пользователь'}
              </span>
              <span className="text-(--text-muted) text-sm ml-2">
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
          <p className="text-(--text-muted) leading-relaxed">
            {review.text}
          </p>
        </div>
      ))}
    </div>
  )
}