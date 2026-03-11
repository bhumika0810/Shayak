from faster_whisper import WhisperModel
import os

MODEL_SIZE = "tiny"
DEVICE = "cpu"
COMPUTE_TYPE = "int8"

class STTService:
    def __init__(self):
        print(f"Loading Whisper model ({MODEL_SIZE})...")
        try:
            self.model = WhisperModel(MODEL_SIZE, device=DEVICE, compute_type=COMPUTE_TYPE)
            print("Whisper model loaded successfully.")
        except Exception as e:
            print(f"Failed to load Whisper model: {e}")
            self.model = None

    def transcribe(self, audio_path: str) -> str:
        if not self.model:
            return "Error: STT Model not loaded."

        try:
            segments, info = self.model.transcribe(audio_path, beam_size=5)
            text = " ".join([segment.text for segment in segments])
            return {"text": text.strip(), "language": info.language}
        except Exception as e:
            print(f"Transcription error: {e}")
            return f"Error during transcription: {str(e)}"

stt_service = STTService()

def transcribe_audio(audio_path: str) -> dict:
    return stt_service.transcribe(audio_path)