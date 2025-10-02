import os
import time
import requests
from bs4 import BeautifulSoup
from google import genai
from google.genai import types
from google.api_core import exceptions
from services.summarizer_interface import SummarizerEngine
from typing import List

class GeminiSummarizerEngine(SummarizerEngine):
    def __init__(self):
        if os.getenv("GEMINI_API_KEY") is None:
            print("WARNING: GEMINI_API_KEY environment variable is not set. Gemini API calls may fail.")
        self.client = genai.Client()

    def _fetch_and_clean_content(self, url: str) -> str:
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            for script_or_style in soup(['script', 'style']):
                script_or_style.decompose()
            paragraphs = soup.find_all('p')
            text = ' '.join(p.get_text() for p in paragraphs)
            return text.strip()
        except Exception as e:
            print(f"  - Could not fetch or parse content from {url}: {e}")
            return ""

    def summarize(self, document_urls: List[str]) -> str:
        print(f"--- [ENGINE: Google Gemini Summarizer] Summarizing content from {len(document_urls)} URLs ---")
        
        full_text = ""
        for url in document_urls:
            print(f"  - Fetching content from: {url}")
            content = self._fetch_and_clean_content(url)
            if content:
                full_text += content + "\n\n"
        
        if not full_text.strip():
            return "Could not retrieve any content to summarize."

        retries = 3
        delay = 2 # seconds
        for attempt in range(retries):
            try:
                prompt = (
                    "Based on the following text compiled from multiple sources, please provide a concise, well-structured summary. "
                    "Synthesize the key points into a coherent overview(respone in the main language of the content and in plain text, no markdown).\n\n"
                    "--- Combined Text ---\n"
                    f"{full_text}"
                )

                config = types.GenerateContentConfig(
                    temperature=0.5,
                )

                response = self.client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt,
                    config=config
                )

                if response.text:
                    return response.text.strip() # Removed prefix
                else:
                    return "Failed to generate a summary."

            except exceptions.ServiceUnavailable as e:
                print(f"  - Gemini Summarizer Error: 503 Service Unavailable. Retrying in {delay} seconds... (Attempt {attempt + 1}/{retries})")
                if attempt < retries - 1:
                    time.sleep(delay)
                else:
                    print(f"Error calling Gemini API for summarization after {retries} retries: {e}")
                    return "Error generating summary - The model is overloaded. Please try again later."
            except Exception as e:
                print(f"Error calling Gemini API for summarization: {e}")
                return f"Error generating summary - {e}"
        
        return "An unexpected error occurred after retries."