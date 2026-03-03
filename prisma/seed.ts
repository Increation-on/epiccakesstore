import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcrypt'

const adapter = new PrismaBetterSqlite3({
    url: 'file:./prisma/dev.db'
})

const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('🌱 Начинаем заполнение базы...')

    console.log('Создаём категории...')

    let cakes = await prisma.category.findUnique({
        where: { slug: 'cakes' }
    })

    if (!cakes) {
        cakes = await prisma.category.create({
            data: {
                name: 'Cakes',
                slug: 'cakes'
            }
        })
        console.log('✅ Создана категория: Cakes')
    } else {
        console.log('✅ Категория уже существует: Cakes')
    }

    let cupcakes = await prisma.category.findUnique({
        where: { slug: 'cupcakes' }  // Заметил? slug в нижнем регистре
    })

    if (!cupcakes) {
        cupcakes = await prisma.category.create({
            data: {
                name: 'Cupcakes',
                slug: 'cupcakes'  // всегда нижний регистр для slug
            }
        })
        console.log('✅ Создана категория: Cupcakes')
    } else {
        console.log('✅ Категория уже существует: Cupcakes')
    }

    let cookies = await prisma.category.findUnique({
        where: { slug: 'cookies' }
    })

    if (!cookies) {
        cookies = await prisma.category.create({
            data: {
                name: 'Cookies',
                slug: 'cookies'
            }
        })
        console.log('✅ Создана категория: Cookies')
    } else {
        console.log('✅ Категория уже существует: Cookies')
    }

    // 2. Создаём товары
    console.log('Создаём товары...')

    let chocoTort = await prisma.product.findUnique({
        where: { slug: 'shokoladnyy-tort' }
    })

    if (!chocoTort) {
        await prisma.product.create({
            data: {
                name: 'Шоколадный торт',
                slug: 'shokoladnyy-tort',
                description: 'Нежный шоколадный торт с кремом и ягодами',
                price: 2500,
                images: JSON.stringify(['/images/cakes/choco-1.jpg', '/images/cakes/choco-2.jpg']),
                inStock: true,
                categories: {
                    connect: [{ id: cakes.id }]
                }
            }
        })
    }

    let strawberryCupkakes = await prisma.product.findUnique({
        where: { slug: 'klubnichnye-kapkeyki' }
    })

    if(!strawberryCupkakes) {
        await prisma.product.create({
            data: {
                name: 'Клубничные капкейки',
                slug: 'klubnichnye-kapkeyki',
                description: 'Воздушные капкейки с клубничным кремом',
                price: 800,
                images: JSON.stringify(['/images/cupcakes/strawberry-1.jpg', '/images/cupcakes/strawberry-2.jpg']),
                inStock: true,
                categories: {
                    connect: [{ id: cupcakes.id }]
                }
            }
        })
    }

    let oatmealCookies = await prisma.product.findUnique({
        where: { slug: 'ovsyanoe-pechene' }
    })
    if (!oatmealCookies) {
        await prisma.product.create({
            data: {
                name: 'Овсяное печенье',
                slug: 'ovsyanoe-pechene',
                description: 'Полезное овсяное печенье с шоколадом',
                price: 350,
                images: JSON.stringify(['/images/cookies/oat-1.jpg', '/images/cookies/oat-2.jpg']),
                inStock: true,
                categories: {
                    connect: [{ id: cookies.id }]
                }
            }
        })
    }


    //создаем тестовго пользователя
    let user
    const existingUser = await prisma.user.findUnique({
        where: { email: 'test@example.com' }
    })

    if (!existingUser) {
        user = await prisma.user.create({
            data: {
                email: 'test@example.com',
                password: '$2b$10$3euPcmQFCiblsZeEu5s7p.9MUHjP4I1yW7Vq7Z8JYxLqQn5XyX2Ly',
                name: 'Test User',
                role: 'user'
            }
        })
    }

    await prisma.user.create({
  data: {
    email: 'test2@example.com',
    password: await bcrypt.hash('123456', 10),
    name: 'Test User 2',
    role: 'user'
  }
})



    console.log('✅ База данных успешно заполнена!')
    console.log('📊 Категории: Торты, Капкейки, Печенье')
    console.log('📊 Товары: 3 позиции')
    if (user) {
        console.log('✅ Создан пользователь:', user.email)
    }



}

main()
    .catch(e => {
        console.error('❌ Ошибка:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })