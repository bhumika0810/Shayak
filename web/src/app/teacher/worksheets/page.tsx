"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, Save, Loader2, ArrowLeft } from "lucide-react"
import { db } from "@/lib/db"
import { useLiveQuery } from "@/lib/dexie-hooks"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function WorksheetGenerator() {
    const { user } = useAuth()
    const router = useRouter()
    const classes = useLiveQuery(() => db.classes.where('teacherId').equals(user?.email || "").toArray())

    const [selectedClass, setSelectedClass] = useState("")
    const [topic, setTopic] = useState("")
    const [type, setType] = useState<"quiz" | "homework">("homework")
    const [generatedContent, setGeneratedContent] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const handleGenerate = async () => {
        if (!topic) return
        setIsGenerating(true)

        try {

            const prompt = `Create a ${type} for a school class on the topic: ${topic}. Format it clearly.`

            const response = await fetch("http://localhost:8000/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: "You are a helpful teacher's assistant." },
                        { role: "user", content: prompt }
                    ]
                })
            })

            const data = await response.json()
            const aiText = data.choices[0].message.content
            setGeneratedContent(aiText)
        } catch (err) {
            console.error(err)

            setGeneratedContent(`Error: Could not connect to AI. \n\nDetails: ${(err as Error).message}\n\nEnsure the Edge Server is running at http://localhost:8000 and allows CORS.`)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSave = async () => {
        if (!selectedClass || !generatedContent) return
        setIsSaving(true)

        await db.worksheets.add({
            title: `${topic} (${type})`,
            subject: type,
            content: generatedContent,
            createdAt: new Date(),
            generatedFor: selectedClass
        })

        setIsSaving(false)
        router.push("/teacher")
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>

                <h1 className="text-3xl font-bold mb-8">AI Worksheet Generator</h1>

                <div className="grid gap-8 lg:grid-cols-2">
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <Label>Select Class</Label>
                                <select
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                >
                                    <option value="" disabled>Select a class...</option>
                                    {classes?.map((cls: any) => (
                                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                                    ))}
                                    {(!classes || classes.length === 0) && <option value="1">Demo Class</option>}
                                </select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Topic</Label>
                                <Input
                                    placeholder="e.g. Photosynthesis, Algebra, Indian History"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Type</Label>
                                <select
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={type}
                                    onChange={(e) => setType(e.target.value as any)}
                                >
                                    <option value="homework">Homework</option>
                                    <option value="quiz">Quiz</option>
                                    <option value="project">Project</option>
                                </select>
                            </div>

                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating || !topic}
                                className="w-full bg-indigo-600 hover:bg-indigo-700"
                            >
                                {isGenerating ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                                ) : (
                                    <><Sparkles className="mr-2 h-4 w-4" /> Generate Content</>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col h-[600px]">
                        <CardHeader>
                            <CardTitle>Preview & Edit</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0">
                            <textarea
                                className="w-full h-full p-4 resize-none focus:outline-none border-t bg-gray-50 font-mono text-sm leading-relaxed"
                                value={generatedContent}
                                onChange={(e) => setGeneratedContent(e.target.value)}
                                placeholder="Generated content will appear here..."
                            />
                        </CardContent>
                        <CardFooter className="border-t p-4">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || !generatedContent || !selectedClass}
                                className="w-full bg-green-600 hover:bg-green-700"
                            >
                                {isSaving ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                                ) : (
                                    <><Save className="mr-2 h-4 w-4" /> Save Worksheet</>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}