"use client"

import { Navbar } from "@/components/layout/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db"
import { useLiveQuery } from "@/lib/dexie-hooks"
import { useAuth } from "@/lib/auth-context"
import { BarChart, Trophy, FileCheck } from "lucide-react"

export default function StudentMarks() {
    const { user } = useAuth()

    const submissions = useLiveQuery(() =>
        db.submissions.where('studentId').equals(user?.email || "")
            .and(s => s.status === 'graded')
            .toArray()
    )

    const assignments = useLiveQuery(() => db.assignments.toArray())

    const gradedWork = submissions?.map((sub: any) => {
        const assignment = assignments?.find((a: any) => a.id === sub.assignmentId)
        return {
            ...sub,
            assignmentTitle: assignment?.title || "Unknown Assignment",
            maxMarks: assignment?.maxMarks || 100
        }
    }) || []

    let totalObtained = 0
    let totalMax = 0
    gradedWork.forEach((w: any) => {
        if (w.obtainedMarks) {
            totalObtained += w.obtainedMarks
            totalMax += w.maxMarks
        }
    })

    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">My Performance</h1>

                <div className="grid gap-6 md:grid-cols-3 mb-8">
                    <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium text-indigo-100">Overall Score</CardTitle>
                            <Trophy className="h-4 w-4 text-indigo-100" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">{percentage.toFixed(1)}%</div>
                            <p className="text-xs text-indigo-100 mt-1">Weighted Average</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium">Assignments Completed</CardTitle>
                            <FileCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">{gradedWork.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium">Class Rank</CardTitle>
                            <BarChart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">Top 10%</div>
                            <p className="text-xs text-muted-foreground mt-1">Keep it up!</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4">
                    <h2 className="text-xl font-bold">Recent Grades</h2>
                    {gradedWork.map((work: any) => (
                        <Card key={work.id} className="flex items-center justify-between p-4">
                            <div>
                                <div className="font-semibold text-lg">{work.assignmentTitle}</div>
                                <div className="text-sm text-muted-foreground">Submitted: {work.submittedAt.toLocaleDateString()}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-green-600">
                                    {work.obtainedMarks} <span className="text-base text-gray-400 font-normal">/ {work.maxMarks}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">Score</div>
                            </div>
                        </Card>
                    ))}

                    {gradedWork.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            No graded work yet. Convert your potential to kinetic energy!
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}