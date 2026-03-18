console.log('🔥 [auth] Starting auth route initialization')
console.log('🔥 [auth] Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  HAS_DATABASE_URL: !!process.env.DATABASE_URL,
  HAS_GOOGLE_ID: !!process.env.GOOGLE_CLIENT_ID,
  HAS_GOOGLE_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
  HAS_NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET
})

import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { User as NextAuthUser, NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

console.log('🔥 [auth] Prisma imported:', !!prisma)
console.log('🔥 [auth] GOOGLE_CLIENT_ID from process.env:', process.env.GOOGLE_CLIENT_ID ? '✅ exists' : '❌ missing')
console.log('🔥 [auth] GOOGLE_CLIENT_SECRET from process.env:', process.env.GOOGLE_CLIENT_SECRET ? '✅ exists' : '❌ missing')

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                })

                if (!user) {
                    return null
                }
                if (!user.password) {
                    return null
                }
                const isValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                )

                if (!isValid) {
                    return null
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                } as NextAuthUser
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        })
    ],
    session: {
        strategy: 'jwt'
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.id = user.id
            }
            return token
        },

        async session({ session, token }) {
            if (session?.user) {
                session.user.role = token.role as 'user' | 'admin' | 'guest'
                session.user.id = token.id as string
            }
            return session
        },

        async redirect({ url, baseUrl }) {
            return baseUrl
        }
    }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }