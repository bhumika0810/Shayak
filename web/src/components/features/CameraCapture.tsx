"use client"

import React, { useRef, useState, useCallback } from "react"
import Webcam from "react-webcam"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, RefreshCw } from "lucide-react"

interface CameraCaptureProps {
    onCapture: (imageSrc: string) => void
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
    const webcamRef = useRef<Webcam>(null)
    const [image, setImage] = useState<string | null>(null)

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot()
        if (imageSrc) {
            setImage(imageSrc)
            onCapture(imageSrc)
        }
    }, [webcamRef, onCapture])

    const retake = () => {
        setImage(null)
    }

    return (
        <Card className="w-full max-w-md mx-auto overflow-hidden">
            <CardContent className="p-0 relative bg-black aspect-video flex items-center justify-center">
                {image ? (
                    <img src={image} alt="Captured" className="w-full h-full object-contain" />
                ) : (
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full h-full object-cover"
                        videoConstraints={{
                            facingMode: "environment"
                        }}
                    />
                )}
            </CardContent>
            <div className="p-4 flex justify-center gap-4 bg-white">
                {image ? (
                    <Button onClick={retake} variant="outline" className="w-full">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retake
                    </Button>
                ) : (
                    <Button onClick={capture} className="w-full">
                        <Camera className="mr-2 h-4 w-4" />
                        Capture Photo
                    </Button>
                )}
            </div>
        </Card>
    )
}