import os
import time
from google import genai
from google.genai import types
from google.api_core import exceptions
from services.ocr_interface import OCREngine

class GeminiOCREngine(OCREngine):
    def __init__(self):
        if os.getenv("GEMINI_API_KEY") is None:
            print("WARNING: GEMINI_API_KEY environment variable is not set. Gemini API calls may fail.")
        self.client = genai.Client()

    def extract_text(self, image_path: str) -> str:
        print(f"--- [ENGINE: Google Gemini OCR] Processing image at {image_path} ---")
        
        retries = 3
        delay = 2 # seconds
        for attempt in range(retries):
            try:
                with open(image_path, 'rb') as f:
                    image_bytes = f.read()

                # Pass image data directly to the contents array [4]
                image_part = types.Part.from_bytes(
                    data=image_bytes,
                    mime_type='image/jpeg'
                )
                
                prompt_parts = [
                    "Please extract all the text from this image. If there is no text, say 'No text found.'",
                    image_part,
                ]

                config = types.GenerateContentConfig(
                    temperature=0.1,
                )

                response = self.client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt_parts,
                    config=config
                )

                if response.text:
                    return response.text.strip() # Removed prefix
                else:
                    return "No text found or unable to extract text."

            except exceptions.ServiceUnavailable as e:
                print(f"  - Gemini OCR Error: 503 Service Unavailable. Retrying in {delay} seconds... (Attempt {attempt + 1}/{retries})")
                if attempt < retries - 1:
                    time.sleep(delay)
                else:
                    print(f"Error calling Gemini API for OCR after {retries} retries: {e}")
                    return "Error extracting text - The model is overloaded. Please try again later."
            except Exception as e:
                print(f"Error calling Gemini API for OCR: {e}")
                return f"Error extracting text - {e}"
        
        return "An unexpected error occurred after retries."