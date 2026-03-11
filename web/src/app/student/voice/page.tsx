"use client"

import { useState, useRef, useEffect } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Square, ArrowLeft, Volume2, Loader2, Sparkles } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function VoicePage() {
    const [isRecording, setIsRecording] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [aiResponse, setAiResponse] = useState("")
    const [status, setStatus] = useState<"idle" | "recording" | "processing" | "speaking">("idle")

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const streamRef = useRef<MediaStream | null>(null)

    useEffect(() => {
        return () => {
            stopRecording()
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.src = ""
            }
        }
    }, [])

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            streamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            chunksRef.current = []

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data)
            }

            mediaRecorder.onstop = handleStopRecording

            mediaRecorder.start()
            setIsRecording(true)
            setStatus("recording")
        } catch (err) {
            console.error("Error accessing microphone:", err)
            alert("Could not access microphone. Please allow permissions.")
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop()
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }

        setIsRecording(false)

    }

    const handleStopRecording = async () => {

        setStatus("processing")

        const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" })
        if (audioBlob.size === 0) {
            setStatus("idle")
            return
        }

        const audioFile = new File([audioBlob], "voice_input.wav", { type: "audio/wav" })
        await processAudio(audioFile)
    }

    const processAudio = async (file: File) => {
        try {

            const formData = new FormData()
            formData.append("file", file)

            const sttRes = await fetch("http://localhost:8000/api/transcribe", {
                method: "POST",
                body: formData
            })

            if (!sttRes.ok) throw new Error("STT Failed - Is Edge Server running?")

            const sttData = await sttRes.json()
            setTranscript(sttData.text)

            if (!sttData.text) {
                setStatus("idle")
                return
            }

            const langContext = sttData.language ? `(Answer in ${sttData.language} language)` : ""
            const queryWithLang = `${sttData.text} ${langContext}`

            const llmRes = await fetch(`http://localhost:8000/api/chat?query=${encodeURIComponent(queryWithLang)}`, {
                method: "POST"
            })

            if (!llmRes.ok) throw new Error("LLM Failed")

            const llmData = await llmRes.json()
            setAiResponse(llmData.response)

            const langParam = sttData.language || "en"
            const ttsRes = await fetch(`http://localhost:8000/api/speak?text=${encodeURIComponent(llmData.response)}&language=${langParam}`, {
                method: "POST"
            })

            if (!ttsRes.ok) throw new Error("TTS Failed")

            const audioBlob = await ttsRes.blob()
            const audioUrl = URL.createObjectURL(audioBlob)

            if (audioRef.current) {
                audioRef.current.src = audioUrl
                audioRef.current.play()
                setStatus("speaking")
                audioRef.current.onended = () => setStatus("idle")
            } else {
                setStatus("idle")
            }

        } catch (error: any) {
            console.error("Pipeline Error:", error)
            setAiResponse(`Error: ${error.message || "Something went wrong"}`)
            setStatus("idle")
        }
    }

    return (
        <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-indigo-100">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/student">
                        <Button variant="ghost" size="icon" className="hover:bg-white/50">
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-800">Voice Assistant</h1>
                </div>

                <div className="mx-auto max-w-2xl space-y-8">
                    {}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <Card className="relative min-h-[400px] flex flex-col items-center justify-center p-8 border-indigo-50/50 bg-white/60 backdrop-blur-xl shadow-xl">

                            {}
                            <div className="mb-12 relative flex items-center justify-center">
                                {status === "recording" && (
                                    <>
                                        <div className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-20 h-32 w-32"></div>
                                        <div className="absolute inset-0 rounded-full animate-pulse bg-red-500 opacity-10 h-48 w-48 -m-8"></div>
                                    </>
                                )}
                                {status === "speaking" && (
                                    <>
                                        <div className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-20 h-32 w-32"></div>
                                        <div className="absolute inset-0 rounded-full animate-pulse bg-green-500 opacity-10 h-48 w-48 -m-8"></div>
                                    </>
                                )}

                                <Button
                                    size="lg"
                                    className={cn(
                                        "h-32 w-32 rounded-full shadow-2xl transition-all duration-300 z-10 border-4",
                                        status === "recording"
                                            ? "bg-red-500 hover:bg-red-600 border-red-200 scale-110"
                                            : status === "speaking"
                                                ? "bg-green-500 hover:bg-green-600 border-green-200"
                                                : "bg-indigo-600 hover:bg-indigo-700 border-indigo-200 hover:scale-105"
                                    )}
                                    onClick={isRecording ? stopRecording : startRecording}
                                    disabled={status === "processing"}
                                >
                                    {isRecording ? (
                                        <Square className="h-12 w-12 fill-white" />
                                    ) : (
                                        <Mic className="h-12 w-12" />
                                    )}
                                </Button>
                            </div>

                            <div className="text-center space-y-4 max-w-md">
                                {status === "idle" && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <h3 className="text-2xl font-semibold text-slate-800">Tap to Speak</h3>
                                        <p className="text-slate-500 mt-2">I can answer questions in English, Hindi, and more.</p>
                                    </div>
                                )}
                                {status === "recording" && (
                                    <div className="animate-in fade-in duration-300">
                                        <h3 className="text-2xl font-semibold text-red-600">Listening...</h3>
                                        <p className="text-slate-500 mt-2">Tap again to stop</p>
                                    </div>
                                )}
                                {status === "processing" && (
                                    <div className="flex flex-col items-center gap-3 animate-in fade-in duration-300">
                                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                                        <h3 className="text-xl font-medium text-indigo-600">Thinking...</h3>
                                    </div>
                                )}
                                {status === "speaking" && (
                                    <div className="flex flex-col items-center gap-3 animate-in fade-in duration-300">
                                        <Volume2 className="h-8 w-8 animate-bounce text-green-600" />
                                        <h3 className="text-xl font-medium text-green-600">Speaking...</h3>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {}
                    {(transcript || aiResponse) && (
                        <div className="grid gap-6 animate-in slide-in-from-bottom-8 duration-700">
                            {transcript && (
                                <div className="flex justify-end">
                                    <div className="bg-indigo-600 text-white px-6 py-4 rounded-2xl rounded-tr-sm max-w-[80%] shadow-lg">
                                        <p className="text-sm opacity-80 mb-1">You</p>
                                        <p className="text-lg">{transcript}</p>
                                    </div>
                                </div>
                            )}

                            {aiResponse && (
                                <div className="flex justify-start">
                                    <div className="bg-white/80 backdrop-blur-md border border-white px-6 py-4 rounded-2xl rounded-tl-sm max-w-[80%] shadow-lg">
                                        <div className="flex items-center gap-2 mb-2 text-indigo-600">
                                            <Sparkles className="h-4 w-4" />
                                            <span className="text-sm font-semibold">Sahayak AI</span>
                                        </div>
                                        <p className="text-lg text-slate-800 leading-relaxed">{aiResponse}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <audio ref={audioRef} className="hidden" />
                </div>
            </div>
        </div>
    )
}