import Link from "next/link";

// src/components/layout/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* О нас */}
          <div>
            <h3 className="font-semibold mb-3">EpicCakes</h3>
            <p className="text-sm text-gray-600">
              Вкуснейшие торты с доставкой. Только натуральные ингредиенты.
            </p>
          </div>

          {/* Ссылки */}
          <div>
            <h3 className="font-semibold mb-3">Информация</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-gray-600 hover:text-amber-600">О нас</Link></li>
              <li><Link href="/contacts" className="text-gray-600 hover:text-amber-600">Контакты</Link></li>
              <li><Link href="/delivery" className="text-gray-600 hover:text-amber-600">Доставка</Link></li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h3 className="font-semibold mb-3">Мы на связи</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>📞 +375 (29) 123-45-67</li>
              <li>✉️ hello@epiccakes.by</li>
              <li>📍 Минск, ул. Тортовая, 1</li>
            </ul>
          </div>
        </div>

        {/* Копирайт */}
        <div className="border-t mt-8 pt-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} EpicCakes. Все права защищены.
        </div>
      </div>
    </footer>
  );
}