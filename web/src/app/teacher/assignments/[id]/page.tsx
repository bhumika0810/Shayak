"use client"

import { Navbar } from "@/components/layout/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { db } from "@/lib/db"
import { useLiveQuery } from "@/lib/dexie-hooks"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react"
import { useState } from "react"

export default function AssignmentGrading() {
    const params = useParams()
    const id = Number(params.id)

    const assignment = useLiveQuery(() => db.assignments.get(id), [id])

    const submissions = useLiveQuery(() => db.submissions.where('assignmentId').equals(id).toArray(), [id])

    const [gradingId, setGradingId] = useState<number | null>(null)
    const [score, setScore] = useState("")

    const handleGrade = async (submissionId: number) => {
        if (!score) return

        await db.submissions.update(submissionId, {
            status: 'graded',
            obtainedMarks: Number(score)
        })

        setGradingId(null)
        setScore("")
    }

    if (!assignment) return <div>Loading...</div>

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/teacher">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">{assignment.title}</h1>
                        <p className="text-muted-foreground">Due: {assignment.dueDate.toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Submissions ({submissions?.length || 0})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {submissions?.map((sub: any) => (
                                    <div key={sub.id} className="flex flex-col md:flex-row justify-between items-center p-4 border rounded-lg bg-white shadow-sm">
                                        <div className="mb-4 md:mb-0">
                                            <div className="font-semibold text-lg">{sub.studentId}</div>
                                            <div className="text-sm text-gray-500">Submitted: {sub.submittedAt.toLocaleString()}</div>
                                            <div className="mt-2 p-3 bg-gray-50 rounded text-sm font-mono border">
                                                {sub.content}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {sub.status === 'graded' ? (
                                                <div className="text-right">
                                                    <span className="block text-2xl font-bold text-green-600">{sub.obtainedMarks}</span>
                                                    <span className="text-xs text-muted-foreground">Score</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        placeholder="Marks"
                                                        className="w-24"
                                                        value={gradingId === sub.id ? score : ""}
                                                        onChange={(e) => {
                                                            setGradingId(sub.id!)
                                                            setScore(e.target.value)
                                                        }}
                                                    />
                                                    <Button
                                                        onClick={() => handleGrade(sub.id!)}
                                                        disabled={gradingId !== sub.id || !score}
                                                    >
                                                        Grade
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {submissions?.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No submissions yet.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}