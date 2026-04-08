'use client'

export const FullscreenLoader = () => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-(--pink) border-t-transparent mx-auto mb-4" />
      <p className="text-(--text)">Перенаправление на страницу заказа...</p>
    </div>
  </div>
)

export default FullscreenLoader