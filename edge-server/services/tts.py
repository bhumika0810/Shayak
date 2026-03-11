import pyttsx3
import os
import uuid
import threading

OUTPUT_DIR = "temp/tts"
os.makedirs(OUTPUT_DIR, exist_ok=True)

class TTSService:
    def __init__(self):
        try:
            self.engine = pyttsx3.init()
            self.engine.setProperty('rate', 150)
            self.voices = self.engine.getProperty('voices')
            print(f"TTS Service initialized. Found {len(self.voices)} voices.")
        except Exception as e:
            print(f"Failed to initialize pyttsx3: {e}")
            self.engine = None
            self.voices = []

    def get_voice_for_language(self, lang_code: str):

        lang_map = {
            'hi': ['hindi', 'india', 'hemant', 'kalpana'],
            'bn': ['bengali', 'bangla', 'india'],
            'ta': ['tamil', 'india'],
            'te': ['telugu', 'india'],
            'mr': ['marathi', 'india'],
            'gu': ['gujarati', 'india'],
            'kn': ['kannada', 'india'],
            'ml': ['malayalam', 'india'],
            'pa': ['punjabi', 'india'],
            'en': ['english', 'us', 'uk']
        }

        keywords = lang_map.get(lang_code.lower(), [])
        if not keywords:
            return None

        for voice in self.voices:
            for keyword in keywords:
                if keyword in voice.name.lower() or keyword in voice.id.lower():
                    return voice.id
        return None

    def generate(self, text: str, language: str = "en") -> str:
        filename = f"{uuid.uuid4()}.wav"
        output_path = os.path.join(OUTPUT_DIR, filename)

        if not self.engine:
            return ""

        try:

            target_voice = self.get_voice_for_language(language)
            if target_voice:
                self.engine.setProperty('voice', target_voice)
            else:

                for voice in self.voices:
                    if "zira" in voice.name.lower():
                        self.engine.setProperty('voice', voice.id)
                        break

            self.engine.save_to_file(text, output_path)
            self.engine.runAndWait()

            return output_path
        except Exception as e:
            print(f"TTS Error: {e}")
            return ""

tts_service = TTSService()

def generate_speech(text: str, language: str = "en") -> str:
    return tts_service.generate(text, language)