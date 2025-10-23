
import spacy
from services.nlp_interface import NLPEngine
from typing import List

class SpacyNLPEngine(NLPEngine):
    def __init__(self):
        try:
            self.nlp = spacy.load("vi_core_news_lg")
        except OSError:
            print("Downloading Vietnamese spacy model 'vi_core_news_lg'...")
            from spacy.cli import download
            download("vi_core_news_lg")
            self.nlp = spacy.load("vi_core_news_lg")

    def find_keywords(self, text: str) -> List[str]:
        print(f"--- [ENGINE: Spacy NLP] Finding keywords in text: '{text[:50]}...' ---")
        doc = self.nlp(text)
        keywords = [token.lemma_ for token in doc if token.pos_ in ["NOUN", "PROPN"]]
        print(f"Spacy NLP extracted keywords: {keywords}")
        return list(set(keywords))
