"use client"

import { Navbar } from "@/components/layout/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db"
import { useLiveQuery } from "@/lib/dexie-hooks"
import { useAuth } from "@/lib/auth-context"
import { CheckCircle, FileText, Send, X } from "lucide-react"
import { useState } from "react"

export default function StudentAssignments() {
    const { user } = useAuth()

    const assignments = useLiveQuery(async () => {
        if (!user) return []
        if (user.role === 'student' && user.classId) {
            return await db.assignments.where('classId').equals(user.classId).reverse().sortBy('dueDate')
        }
        return await db.assignments.orderBy('dueDate').reverse().toArray()
    }, [user])

    const submissions = useLiveQuery(() => db.submissions.where('studentId').equals(user?.email || "").toArray())

    const getSubmission = (assignmentId: number) => {
        return submissions?.find((s: any) => s.assignmentId === assignmentId)
    }

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submissionContent, setSubmissionContent] = useState("")
    const [selectedAssignment, setSelectedAssignment] = useState<number | null>(null)

    const handleSubmit = async () => {
        if (!user || !selectedAssignment || !submissionContent) return
        setIsSubmitting(true)

        try {
            await db.submissions.add({
                assignmentId: selectedAssignment,
                studentId: user.email,
                content: submissionContent,
                submittedAt: new Date(),
                status: 'pending'
            })

            await db.studentLogs.add({
                studentId: user.email,
                activityType: 'quiz',
                timestamp: new Date(),
                synced: false,
                data: { action: "submitted_assignment", assignmentId: selectedAssignment }
            })

            setSubmissionContent("")
            setSelectedAssignment(null)
        } catch (error) {
            console.error("Submission failed", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">My Assignments</h1>

                {}
                {selectedAssignment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="flex justify-between items-center p-4 border-b">
                                <h2 className="text-lg font-semibold">Submit Assignment</h2>
                                <button onClick={() => setSelectedAssignment(null)} className="text-gray-500 hover:text-gray-700">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="p-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Answer / Work</label>
                                    <textarea
                                        placeholder="Type your answer or paste a link to your work here..."
                                        value={submissionContent}
                                        onChange={(e) => setSubmissionContent(e.target.value)}
                                        className="w-full min-h-[150px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
                                <Button variant="ghost" onClick={() => setSelectedAssignment(null)}>Cancel</Button>
                                <Button onClick={handleSubmit} disabled={isSubmitting || !submissionContent}>
                                    {isSubmitting ? "Submitting..." : "Submit"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {assignments?.map((assignment: any) => {
                        const submission = getSubmission(assignment.id!)
                        const isDone = !!submission

                        return (
                            <Card key={assignment.id} className={`hover:shadow-md transition-shadow ${isDone ? 'bg-green-50/50 border-green-100' : ''}`}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="line-clamp-1" title={assignment.title}>{assignment.title}</CardTitle>
                                        <span className={`px-2 py-1 rounded text-xs font-bold shrink-0 ${assignment.type === 'homework' ? 'bg-blue-100 text-blue-700' :
                                            assignment.type === 'quiz' ? 'bg-purple-100 text-purple-700' :
                                                'bg-orange-100 text-orange-700'
                                            }`}>
                                            {assignment.type.toUpperCase()}
                                        </span>
                                    </div>
                                    <CardDescription>Due: {new Date(assignment.dueDate).toLocaleDateString()}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-3 mb-2">
                                        {assignment.description}
                                    </p>
                                    <div className="text-xs font-medium text-muted-foreground">
                                        Max Marks: {assignment.maxMarks}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    {isDone ? (
                                        <div className="w-full flex flex-col gap-2">
                                            <Button variant="secondary" className="w-full bg-green-100 text-green-700 hover:bg-green-200 cursor-default" disabled>
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                {submission.status === 'graded' ? `Graded: ${submission.obtainedMarks}/${assignment.maxMarks}` : 'Submitted'}
                                            </Button>
                                            {submission.status === 'graded' && (
                                                <p className="text-xs text-center text-green-700 font-medium">
                                                    Great job!
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <Button
                                            className="w-full"
                                            onClick={() => setSelectedAssignment(assignment.id!)}
                                        >
                                            <Send className="mr-2 h-4 w-4" /> Submit Work
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        )
                    })}

                    {assignments?.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground bg-white rounded-lg border border-dashed">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>No assignments assigned yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}