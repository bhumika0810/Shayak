"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { db, type User } from "./db"

type UserRole = "teacher" | "student" | null

interface AuthContextType {
    user: User | null
    login: (email: string, role: UserRole) => Promise<boolean>

    signIn: (email: string, password: string) => Promise<void>
    signUp: (name: string, email: string, password: string, role: string) => Promise<void>
    logout: () => void
    isLoading: boolean
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = React.useState<User | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const router = useRouter()

    React.useEffect(() => {
        const checkSession = async () => {
            const storedEmail = localStorage.getItem("sahayak_email")
            if (storedEmail) {
                const foundUser = await db.users.where("email").equals(storedEmail).first()
                if (foundUser) {
                    setUser(foundUser)
                }
            }
            setIsLoading(false)
        }
        checkSession()
    }, [])

    const signIn = async (email: string, password: string) => {
        const foundUser = await db.users.where("email").equals(email).first()

        if (foundUser && foundUser.password === password) {
            setUser(foundUser)
            localStorage.setItem("sahayak_email", email)

            if (foundUser.role === "teacher") router.push("/teacher")
            else router.push("/student")
        } else {
            throw new Error("Invalid credentials")
        }
    }

    const signUp = async (name: string, email: string, password: string, role: string) => {
        const existing = await db.users.where("email").equals(email).first()
        if (existing) throw new Error("User already exists")

        const newUser: User = {
            name,
            email,
            password,
            role: role as "teacher" | "student",
            createdAt: new Date()
        }

        await db.users.add(newUser)

        setUser(newUser)
        localStorage.setItem("sahayak_email", email)

        if (role === "teacher") router.push("/teacher")
        else router.push("/student")
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem("sahayak_email")
        router.push("/login")
    }

    return (
        <AuthContext.Provider value={{
            user,
            login: async () => false,
            signIn, signUp, logout, isLoading
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = React.useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}