// src/components/layout/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 border-t border-gray-800 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div>
            <h3 className="font-semibold mb-3 text-gray-200">EpicCakesStore</h3>
            <p className="text-sm text-gray-400">
              Вкуснейшие торты с доставкой. Только натуральные ингредиенты.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-gray-200">Информация</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-gray-400 hover:text-(--pink)">О нас</Link></li>
              <li><Link href="/contacts" className="text-gray-400 hover:text-(--pink)">Контакты</Link></li>
              <li><Link href="/delivery" className="text-gray-400 hover:text-(--pink)">Доставка</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-gray-200">Мы на связи</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📞 +375 (29) 123-45-67</li>
              <li>✉️ hello@epiccakes.by</li>
              <li>📍 Минск, ул. Тортовая, 1</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-4 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} EpicCakesStore. Все права защищены.
        </div>
      </div>
    </footer>
  )
}