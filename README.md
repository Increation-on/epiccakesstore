# 🎂 EpicCakesStore

My first **production‑ready** Next.js e‑commerce project. What started as a simple catalog turned into a full‑stack platform with cart sync, Stripe payments, admin panel, and **115 tests**.

🔗 Links

Live: https://epiccakesstore.vercel.app/ | GitHub: https://github.com/Increation-on/epiccakesstore

## ✨ Features

**Users:** Catalog (pagination, search, filters) | Product page (gallery, swipe, reviews) | Cart (guest localStorage + server sync) | Checkout (multi‑step, Zod) | Stripe & Cash payments | Order history & repeat order | Reviews & ratings | Currency switcher (4 currencies)

**Admins:** Product CRUD (create, edit, archive, restore, delete) | Category CRUD | Order management | Review moderation | Stock management (low stock warnings)

**Tech:** SEO (dynamic OG, sitemap, robots.txt) | Lighthouse: 100/90 | Image optimization (WebP, Vercel Blob) | **115 tests** (83 unit/component + 21 integration + 11 e2e)

## 🛠️ Tech Stack

Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS, Zustand | Backend: Next.js API routes, Prisma 7, PostgreSQL (Neon) | Auth: NextAuth.js (Google + Credentials) | Payments: Stripe + Cash | Storage: Vercel Blob | Testing: Vitest, Playwright | Deployment: Vercel

## 🧪 Test Coverage

Unit + Component: 83 ✅ | Integration: 21 ✅ | E2E: 11 ✅ | **Total: 115 ✅**

npm run test:unit        # Unit + Component
npm run test:integration # Integration (requires Docker)
npm run test:e2e         # E2E (sequential)

🚀 Quick Start

git clone https://github.com/Increation-on/epiccakesstore.git
cd epiccakesstore
npm install
npx prisma generate
npx prisma migrate dev
npm run dev

Required env vars: DATABASE_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, BLOB_READ_WRITE_TOKEN

📊 Lighthouse

Desktop: Performance 100, Accessibility 96, Best Practices 100, SEO 100 | Mobile: Performance 89-90, Accessibility 96, Best Practices 100, SEO 100

🧠 What I Learned

Next.js 15 App Router (async params, server components) | Prisma 7 + Neon PostgreSQL (transactions, migrations) | Zustand persist + Next.js SSR (cart sync battle) | Stripe integration with webhooks (Stripe CLI in restricted regions) | Integration tests with isolated database (Docker + Vitest) | E2E testing with Playwright (sequential workers) | Image optimization (WebP, Vercel Blob) | 31 days, ~135 bugs fixed

🛣️ Roadmap

Email notifications | Wishlist | Discount coupons | Export orders to CSV

📝 License

MIT ©  [@Increation-on](https://github.com/Increation-on)

👤 Author

Maksim Dudarev | GitHub: [@Increation-on](https://github.com/Increation-on)
