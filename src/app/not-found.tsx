import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-(--pink) mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-(--text) mb-2">Страница не найдена</h2>
      <p className="text-(--text-muted) mb-8">
        Сладость, которую вы ищете, возможно, уже съели 😋
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-(--pink) text-white rounded-lg hover:opacity-90 transition"
      >
        На главную
      </Link>
    </div>
  )
}