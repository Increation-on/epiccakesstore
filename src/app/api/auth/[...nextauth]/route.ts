

import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { User as NextAuthUser, NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"


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
                    role: user.role,
                    createdAt: user.createdAt
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
        async jwt({ token, user, account }) {
            if (user) {
                token.role = user.role
                token.id = user.id

                // Всегда получаем createdAt из БД
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id },
                    select: { createdAt: true }
                })
                token.createdAt = dbUser?.createdAt
            }
            return token
        },

        async session({ session, token }) {
            if (session?.user) {
                session.user.role = token.role as 'user' | 'admin' | 'guest'
                session.user.id = token.id as string
                session.user.createdAt = token.createdAt as Date
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