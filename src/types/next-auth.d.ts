import { User as AppUser } from './domain/user.types'

declare module 'next-auth' {
  interface Session {
    user: {
      role: AppUser['role']  // используем твой тип роли
    } & DefaultSession['user']
  }

  interface User {
    role: AppUser['role']  // 'admin' | 'user' | 'guest'
  }
}