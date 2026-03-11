"use client"

import { useState, useRef, useEffect } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { VoiceRecorder } from "@/components/features/VoiceRecorder"
import { ArrowLeft, MessageSquare, Volume2, Globe } from "lucide-react"
import { useRouter } from "next/navigation"

interface Message {
    role: 'user' | 'assistant'
    content: string
}

export default function VoiceQnA() {
    const router = useRouter()
    const [messages, setMessages] = useState<Message[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [language, setLanguage] = useState("en-US")
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleTranscript = async (text: string) => {
        if (!text) return

        const newMessages: Message[] = [...messages, { role: 'user', content: text }]
        setMessages(newMessages)
        setIsProcessing(true)

        try {

            const systemPrompt = language.startsWith('hi')
                ? "You are a helpful teaching assistant. Reply in Hindi (using Devanagari script) mixed with English terms where appropriate (Hinglish)."
                : "You are a helpful teaching assistant."

            const response = await fetch("http://localhost:8000/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: systemPrompt },
                        ...newMessages
                    ]
                })
            })

            const data = await response.json()
            const aiText = data.choices[0].message.content

            setMessages(prev => [...prev, { role: 'assistant', content: aiText }])
            speak(aiText)

        } catch (error) {
            console.error("LLM Error:", error)
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to my brain right now." }])
        } finally {
            setIsProcessing(false)
        }
    }

    const speak = (text: string) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel()
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.lang = language
            window.speechSynthesis.speak(utterance)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex-1 container mx-auto px-4 py-8 flex flex-col max-w-3xl">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4 w-fit">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MessageSquare className="h-6 w-6 text-indigo-600" />
                        Voice Q&A
                    </h1>

                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <select
                            className="bg-transparent text-sm font-medium focus:outline-none"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                        >
                            <option value="en-US">English (US)</option>
                            <option value="en-IN">English (India)</option>
                            <option value="hi-IN">Hindi</option>
                        </select>
                    </div>
                </div>

                {}
                <Card className="flex-1 mb-6 overflow-hidden flex flex-col bg-white/50 backdrop-blur-sm shadow-sm ring-1 ring-gray-200">
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px]">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                                <MessageSquare className="h-16 w-16 mb-4" />
                                <p>Ask me anything about your studies!</p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-tr-sm'
                                            : 'bg-white border border-gray-100 shadow-sm rounded-tl-sm text-gray-800'
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                    {msg.role === 'assistant' && (
                                        <button
                                            onClick={() => speak(msg.content)}
                                            className="mt-2 text-indigo-600 opacity-50 hover:opacity-100 transition-opacity"
                                        >
                                            <Volume2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </CardContent>
                </Card>

                {}
                <div className="sticky bottom-4 z-10 w-full">
                    <VoiceRecorder
                        onTranscript={handleTranscript}
                        isProcessing={isProcessing}
                        language={language}
                    />
                </div>
            </div>
        </div>
    )
}