// src/components/features/home/Advantages.tsx
const advantages = [
  { icon: "🎂", title: "Натуральные ингредиенты", desc: "Только свежие продукты" },
  { icon: "🚚", title: "Бесплатная доставка", desc: "При заказе от 50 BYN" },
  { icon: "❤️", title: "Любовь в каждой детали", desc: "Ручная работа" },
];

export default function Advantages() {
  return (
    <section className="py-12 bg-(--bg)">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {advantages.map((item, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-(--text-muted)">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}