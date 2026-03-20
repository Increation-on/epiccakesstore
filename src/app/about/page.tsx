// src/app/about/page.tsx
export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-(--text) mb-6 font-serif">
        О нас
      </h1>
      <div className="prose max-w-none">
        <p className="text-lg text-(--text-muted) mb-4">
          EpicCakesStore — это кондитерская, где каждый торт создаётся с любовью и вниманием к деталям.
        </p>
        <p className="text-lg text-(--text-muted) mb-4">
          Мы используем только натуральные ингредиенты и свежие продукты. 
          Каждый наш торт — это маленькое произведение искусства, которое делает ваш праздник особенным.
        </p>
        <p className="text-lg text-(--text-muted)">
          Доставляем торты по Минску и области. Индивидуальный подход к каждому заказу.
        </p>
      </div>
    </main>
  );
}