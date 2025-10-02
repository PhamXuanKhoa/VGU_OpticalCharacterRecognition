from services.ocr_interface import OCREngine

class DummyOCREngine(OCREngine):
    def extract_text(self, image_path: str) -> str:
        print(f"--- [ENGINE: Dummy OCR] 'Processing' image at {image_path} ---")
        return "Dummy OCR: Đây là văn bản giả lập."