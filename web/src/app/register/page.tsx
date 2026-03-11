"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Loader2, GraduationCap, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
    const { signUp } = useAuth()
    const router = useRouter()

    const [step, setStep] = useState<1 | 2>(1)
    const [role, setRole] = useState<"teacher" | "student" | null>(null)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleRoleSelect = (selectedRole: "teacher" | "student") => {
        setRole(selectedRole)
        setStep(2)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!role) return;

        setIsLoading(true)
        setError("")

        try {
            await signUp(name, email, password, role)

        } catch (err: any) {
            setError(err.message || "Registration failed")
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-200 via-slate-100 to-indigo-200 p-4">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl -z-10" />

            <Card className="w-full max-w-md shadow-2xl border-white/50 bg-white/80 backdrop-blur-xl">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {step === 1 ? "Choose your Journey" : "Create Account"}
                    </CardTitle>
                    <CardDescription className="text-slate-600 text-base">
                        {step === 1 ? "Select how you will use Sahayak" : `Registering as a ${role === 'teacher' ? 'Teacher' : 'Student'}`}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    {step === 1 ? (
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleRoleSelect("teacher")}
                                className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-indigo-100 bg-white p-6 hover:border-indigo-600 hover:bg-indigo-50 hover:shadow-lg transition-all group"
                            >
                                <div className="rounded-full bg-indigo-100 p-4 group-hover:bg-indigo-200 transition-colors">
                                    <User className="h-8 w-8 text-indigo-600" />
                                </div>
                                <span className="font-semibold text-slate-900">I am a Teacher</span>
                            </button>

                            <button
                                onClick={() => handleRoleSelect("student")}
                                className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-purple-100 bg-white p-6 hover:border-purple-600 hover:bg-purple-50 hover:shadow-lg transition-all group"
                            >
                                <div className="rounded-full bg-purple-100 p-4 group-hover:bg-purple-200 transition-colors">
                                    <GraduationCap className="h-8 w-8 text-purple-600" />
                                </div>
                                <span className="font-semibold text-slate-900">I am a Student</span>
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4 animate-in slide-in-from-right-8 fade-in duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-700">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="border-slate-200 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-700">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@school.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="border-slate-200 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-700">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="border-slate-200 focus:ring-indigo-500"
                                />
                            </div>

                            {error && (
                                <div className="p-3 rounded-md bg-red-50 text-sm text-red-600 font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStep(1)}
                                    className="flex-1"
                                >
                                    Back
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        "Create Account"
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center border-t bg-slate-50/50 p-6">
                    <p className="text-sm text-slate-600">
                        Already have an account?{" "}
                        <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
                            Login here
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}