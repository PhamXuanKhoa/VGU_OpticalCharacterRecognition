from services.ocr_interface import OCREngine
from PIL import Image
import pytesseract

class PytesseractOCREngine(OCREngine):
    def extract_text(self, image_path: str) -> str:
        """
        Extracts text from an image using Pytesseract with the Vietnamese language model.

        Args:
            image_path: The absolute path to the image file.

        Returns:
            The extracted text as a string.
        """
        try:
            image = Image.open(image_path)
            text = pytesseract.image_to_string(image, lang='vie')
            return text
        except Exception as e:
            # Handle cases where Tesseract is not installed or language data is missing
            print(f"Pytesseract error: {e}")
            return "Error processing image with Pytesseract. Ensure Tesseract is installed and the 'vie' language data is available."
