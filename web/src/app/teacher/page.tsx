"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, FileText, Settings, Video, RefreshCw } from "lucide-react"
import { db } from "@/lib/db"
import { useLiveQuery } from "@/lib/dexie-hooks";

export default function TeacherDashboard() {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    const logsCount = useLiveQuery(() => db.studentLogs.count()) || 0
    const unsyncedCount = useLiveQuery(() => db.studentLogs.where('synced').equals(0).count()) || 0
    const worksheetsCount = useLiveQuery(() => db.worksheets.count()) || 0

    useEffect(() => {
        if (!isLoading && (!user || user.role !== "teacher")) {
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
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
                    <div className="text-sm text-muted-foreground">
                        {unsyncedCount > 0 ? (
                            <span className="text-red-500 font-medium flex items-center gap-2">
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                {unsyncedCount} Pending Sync
                            </span>
                        ) : (
                            <span className="text-green-600 flex items-center gap-2">
                                <RefreshCw className="h-4 w-4" />
                                All Synced
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-indigo-50 border-indigo-200" onClick={() => router.push("/teacher/classes")}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-indigo-700">Manage Classes</CardTitle>
                            <Settings className="h-4 w-4 text-indigo-700" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-indigo-900">View</div>
                            <p className="text-xs text-indigo-600">Students & Content</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/teacher/assignments")}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Manage</div>
                            <p className="text-xs text-muted-foreground">Homework & Quizzes</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/teacher/worksheets")}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Worksheets</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{worksheetsCount}</div>
                            <p className="text-xs text-muted-foreground">AI Generated Content</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/teacher/marks")}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Gradebook</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Marks</div>
                            <p className="text-xs text-muted-foreground">Track Student Progress</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Sync Status</CardTitle>
                            <RefreshCw className={unsyncedCount > 0 ? "h-4 w-4 animate-spin text-red-500" : "h-4 w-4 text-green-500"} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{unsyncedCount}</div>
                            <p className="text-xs text-muted-foreground">Pending items</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}