"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { CameraCapture } from "@/components/features/CameraCapture"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function ScanPage() {
    const [capturedImage, setCapturedImage] = useState<string | null>(null)
    const [ocrText, setOcrText] = useState<string>("")
    const [isProcessing, setIsProcessing] = useState(false)

    const handleCapture = async (imageSrc: string) => {
        setCapturedImage(imageSrc)
        setIsProcessing(true)
        setOcrText("")

        try {

            const base64Response = await fetch(imageSrc);
            const blob = await base64Response.blob();
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" });

            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("http://localhost:8000/api/ocr", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("OCR Failed");
            }

            const data = await response.json();
            setOcrText(data.text);
        } catch (error) {
            console.error("OCR Error:", error);
            setOcrText("Failed to extract text. Please ensure the Edge Server is running.");
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/student">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">Scan Textbook</h1>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-6">
                        <CameraCapture onCapture={handleCapture} />
                        <p className="text-center text-sm text-muted-foreground">
                            Align the text within the frame and click capture.
                        </p>
                    </div>

                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Extracted Text</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[400px] overflow-y-auto rounded-md border p-4 bg-white">
                            {isProcessing ? (
                                <div className="flex h-full items-center justify-center flex-col gap-4">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <p className="text-sm text-muted-foreground">Processing with Edge AI...</p>
                                </div>
                            ) : ocrText ? (
                                <p className="whitespace-pre-wrap leading-relaxed">{ocrText}</p>
                            ) : (
                                <div className="flex h-full items-center justify-center text-muted-foreground">
                                    No text scanned yet. Capture an image to begin.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}