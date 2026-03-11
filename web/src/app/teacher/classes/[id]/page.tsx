"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, UserPlus, ArrowLeft, Trash2 } from "lucide-react"
import { db } from "@/lib/db"
import { useLiveQuery } from "@/lib/dexie-hooks"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function ClassDetails() {
    const params = useParams()
    const router = useRouter()
    const classId = Number(params.id)

    const classData = useLiveQuery(() => db.classes.get(classId), [classId])
    const students = useLiveQuery(() => db.users.where('classId').equals(classId).and(u => u.role === 'student').toArray(), [classId])

    const [isAdding, setIsAdding] = useState(false)
    const [newStudentName, setNewStudentName] = useState("")
    const [newStudentEmail, setNewStudentEmail] = useState("")

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newStudentName || !newStudentEmail) return

        const existing = await db.users.where('email').equals(newStudentEmail).first()
        if (existing) {
            alert("User with this email already exists!")
            return
        }

        await db.users.add({
            name: newStudentName,
            email: newStudentEmail,
            role: 'student',
            classId: classId,
            password: 'password123',
            createdAt: new Date()
        })

        setIsAdding(false)
        setNewStudentName("")
        setNewStudentEmail("")
    }

    if (!classData) return <div className="p-8 text-center">Loading class data...</div>

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/teacher/classes">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">{classData.name}</h1>
                        <p className="text-muted-foreground">{classData.subject}</p>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Students ({students?.length || 0})</h2>
                    <Button onClick={() => setIsAdding(!isAdding)} className="bg-green-600 hover:bg-green-700">
                        <UserPlus className="mr-2 h-4 w-4" /> Add Student
                    </Button>
                </div>

                {isAdding && (
                    <Card className="mb-8 border-green-200 bg-green-50 animate-in slide-in-from-top-4">
                        <CardHeader>
                            <CardTitle className="text-lg">Add New Student</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddStudent} className="flex gap-4 items-end">
                                <div className="grid gap-2 flex-1">
                                    <Label htmlFor="sName">Name</Label>
                                    <Input
                                        id="sName"
                                        placeholder="Student Name"
                                        value={newStudentName}
                                        onChange={(e) => setNewStudentName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2 flex-1">
                                    <Label htmlFor="sEmail">Email (Login ID)</Label>
                                    <Input
                                        id="sEmail"
                                        type="email"
                                        placeholder="student@school.com"
                                        value={newStudentEmail}
                                        onChange={(e) => setNewStudentEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit">Add to Class</Button>
                            </form>
                            <p className="text-xs text-muted-foreground mt-2 ml-1">
                                Default password will be set to: <strong>password123</strong>
                            </p>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    {students?.map((student: any) => (
                        <Card key={student.id} className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                    {student.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-semibold">{student.name}</div>
                                    <div className="text-sm text-muted-foreground">{student.email}</div>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </Card>
                    ))}

                    {students?.length === 0 && !isAdding && (
                        <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                            No students enrolled yet. Add one to get started.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}