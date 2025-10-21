import os
import time
from google import genai
from google.genai import types
from google.api_core import exceptions
from services.nlp_interface import NLPEngine
from typing import List

class GeminiNLPEngine(NLPEngine):
    def __init__(self):
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if not gemini_api_key:
            print("WARNING: GEMINI_API_KEY environment variable is not set. Gemini API calls may fail.")
        self.client = genai.Client(api_key=gemini_api_key)

    def find_keywords(self, text: str) -> List[str]:
        print(f"--- [ENGINE: Google Gemini NLP] Finding keywords in text: '{text[:50]}...' ---")
        
        retries = 3
        delay = 2 # seconds
        for attempt in range(retries):
            try:
                prompt = (
                    "From the following text, please extract important keywords. These keywords should be specific and represent the main topics of the text to be use for websearch. It should not be too many and should not be too little."
                    "Return them as a single line of comma-separated values. For example: keyword1, keyword2, keyword3.\n\n"
                    f"Text: \"{text}\"")

                config = types.GenerateContentConfig(
                    temperature=0.2,
                )

                response = self.client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt,
                    config=config
                )

                if response.text:
                    keywords = [keyword.strip() for keyword in response.text.strip().split(',')]
                    print(f"Gemini NLP extracted keywords: {keywords}")
                    return keywords
                else:
                    return []

            except exceptions.ServiceUnavailable as e:
                print(f"  - Gemini NLP Error: 503 Service Unavailable. Retrying in {delay} seconds... (Attempt {attempt + 1}/{retries})")
                if attempt < retries - 1:
                    time.sleep(delay)
                else:
                    print(f"Error calling Gemini API for NLP after {retries} retries: {e}")
                    return ["Error: The model is overloaded. Please try again later."]
            except Exception as e:
                print(f"Error calling Gemini API for NLP: {e}")
                return [f"Error extracting keywords: {e}"]
        
        return ["Error: An unexpected error occurred after retries."]