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

    def summarize(self, ocr_text: str, document_urls: List[str]) -> str:
        print(f"--- [ENGINE: Google Gemini Summarizer] Summarizing content from {len(document_urls)} URLs in a single API call ---")

        successful_documents = []
        failed_urls = []
        for i, url in enumerate(document_urls):
            print(f"  - Fetching content from: {url}")
            content = self._fetch_and_clean_content(url)
            if content:
                successful_documents.append({"url": url, "content": content, "id": i + 1})
            else:
                failed_urls.append(url)

        if not successful_documents:
            return "Could not retrieve any content to summarize."

        document_block = ""
        for doc in successful_documents:
            document_block += f"DOCUMENT {doc['id']}\nURL: {doc['url']}\nCONTENT:\n{doc['content']}\n\n---\n\n"

        summaries_text = ""
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
                    summaries_text = response.text
                    break
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
        
        if not summaries_text:
            return "An unexpected error occurred after retries."

        import re
        urls = re.findall(r"\[URL\](.*?)\[/URL\]", summaries_text, re.DOTALL)
        summaries = re.findall(r"\[SUMMARY\](.*?)\[/SUMMARY\]", summaries_text, re.DOTALL)

        # Second API call for rating
        ratings_text = ""
        for attempt in range(retries):
            try:
                rating_prompt = (
                    "You are a text processing assistant.\n"
                    f"Here is the original text that was scanned: \n\n---\n{ocr_text}\n---\n\n"
                    "The following text contains one or more summaries of documents.\n"
                    "Your task is to rate the relevance of each summary to the original scanned text on a scale of 1-10 (1=Not relevant, 10=Highly relevant).\n\n"
                    "Format your response as a series of blocks. Each block must follow this exact format:\n"
                    "[RATING][Your generated rating (e.g., 8/10)][/RATING]\n\n"
                    "Do not add any other text, headers, or explanations.\n\n"
                    "--- START OF SUMMARIES ---\n"
                    f"{summaries_text}"
                    "--- END OF SUMMARIES ---"
                )

                config = types.GenerateContentConfig(temperature=0.2)
                
                model_name = "gemini-2.5-flash"
                
                response = self.client.models.generate_content(
                    model=model_name,
                    contents=rating_prompt,
                    config=config
                )

                if response.text:
                    ratings_text = response.text
                    break
                else:
                    return "Failed to generate ratings."

            except exceptions.ServiceUnavailable as e:
                print(f"  - Gemini Summarizer Error: 503 Service Unavailable. Retrying in {delay} seconds... (Attempt {attempt + 1}/{retries})")
                if attempt < retries - 1:
                    time.sleep(delay)
                else:
                    return "Error generating ratings - The model is overloaded. Please try again later."
            except Exception as e:
                print(f"Error calling Gemini API for rating: {e}")
                return f"Error generating ratings - {e}"

        if not ratings_text:
            return "An unexpected error occurred while generating ratings."

        ratings = re.findall(r"\[RATING\](.*?)\[/RATING\]", ratings_text, re.DOTALL)

        # Create a list of summary objects
        summary_objects = []
        for i, (url, summary, rating) in enumerate(zip(urls, summaries, ratings)):
            try:
                # Extract the numerical rating for sorting
                rating_value = int(rating.strip().split('/')[0])
                summary_objects.append({
                    "url": url.strip(),
                    "summary": summary.strip(),
                    "rating": rating.strip(),
                    "rating_value": rating_value
                })
            except (ValueError, IndexError):
                # Handle cases where rating is not in the expected format
                summary_objects.append({
                    "url": url.strip(),
                    "summary": summary.strip(),
                    "rating": rating.strip(),
                    "rating_value": 0  # Default to 0 if parsing fails
                })

        for url in failed_urls:
            summary_objects.append({
                "url": url,
                "summary": "Could not retrieve content from URL.",
                "rating": "0/10",
                "rating_value": 0
            })

        # Sort the summaries by rating in descending order
        summary_objects.sort(key=lambda x: x["rating_value"], reverse=True)

        # Format the final output string
        formatted_output = ""
        for i, summary_obj in enumerate(summary_objects):
            formatted_output += f"[URL {i+1}: {summary_obj['url']}\r\n"
            formatted_output += f"RATING: {summary_obj['rating']}\r\n"
            formatted_output += f"SUMMARY: {summary_obj['summary']}]\r\n\r\n"
        
        return formatted_output.strip()
