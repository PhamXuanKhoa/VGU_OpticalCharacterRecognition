import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from services.summarizer_interface import SummarizerEngine
from typing import List
import os
import requests
from bs4 import BeautifulSoup
import re

class GemmaSummarizerEngine(SummarizerEngine):
    def __init__(self):
        # Set the model ID
        model_id = "google/gemma-3-270m-it"
        token = os.getenv("HUGGING_FACE_HUB_TOKEN")

        # Load the tokenizer and model
        self.tokenizer = AutoTokenizer.from_pretrained(model_id, token=token)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_id,
            dtype=torch.bfloat16,
            token=token
        )

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
        print(f"--- [ENGINE: Gemma Summarizer] Summarizing content from {len(document_urls)} URLs, one at a time ---")

        summary_objects = []

        for i, url in enumerate(document_urls):
            print(f"  - Summarizing ({i+1}/{len(document_urls)}): {url}")
            content = self._fetch_and_clean_content(url)

            if not content:
                summary = "Could not retrieve content from URL."
                rating = "0/10"
            else:
                # First API call for summary
                chat = [
                    { "role": "user", "content": f"Please provide a concise summary of the following text in the document's language:\n\n---\n{content}\n---" },
                ]

                prompt = self.tokenizer.apply_chat_template(chat, tokenize=False, add_generation_prompt=True)
                inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
                
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=512,
                    temperature=1.0,
                    do_sample=True,
                    top_k=64,
                    top_p=0.95
                )
                
                response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

                response_start_index = response.find(chat[0]['content']) + len(chat[0]['content'])
                model_response = response[response_start_index:].strip()
                
                model_keyword_index = model_response.find('model')
                if model_keyword_index != -1:
                    model_response = model_response[model_keyword_index+len('model'):].strip()

                summary = model_response if model_response else "Failed to generate a summary."

                # Second API call for rating
                rating_chat = [
                    { "role": "user", "content": f"Here is the original text: '{ocr_text}'. Here is a summary of a document: '{summary}'. Please rate the relevance of the summary to the original text on a scale of 1-10 and return only the rating in the format 'X/10'." },
                ]

                rating_prompt = self.tokenizer.apply_chat_template(rating_chat, tokenize=False, add_generation_prompt=True)
                rating_inputs = self.tokenizer(rating_prompt, return_tensors="pt").to(self.model.device)

                rating_outputs = self.model.generate(
                    **rating_inputs,
                    max_new_tokens=10,
                    temperature=1.0,
                    do_sample=True,
                    top_k=64,
                    top_p=0.95
                )

                rating_response = self.tokenizer.decode(rating_outputs[0], skip_special_tokens=True)
                
                rating_response_start_index = rating_response.find(rating_chat[0]['content']) + len(rating_chat[0]['content'])
                rating_model_response = rating_response[rating_response_start_index:].strip()

                rating_model_keyword_index = rating_model_response.find('model')
                if rating_model_keyword_index != -1:
                    rating_model_response = rating_model_response[rating_model_keyword_index+len('model'):].strip()

                # Extract rating using regex
                rating_match = re.search(r'(\d{1,2}/10)', rating_model_response)
                rating = rating_match.group(1) if rating_match else "0/10"

            try:
                rating_value = int(rating.split('/')[0])
            except (ValueError, IndexError):
                rating_value = 0

            summary_objects.append({
                "url": url,
                "summary": summary,
                "rating": rating,
                "rating_value": rating_value
            })

        if not summary_objects:
            return "No content could be summarized."

        # Sort the summaries by rating in descending order
        summary_objects.sort(key=lambda x: x["rating_value"], reverse=True)

        # Format the final output string
        formatted_output = ""
        for i, summary_obj in enumerate(summary_objects):
            formatted_output += f"[URL {i+1}: {summary_obj['url']}]\r\n"
            formatted_output += f"RATING: {summary_obj['rating']}\r\n"
            formatted_output += f"SUMMARY: {summary_obj['summary']}\r\n\r\n"

        return formatted_output.strip()
