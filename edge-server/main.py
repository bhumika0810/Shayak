import os
import shutil
import datetime
from typing import List, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.analytics import log_event
from services.llm import generate_response
from services.stt import transcribe_audio
from services.tts import generate_speech
from services.ocr import extract_text_from_image

app = FastAPI(title="Sahayak Edge Server", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatCompletionRequest(BaseModel):
    messages: List[ChatMessage]
    model: Optional[str] = "default"

@app.post("/v1/chat/completions")
async def chat_completions(request: ChatCompletionRequest):
    start_time = datetime.datetime.now()
    try:

        last_user_message = next((m.content for m in reversed(request.messages) if m.role == 'user'), "")

        response_text = generate_response(last_user_message)

        duration = (datetime.datetime.now() - start_time).total_seconds() * 1000
        log_event("LLM", len(last_user_message), int(duration), "Success")

        return {
            "id": "chatcmpl-mock",
            "object": "chat.completion",
            "created": int(datetime.datetime.now().timestamp()),
            "choices": [{
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": response_text
                },
                "finish_reason": "stop"
            }]
        }
    except Exception as e:
        duration = (datetime.datetime.now() - start_time).total_seconds() * 1000
        log_event("LLM", 0, int(duration), f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

TEMP_DIR = "temp"
os.makedirs(TEMP_DIR, exist_ok=True)

@app.get("/")
def read_root():
    return {"status": "online", "service": "Sahayak Edge AI", "version": "0.1.0"}

@app.post("/api/transcribe")
async def transcribe(file: UploadFile = File(...)):
    start_time = datetime.datetime.now()
    try:
        file_size = file.size
        temp_path = os.path.join(TEMP_DIR, file.filename)
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        result = transcribe_audio(temp_path)

        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
        except Exception:
            pass

        duration = (datetime.datetime.now() - start_time).total_seconds() * 1000
        log_event("STT", file_size, int(duration), "Success")

        return result
    except Exception as e:
        duration = (datetime.datetime.now() - start_time).total_seconds() * 1000
        log_event("STT", 0, int(duration), f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def chat(query: str, context: str = ""):
    start_time = datetime.datetime.now()
    try:

        prompt = query
        if context:
            prompt = f"Context: {context}\n\nQuestion: {query}"

        response = generate_response(prompt)

        duration = (datetime.datetime.now() - start_time).total_seconds() * 1000
        log_event("LLM", len(prompt), int(duration), "Success")

        return {"response": response}
    except Exception as e:
        duration = (datetime.datetime.now() - start_time).total_seconds() * 1000
        log_event("LLM", len(query), int(duration), f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/speak")
async def speak(text: str, language: str = "en"):
    start_time = datetime.datetime.now()
    try:
        audio_path = generate_speech(text, language)
        if not audio_path or not os.path.exists(audio_path):
             raise HTTPException(status_code=500, detail="TTS generation failed")

        duration = (datetime.datetime.now() - start_time).total_seconds() * 1000
        log_event("TTS", len(text), int(duration), "Success")

        return FileResponse(audio_path, media_type="audio/wav", filename="speech.wav")
    except Exception as e:
        duration = (datetime.datetime.now() - start_time).total_seconds() * 1000
        log_event("TTS", len(text), int(duration), f"Error: {str(e)}")

        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ocr")
async def ocr(file: UploadFile = File(...)):
    start_time = datetime.datetime.now()
    try:
        file_size = file.size
        temp_path = os.path.join(TEMP_DIR, file.filename)
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        text = extract_text_from_image(temp_path)

        if os.path.exists(temp_path):
             os.remove(temp_path)

        duration = (datetime.datetime.now() - start_time).total_seconds() * 1000
        log_event("OCR", file_size, int(duration), "Success")

        return {"text": text}
    except Exception as e:
        duration = (datetime.datetime.now() - start_time).total_seconds() * 1000
        log_event("OCR", 0, int(duration), f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("Starting Sahayak Edge Server...")
    uvicorn.run(app, host="127.0.0.1", port=8000)