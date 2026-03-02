import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
    url: 'file:./prisma/dev.db'
})

const prisma = new PrismaClient({adapter})

async function main() {
    console.log('🌱 Начинаем заполнение базы...')

    //создаем тестовго пользователя
    const user  = await prisma.user.create({
        data: {
            email: 'test@example.com',
            password: '$2b$10$3euPcmQFCiblsZeEu5s7p.9MUHjP4I1yW7Vq7Z8JYxLqQn5XyX2Ly',
            name: 'Test User',
            role: 'user'
        }
    })

    console.log('✅ Создан пользователь:', user.email)
}

main()
    .catch(e=>{
        console.error('❌ Ошибка:', e)
        process.exit(1)
})
    .finally(async ()=> {
        await prisma.$disconnect()
    })