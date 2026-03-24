// src/components/features/skeleton/ProfileSkeleton.tsx
const ProfileSkeleton = () => {
  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 animate-pulse">
      {/* Заголовок */}
      <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
      
      {/* Карточка профиля */}
      <div className="bg-white rounded-lg border border-(--border) p-6 shadow-sm">
        {/* Аватар + имя */}
        <div className="flex items-center gap-4 pb-4 border-b border-(--border)">
          <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
        
        {/* Поля профиля */}
        <div className="space-y-3 mt-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between py-2 border-b border-(--border)">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Кнопка заказов */}
      <div className="mt-8">
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>
      
      {/* Текст-подпись */}
      <div className="mt-6 text-center">
        <div className="h-3 bg-gray-200 rounded w-48 mx-auto"></div>
      </div>
    </div>
  )
}

export default ProfileSkeleton