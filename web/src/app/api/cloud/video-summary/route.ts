import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = process.env.GOOGLE_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY) : null;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("Cloud: Received video content for summarization");

        if (!genAI) {
            console.warn("Cloud: No GOOGLE_API_KEY found. Using mock response.");
            await new Promise(resolve => setTimeout(resolve, 1000));
            return NextResponse.json({
                success: true,
                summary: "Mock Summary (Real API Key Missing): This video covers fundamental concepts. Please set GOOGLE_API_KEY in .env.local to get real AI summaries.",
                key_points: ["Mock Point 1", "Mock Point 2"],
                mode: "mock_fallback"
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const transcript = body.transcript || "Math lesson about algebra and linear equations.";

        const prompt = `
    You are an expert educational assistant. Summarize the following lesson transcript for a student.
    Provide a concise summary and 3 key bullet points.

    Transcript: "${transcript}"

    Output Format (JSON):
    {
        "summary": "...",
        "key_points": ["...", "...", "..."]
    }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);

        return NextResponse.json({
            success: true,
            summary: data.summary,
            key_points: data.key_points,
            mode: "real"
        });

    } catch (error) {
        console.error("Cloud AI Error:", error);
        return NextResponse.json({ success: false, error: 'AI processing failed' }, { status: 500 });
    }
}