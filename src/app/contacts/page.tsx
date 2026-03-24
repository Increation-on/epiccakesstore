// src/app/contacts/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Контакты | EpicCakesStore',
  description: 'Свяжитесь с нами. Телефон, адрес, время работы.',
  openGraph: {
    title: 'Контакты | EpicCakesStore',
    description: 'Свяжитесь с нами, чтобы заказать торт или задать вопрос.',
    images: [{ url: '/logo.jpeg', width: 800, height: 800, alt: 'EpicCakesStore' }],
    type: 'website',
  },
}

export default function ContactsPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-(--text) mb-6 font-serif">
        Контакты
      </h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4 font-serif">Свяжитесь с нами</h2>
          <div className="space-y-3 text-(--text-muted)">
            <p>📞 +375 (29) 123-45-67</p>
            <p>✉️ hello@epiccakes.by</p>
            <p>📍 г. Минск, ул. Тортовая, 1</p>
            <p>⏰ Пн-Вс: 9:00 – 20:00</p>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4 font-serif">Мы в соцсетях</h2>
          <div className="space-y-2">
            <p>📷 Instagram: @epiccakes</p>
            <p>📘 Telegram: t.me/epiccakes</p>
            <p>📱 Viber: +375291234567</p>
          </div>
        </div>
      </div>
    </main>
  );
}