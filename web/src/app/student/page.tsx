"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, BookOpen, Brain, Trophy, Video } from "lucide-react"
import Link from "next/link"
import { db } from "@/lib/db"
import { useLiveQuery } from "@/lib/dexie-hooks"

export default function StudentDashboard() {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    const logsCount = useLiveQuery(() => db.studentLogs.where('studentId').equals(user?.email || "").count()) || 0

    useEffect(() => {
        if (!isLoading && (!user || user.role !== "student")) {
            router.push("/login")
        }
    }, [user, isLoading, router])

    if (isLoading || !user) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="mb-8 text-3xl font-bold">Hello, {user.name}!</h1>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Link href="/student/assignments">
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white border-l-4 border-l-orange-500">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-medium text-gray-700">Homework</CardTitle>
                                <BookOpen className="h-5 w-5 text-orange-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900"> Assignments</div>
                                <p className="text-sm text-gray-500">View & Submit</p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/student/chat">
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white border-l-4 border-l-blue-500">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-medium text-gray-700">AI Tutor</CardTitle>
                                <Mic className="h-5 w-5 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">Voice Q&A</div>
                                <p className="text-sm text-gray-500">Ask questions in Hindi/English</p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/student/marks">
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white border-l-4 border-l-green-500">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-medium text-gray-700">Grades</CardTitle>
                                <Trophy className="h-5 w-5 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">Performance</div>
                                <p className="text-sm text-gray-500">View your scores</p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/student/video-summary">
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white border-l-4 border-l-purple-500">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-medium text-gray-700">Video AI</CardTitle>
                                <Video className="h-5 w-5 text-purple-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">Summarizer</div>
                                <p className="text-sm text-gray-500">Learn from YouTube</p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Card className="hover:shadow-lg transition-shadow bg-white border-l-4 border-l-gray-500">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium text-gray-700">Activity</CardTitle>
                            <Brain className="h-5 w-5 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{logsCount} Actions</div>
                            <p className="text-sm text-gray-500">Total Interactions</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}