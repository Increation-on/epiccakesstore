import { User as AppUser } from './domain/user.types'
import { DefaultSession } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: AppUser['role']
      createdAt?: Date           // 👈 добавляем
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: AppUser['role']
    createdAt?: Date             // 👈 добавляем
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: AppUser['role']
    createdAt?: Date             // 👈 добавляем
  }
}