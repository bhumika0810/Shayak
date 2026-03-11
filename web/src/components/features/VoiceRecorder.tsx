"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, MicOff, Loader2 } from 'lucide-react'

interface VoiceRecorderProps {
    onTranscript: (text: string) => void
    isProcessing?: boolean
    language?: string
}

export function VoiceRecorder({ onTranscript, isProcessing = false, language = 'en-US' }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false)
    const [recognition, setRecognition] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
            if (SpeechRecognition) {
                const recognitionInstance = new SpeechRecognition()
                recognitionInstance.continuous = false
                recognitionInstance.interimResults = false
                recognitionInstance.lang = language

                recognitionInstance.onstart = () => {
                    setIsRecording(true)
                    setError(null)
                }

                recognitionInstance.onend = () => {
                    setIsRecording(false)
                }

                recognitionInstance.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript
                    onTranscript(transcript)
                }

                recognitionInstance.onerror = (event: any) => {
                    setError('Error occurred in recognition: ' + event.error)
                    setIsRecording(false)
                }

                setRecognition(recognitionInstance)
            } else {
                setError('Browser does not support Speech Recognition.')
            }
        }
    }, [onTranscript, language])

    const toggleRecording = () => {
        if (isRecording) {
            recognition?.stop()
        } else {
            if (recognition) {
                try {
                    recognition.lang = language
                    recognition.start()
                } catch (e) {
                    console.error("Recognition start failed", e)
                }
            }
        }
    }

    if (error) {
        return <div className="text-red-500 text-sm">{error}</div>
    }

    return (
        <Card className="w-full max-w-sm mx-auto shadow-none border-none bg-transparent">
            <CardContent className="flex flex-col items-center justify-center p-0 space-y-4">
                <div
                    className={`p-6 rounded-full transition-all duration-300 cursor-pointer ${isRecording ? 'bg-red-100 ring-4 ring-red-50' : 'bg-indigo-50 hover:bg-indigo-100'
                        }`}
                    onClick={toggleRecording}
                >
                    {isProcessing ? (
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    ) : isRecording ? (
                        <Mic className="h-8 w-8 text-red-600 animate-pulse" />
                    ) : (
                        <Mic className="h-8 w-8 text-indigo-600" />
                    )}
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                    {isRecording ? "Listening..." : "Tap to Speak"}
                </p>
            </CardContent>
        </Card>
    )
}