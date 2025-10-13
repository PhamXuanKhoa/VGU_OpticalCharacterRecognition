from services.ocr_interface import OCREngine
import easyocr

class EasyOCREngine(OCREngine):
    def __init__(self):
        self.reader = easyocr.Reader(['vi', 'en'])

    def extract_text(self, image_path: str) -> str:
        result = self.reader.readtext(image_path)
        return ' '.join([detection[1] for detection in result])
