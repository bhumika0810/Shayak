"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Save, Search } from "lucide-react"
import { db, type Submission } from "@/lib/db"
import { useLiveQuery } from "@/lib/dexie-hooks"
import { useRouter } from "next/navigation"

export default function Gradebook() {
    const router = useRouter()

    const assignments = useLiveQuery(() => db.assignments.orderBy('dueDate').reverse().toArray()) || []
    const students = useLiveQuery(() => db.users.where('role').equals('student').toArray()) || []
    const submissions = useLiveQuery(() => db.submissions.toArray()) || []

    const [marksUpdates, setMarksUpdates] = useState<Record<string, number>>({})

    const getSubmission = (studentId: string, assignmentId: number) => {
        return submissions.find((s: any) => s.studentId === studentId && s.assignmentId === assignmentId)
    }

    const handleMarkChange = (studentId: string, assignmentId: number, marks: string) => {
        const key = `${studentId}-${assignmentId}`
        setMarksUpdates(prev => ({ ...prev, [key]: parseInt(marks) || 0 }))
    }

    const saveMarks = async (studentId: string, assignmentId: number) => {
        const key = `${studentId}-${assignmentId}`
        const newMarks = marksUpdates[key]
        if (newMarks === undefined) return

        const existingSub = getSubmission(studentId, assignmentId)

        if (existingSub && existingSub.id) {
            await db.submissions.update(existingSub.id, {
                obtainedMarks: newMarks,
                status: 'graded'
            })
        } else {

            await db.submissions.add({
                assignmentId,
                studentId,
                content: "Graded by teacher",
                submittedAt: new Date(),
                status: 'graded',
                obtainedMarks: newMarks
            })
        }

        const newUpdates = { ...marksUpdates }
        delete newUpdates[key]
        setMarksUpdates(newUpdates)
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>

                <h1 className="text-3xl font-bold mb-8">Class Gradebook</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Student Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[200px]">Student Name</TableHead>
                                    {assignments.map((assignment: any) => (
                                        <TableHead key={assignment.id} className="min-w-[120px]">
                                            <div className="flex flex-col">
                                                <span>{assignment.title}</span>
                                                <span className="text-xs text-muted-foreground font-normal">Max: {assignment.maxMarks}</span>
                                            </div>
                                        </TableHead>
                                    ))}
                                    <TableHead>Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student: any) => {

                                    let totalObtained = 0
                                    let totalMax = 0

                                    return (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">{student.name}</TableCell>

                                            {assignments.map((assignment: any) => {
                                                if (!assignment.id) return <TableCell key="err"></TableCell>
                                                const sub = getSubmission(student.email, assignment.id)
                                                const currentMarks = sub?.obtainedMarks || 0
                                                const key = `${student.email}-${assignment.id}`
                                                const isEdited = marksUpdates[key] !== undefined
                                                const displayValue = isEdited ? marksUpdates[key] : (sub?.obtainedMarks ?? "")

                                                if (sub?.obtainedMarks) {
                                                    totalObtained += sub.obtainedMarks
                                                    totalMax += assignment.maxMarks
                                                }

                                                return (
                                                    <TableCell key={assignment.id}>
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="number"
                                                                className="w-16 h-8"
                                                                value={displayValue}
                                                                onChange={(e) => handleMarkChange(student.email, assignment.id!, e.target.value)}
                                                                max={assignment.maxMarks}
                                                            />
                                                            {isEdited && (
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                    onClick={() => saveMarks(student.email, assignment.id!)}
                                                                >
                                                                    <Save className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                )
                                            })}

                                            <TableCell className="font-bold text-indigo-700">
                                                {totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0}%
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                                {students.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={assignments.length + 2} className="text-center py-8 text-muted-foreground">
                                            No students found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}