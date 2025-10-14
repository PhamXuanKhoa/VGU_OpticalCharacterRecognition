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
        print(f"--- [ENGINE: Google Gemini Summarizer] Summarizing content from {len(document_urls)} URLs in a single API call ---")

        content_parts = []
        for url in document_urls:
            print(f"  - Fetching content from: {url}")
            content = self._fetch_and_clean_content(url)
            if content:
                content_parts.append(f"URL: {url}\nCONTENT:\n{content}")

        if not content_parts:
            return "Could not retrieve any content to summarize."

        full_text_block = "\n\n---\n\n".join(content_parts)

        retries = 3
        delay = 2  # seconds
        for attempt in range(retries):
            try:
                prompt = (
                    "You are a text processing assistant. The following text contains one or more documents, each with a URL and its CONTENT, separated by '--'.\n"
                    "Your task is to:\n"
                    "1. Read each document individually.\n"
                    "2. For each document, create a concise summary of its CONTENT.\n"
                    "3. Format your entire response as a list, where each item follows this exact format:\n"
                    "URL: [The original URL for the document]\n"
                    "SUMMARY: [Your generated summary for that document's content]\n\n"
                    "Ensure each item is separated by two newlines. Do not include any other text, headers, or explanations in your response.\n\n"
                    "--- START OF DOCUMENTS ---\n"
                    f"{full_text_block}\n"
                    "--- END OF DOCUMENTS ---"
                )

                config = types.GenerateContentConfig(temperature=0.5)
                
                model_name = "gemini-2.5-flash" 
                
                response = self.client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=config
                )

                if response.text:
                    return response.text.strip()
                else:
                    return "Failed to generate a summary."

            except exceptions.ServiceUnavailable as e:
                print(f"  - Gemini Summarizer Error: 503 Service Unavailable. Retrying in {delay} seconds... (Attempt {attempt + 1}/{retries})")
                if attempt < retries - 1:
                    time.sleep(delay)
                else:
                    return "Error generating summary - The model is overloaded. Please try again later."
            except Exception as e:
                print(f"Error calling Gemini API for summarization: {e}")
                return f"Error generating summary - {e}"
        
        return "An unexpected error occurred after retries."
