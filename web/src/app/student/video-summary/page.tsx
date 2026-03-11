"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, FileVideo, FileAudio, Upload, Sparkles, FileText } from "lucide-react"

export default function VideoSummary() {
    const [summary, setSummary] = useState("")
    const [transcript, setTranscript] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState("")

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsLoading(true)
        setStatus("transcribing")
        setSummary("")
        setTranscript("")

        try {
            const formData = new FormData()
            formData.append("file", file)

            const sttRes = await fetch("http://localhost:8000/api/transcribe", {
                method: "POST",
                body: formData
            })

            if (!sttRes.ok) throw new Error("Local Transcription Failed. Is the Edge Server running?")

            const sttData = await sttRes.json()
            setTranscript(sttData.text)

            if (sttData.text) {
                await generateSummary(sttData.text)
            }

        } catch (err: any) {
            console.error(err)
            setSummary(`Error: ${err.message}`)
            setIsLoading(false)
            setStatus("")
        }
    }

    const generateSummary = async (text: string) => {
        setStatus("summarizing")
        try {

            const prompt = `Summarize the following video transcript into key bullet points:\n\n${text}`

            const llmRes = await fetch(`http://localhost:8000/api/chat?query=${encodeURIComponent(text)}&context=${encodeURIComponent("Summarize into bullet points")}`, {
                method: "POST"
            })

            if (!llmRes.ok) throw new Error("Local Summarization Failed")

            const llmData = await llmRes.json()
            setSummary(llmData.response)
        } catch (err: any) {
            console.error(err)
            setSummary(`Error: ${err.message}`)
        } finally {
            setIsLoading(false)
            setStatus("")
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Offline Video Assistant</h1>

                <div className="grid gap-8 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Input Source</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid gap-2">
                                <Label>Upload Video/Audio File</Label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                    <Input
                                        type="file"
                                        accept="video/*,audio/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleFileUpload}
                                        disabled={isLoading}
                                    />
                                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                    <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                                    <p className="text-xs text-gray-500">MP4, MP3, WAV supported (Local Processing)</p>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground bg-white">
                                        Or paste transcript
                                    </span>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Transcript Text</Label>
                                <textarea
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Paste video transcript here..."
                                    value={transcript}
                                    onChange={(e) => setTranscript(e.target.value)}
                                />
                                <Button
                                    onClick={() => generateSummary(transcript)}
                                    disabled={isLoading || !transcript}
                                    variant="outline"
                                >
                                    <Sparkles className="mr-2 h-4 w-4" /> Summarize Text
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="min-h-[400px] flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-indigo-600" />
                                AI Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            {isLoading ? (
                                <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
                                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                                    <p className="animate-pulse font-medium">
                                        {status === "transcribing" ? "Transcribing Audio..." : "Generating Summary with Gemma..."}
                                    </p>
                                </div>
                            ) : summary ? (
                                <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-4 rounded-lg border">
                                    <div className="whitespace-pre-wrap">{summary}</div>
                                </div>
                            ) : (
                                <div className="flex h-full items-center justify-center text-muted-foreground text-sm italic">
                                    Upload a video or paste text to see the summary here.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}