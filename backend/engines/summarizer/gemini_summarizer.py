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

        documents = []
        for i, url in enumerate(document_urls):
            print(f"  - Fetching content from: {url}")
            content = self._fetch_and_clean_content(url)
            if content:
                documents.append({"url": url, "content": content, "id": i + 1})

        if not documents:
            return "Could not retrieve any content to summarize."

        document_block = ""
        for doc in documents:
            document_block += f"DOCUMENT {doc['id']}\nURL: {doc['url']}\nCONTENT:\n{doc['content']}\n\n---\n\n"


        retries = 3
        delay = 2  # seconds
        for attempt in range(retries):
            try:
                prompt = (
                    "You are a text processing assistant.\n"
                    "The following text contains one or more documents, each with a URL and its CONTENT, separated by '---'.\n"
                    "Your task is to summarize each document.\n\n"
                    "For each document, provide a concise summary of its CONTENT in the document's main language.\n\n"
                    "Format your response as a series of blocks. Each block must follow this exact format:\n"
                    "[URL][The original URL for the document][/URL]\n"
                    "[SUMMARY][Your generated summary][/SUMMARY]\n\n"
                    "Do not add any other text, headers, or explanations.\n\n"
                    "--- START OF DOCUMENTS ---\n"
                    f"{document_block}"
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
                    import re
                    formatted_output = ""
                    urls = re.findall(r"\[URL\](.*?)\[/URL\]", response.text, re.DOTALL)
                    summaries = re.findall(r"\[SUMMARY\](.*?)\[/SUMMARY\]", response.text, re.DOTALL)

                    for i, (url, summary) in enumerate(zip(urls, summaries)):
                        formatted_output += f"[URL {i+1}: {url.strip()}\r\n"
                        formatted_output += f"SUMMARY: {summary.strip()}]\r\n\r\n"
                    
                    return formatted_output.strip()
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
