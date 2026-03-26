import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Доставка и оплата | EpicCakesStore',
  description: 'Условия доставки и способы оплаты тортов EpicCakesStore. Бесплатная доставка при заказе от 2000 рублей.',
}

export default function DeliveryPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-(--text) mb-6 font-serif">
        Доставка и оплата
      </h1>

      <div className="space-y-8">
        {/* Доставка */}
        <section className="bg-white rounded-lg border border-(--border) p-6">
          <h2 className="text-2xl font-semibold text-(--text) mb-4">🚚 Доставка</h2>
          <div className="space-y-4 text-(--text-muted)">
            <p>
              Мы доставляем заказы по Минску и всей Беларуси. 
              Доставка осуществляется курьерской службой в удобное для вас время.
            </p>
            <div>
              <h3 className="font-semibold text-(--text) mb-2">Стоимость доставки:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>По Минску — <span className="font-medium">10 BYN</span></li>
                <li>По Беларуси — <span className="font-medium">15 BYN</span></li>
                <li>Бесплатно при заказе от <span className="font-medium">200 BYN</span></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-(--text) mb-2">Время доставки:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Минимальное время — 3 часа</li>
                <li>Доставка в день заказа возможна до 18:00</li>
                <li>Заказы на завтра принимаются до 20:00</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Оплата */}
        <section className="bg-white rounded-lg border border-(--border) p-6">
          <h2 className="text-2xl font-semibold text-(--text) mb-4">💳 Оплата</h2>
          <div className="space-y-4 text-(--text-muted)">
            <div>
              <h3 className="font-semibold text-(--text) mb-2">Способы оплаты:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Картой онлайн на сайте (Visa, MasterCard, Белкарт)</li>
                <li>Наличными курьеру при получении</li>
                <li>Картой курьеру при получении (терминал)</li>
              </ul>
            </div>
            <p>
              Онлайн-оплата проходит через защищенный платежный шлюз Stripe. 
              Мы не храним данные ваших карт.
            </p>
          </div>
        </section>

        {/* Возврат */}
        <section className="bg-white rounded-lg border border-(--border) p-6">
          <h2 className="text-2xl font-semibold text-(--text) mb-4">🔄 Возврат</h2>
          <div className="space-y-4 text-(--text-muted)">
            <p>
              Если вам не понравился вкус или качество торта — свяжитесь с нами в течение 2 часов после получения.
              Мы обязательно найдем решение.
            </p>
            <p>
              Возврат средств осуществляется на карту в течение 5-10 рабочих дней.
            </p>
          </div>
        </section>

        {/* Контакты для связи */}
        <section className="bg-(--mint) rounded-lg p-6 text-center">
          <h2 className="text-2xl font-semibold text-(--text) mb-2">Остались вопросы?</h2>
          <p className="text-(--text-muted) mb-4">
            Свяжитесь с нами — мы с радостью поможем!
          </p>
          <div className="space-y-2">
            <p className="text-(--text)">📞 +375 (29) 123-45-67</p>
            <p className="text-(--text)">✉️ delivery@epiccakes.by</p>
          </div>
        </section>
      </div>

      {/* Кнопка назад */}
      <div className="mt-8 text-center">
        <Link 
          href="/" 
          className="text-(--pink) hover:underline"
        >
          ← Вернуться на главную
        </Link>
      </div>
    </div>
  )
}