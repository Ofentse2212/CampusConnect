import React, { createContext, useContext, useEffect, useState } from 'react'

type User = {
    id: string
    name: string
    email?: string
    student_number?: string
    staff_number?: string
    role: 'admin' | 'student' | 'guest' | 'staff' | null
}

const AuthContext = createContext({
  user: null as User | null,
  setUser: (_user: User) => {},
  token: null as string | null,
  setToken: (_token: string | null) => {},
  loading: true as boolean,
  signIn: (_args: { role: 'student' | 'guest' | 'admin' | 'staff', identifier: string, password: string }) => Promise.resolve(),
  signUp: (_args: { role: 'student' | 'guest' | 'admin' | 'staff', name: string, identifier: string, password: string, email?: string }) => Promise.resolve(),
  signOut: () => Promise.resolve(),
})

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
        ;(async () => {
            try {
                const res = await fetch(`${backend}/auth/me`, { credentials: 'include' })
                const data = await res.json()
                if (res.ok && data.user) setUser(data.user)
            } catch {}
            finally { setLoading(false) }
        })()
    }, [])

    const signIn = async (args: { role: 'student' | 'guest' | 'admin' | 'staff', identifier: string, password: string }) => {
        const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
        const { role, identifier, password } = args
        let path = ''
        let body: Record<string, string> = { password }
        if (role === 'student') { path = '/auth/login/student'; body.studentNumber = identifier }
        else if (role === 'guest') { path = '/auth/login/guest'; body.email = identifier }
        else { path = '/auth/login/staff'; body.staffNumber = identifier }
        const res = await fetch(`${backend}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error('Invalid credentials')
        const data = await res.json()
        setUser(data.user)
    }
    const signOut = async () => {
        const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
        await fetch(`${backend}/auth/logout`, { method: 'POST', credentials: 'include' })
        setToken(null)
        setUser(null)
    }

    const signUp = async (args: { role: 'student' | 'guest' | 'admin' | 'staff', name: string, identifier: string, password: string, email?: string }) => {
        const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
        const { role, name, identifier, password, email } = args
        let path = ''
        let body: Record<string, string> = { name, password }
        if (role === 'student') { path = '/auth/signup/student'; body.studentNumber = identifier; if (email) body.email = email }
        else if (role === 'guest') { path = '/auth/signup/guest'; body.email = identifier; }
        else { path = '/auth/signup/staff'; body.staffNumber = identifier; if (email) body.email = email; body.role = role === 'admin' ? 'admin' : 'staff' }
        const res = await fetch(`${backend}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error('Signup failed')
        const data = await res.json()
        setUser(data.user)
    }

    return (
    <AuthContext.Provider value={{ token, setToken, user, setUser, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider