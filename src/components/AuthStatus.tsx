'use client'

import { useSession, signIn, signOut } from "next-auth/react"

export const AuthStatus = () => {
    const { data: session, status } = useSession()

    console.log('Auth Status:', status)
    console.log('Session:', session)

    if (status === 'loading') {
        return <div className="p-4 text gray-500">Loading...</div>
    }

    if (session) {
        return (
            <div className="p-4 flex items-center gap-4 bg-gray-100">
                <span className="text-sm text-gray-950">
                    {session.user?.name || session.user?.email}
                    {session.user?.role === 'admin' && '👑'}
                </span>
                <button
                    onClick={() => signOut()}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Exit
                </button>
            </div>
        )
    }

    return (
        <div className="p-4">
            <button
                onClick={() => signIn()}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Login
            </button>
        </div>
    )
}