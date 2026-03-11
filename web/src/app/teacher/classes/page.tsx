"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Users, ArrowRight, BookOpen } from "lucide-react"
import { db } from "@/lib/db"
import { useLiveQuery } from "@/lib/dexie-hooks"
import { Link } from "lucide-react"
import NextLink from "next/link"
import { useAuth } from "@/lib/auth-context"

export default function ManageClasses() {
    const { user } = useAuth()
    const classes = useLiveQuery(() => db.classes.where('teacherId').equals(user?.email || "").toArray())

    const [isCreating, setIsCreating] = useState(false)
    const [newClassName, setNewClassName] = useState("")
    const [newSubject, setNewSubject] = useState("")

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !newClassName) return

        await db.classes.add({
            name: newClassName,
            subject: newSubject,
            teacherId: user.email,
            createdAt: new Date()
        })

        setIsCreating(false)
        setNewClassName("")
        setNewSubject("")
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">My Classes</h1>
                    <Button onClick={() => setIsCreating(!isCreating)} className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="mr-2 h-4 w-4" /> Create Class
                    </Button>
                </div>

                {isCreating && (
                    <Card className="mb-8 border-indigo-200 bg-indigo-50 animate-in slide-in-from-top-4">
                        <CardHeader>
                            <CardTitle className="text-lg">New Class Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateClass} className="flex gap-4 items-end">
                                <div className="grid gap-2 flex-1">
                                    <Label htmlFor="className">Class Name</Label>
                                    <Input
                                        id="className"
                                        placeholder="e.g. Class 10-A"
                                        value={newClassName}
                                        onChange={(e) => setNewClassName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2 flex-1">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input
                                        id="subject"
                                        placeholder="e.g. Mathematics"
                                        value={newSubject}
                                        onChange={(e) => setNewSubject(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit">Save Class</Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {classes?.map((cls: any) => (
                        <Card key={cls.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xl font-bold">{cls.name}</CardTitle>
                                <BookOpen className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">{cls.subject}</p>
                                <div className="flex justify-end">
                                    <NextLink href={`/teacher/classes/${cls.id}`}>
                                        <Button variant="outline" size="sm" className="group">
                                            Manage Students
                                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </NextLink>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {classes?.length === 0 && !isCreating && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            No classes found. Create one to get started!
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}