import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from services.nlp_interface import NLPEngine
from typing import List
import os

class GemmaNLPEngine(NLPEngine):
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

    def find_keywords(self, text: str) -> List[str]:
        print(f"--- [ENGINE: Gemma NLP] Finding keywords in text: '{text[:50]}' ... --- ")

        # Create a prompt for keyword extraction
        chat = [
            { "role": "user", "content": f"From the following text, please extract the most important keywords that represent the main topics. Return them as a single line of comma-separated values. For example: keyword1, keyword2, keyword3.\n\nText: \"{text}\"" },
        ]

        # Apply the chat template
        prompt = self.tokenizer.apply_chat_template(chat, tokenize=False, add_generation_prompt=True)

        # Tokenize the input
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)

        # Generate a response
        outputs = self.model.generate(
            **inputs,
            max_new_tokens=256,
            temperature=0.1,
            do_sample=True,
            top_k=64,
            top_p=0.95
        )

        # Decode the response
        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

        # The response will contain the original prompt, so we need to extract just the generated part.
        # The generated part starts after the user's content.
        response_start_index = response.find(chat[0]['content']) + len(chat[0]['content'])
        model_response = response[response_start_index:].strip()
        
        # The model might add extra text, so we look for the part after "model"
        model_keyword_index = model_response.find('model')
        if model_keyword_index != -1:
            model_response = model_response[model_keyword_index+len('model'):].strip()


        if model_response:
            keywords = [keyword.strip() for keyword in model_response.split(',')]
            return keywords
        else:
            return []
