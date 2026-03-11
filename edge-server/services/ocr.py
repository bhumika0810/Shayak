import pytesseract
from PIL import Image
import os

class OCRService:
    def extract_text(self, image_path: str) -> str:
        if not os.path.exists(image_path):
            return "Error: Image file not found."

        try:
            image = Image.open(image_path)
            text = pytesseract.image_to_string(image)
            return text.strip()
        except Exception as e:
            print(f"OCR Error: {e}")
            return f"Error processing image: {str(e)}"

ocr_service = OCRService()

def extract_text_from_image(image_path: str) -> str:
    return ocr_service.extract_text(image_path)