"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Calendar, Book, Trash2, ArrowLeft, X } from "lucide-react"
import { db } from "@/lib/db"
import { useLiveQuery } from "@/lib/dexie-hooks"
import { Navbar } from "@/components/layout/Navbar"

export default function TeacherAssignments() {
    const { user } = useAuth()
    const router = useRouter()
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [dueDate, setDueDate] = useState("")
    const [maxMarks, setMaxMarks] = useState("100")
    const [type, setType] = useState<"homework" | "project" | "quiz">("homework")

    const assignments = useLiveQuery(() => db.assignments.orderBy('dueDate').reverse().toArray()) || []

    const handleCreate = async () => {
        if (!title || !dueDate) return

        setIsLoading(true)
        try {
            await db.assignments.add({
                title,
                description,
                classId: user?.classId || 1,
                dueDate: new Date(dueDate),
                type,
                maxMarks: parseInt(maxMarks),
                createdAt: new Date()
            })
            setIsCreateOpen(false)
            resetForm()
        } catch (error) {
            console.error("Failed to create assignment:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this assignment?")) {
            await db.assignments.delete(id)
        }
    }

    const resetForm = () => {
        setTitle("")
        setDescription("")
        setDueDate("")
        setMaxMarks("100")
        setType("homework")
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Assignments</h1>
                        <p className="text-muted-foreground">Manage class assignments and homework</p>
                    </div>

                    <Button onClick={() => setIsCreateOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Assignment
                    </Button>

                    {}
                    {isCreateOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                                <div className="flex justify-between items-center p-4 border-b">
                                    <h2 className="text-lg font-semibold">Create New Assignment</h2>
                                    <button onClick={() => setIsCreateOpen(false)} className="text-gray-500 hover:text-gray-700">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
                                    <div className="grid gap-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Algebra Worksheet 1" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="type">Type</Label>
                                        <select
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            value={type}
                                            onChange={(e) => setType(e.target.value as any)}
                                        >
                                            <option value="homework">Homework</option>
                                            <option value="quiz">Quiz</option>
                                            <option value="project">Project</option>
                                        </select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="dueDate">Due Date</Label>
                                        <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="maxMarks">Max Marks</Label>
                                        <Input id="maxMarks" type="number" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description</Label>
                                        <textarea
                                            id="description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Instructions for students..."
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
                                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                    <Button onClick={handleCreate} disabled={isLoading || !title || !dueDate}>Create</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {assignments.map((assignment: any) => (
                        <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-start justify-between pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg">{assignment.title}</CardTitle>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${assignment.type === 'quiz' ? 'bg-purple-100 text-purple-800' :
                                        assignment.type === 'project' ? 'bg-orange-100 text-orange-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                        {assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1)}
                                    </span>
                                </div>
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500" onClick={() => assignment.id && handleDelete(assignment.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{assignment.description}</p>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center text-muted-foreground">
                                        <Calendar className="mr-1 h-3 w-3" />
                                        {new Date(assignment.dueDate).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center font-medium">
                                        <Book className="mr-1 h-3 w-3" />
                                        {assignment.maxMarks} Marks
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {assignments.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground bg-white rounded-lg border border-dashed">
                            No assignments created yet. Click "Create Assignment" to get started.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}