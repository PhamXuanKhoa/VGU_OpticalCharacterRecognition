import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from services.summarizer_interface import SummarizerEngine
from typing import List
import os
import requests
from bs4 import BeautifulSoup

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

        all_summaries = []

        for i, url in enumerate(document_urls):
            print(f"  - Summarizing ({i+1}/{len(document_urls)}): {url}")
            content = self._fetch_and_clean_content(url)

            if not content:
                summary = "Could not retrieve content from URL."
            else:
                chat = [
                    { "role": "user", "content": f"Please provide a concise summary of the following text in the document's main language:\n\n---\n{content}\n---" },
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

                # Extract only the generated part of the response
                response_start_index = response.find(chat[0]['content']) + len(chat[0]['content'])
                model_response = response[response_start_index:].strip()
                
                # The model might add extra text, so we look for the part after "model"
                model_keyword_index = model_response.find('model')
                if model_keyword_index != -1:
                    model_response = model_response[model_keyword_index+len('model'):].strip()

                summary = model_response if model_response else "Failed to generate a summary."

            # Format the output for each URL
            formatted_output = f"[URL {i+1}: {url}]\r\n[SUMMARY: {summary}]\r\n\r\n"
            all_summaries.append(formatted_output)

        if not all_summaries:
            return "No content could be summarized."

        return "".join(all_summaries).strip()
