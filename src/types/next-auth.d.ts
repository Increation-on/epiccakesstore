import { User as AppUser } from './domain/user.types'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string              // добавляем id
      role: AppUser['role']   // используем твой тип роли
    } & DefaultSession['user']
  }

  interface User {
    id: string                // добавляем id
    role: AppUser['role']     // 'admin' | 'user' | 'guest'
  }
}