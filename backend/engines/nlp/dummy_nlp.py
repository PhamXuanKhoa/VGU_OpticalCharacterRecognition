from services.nlp_interface import NLPEngine
from typing import List

class DummyNLPEngine(NLPEngine):
    def find_keywords(self, text: str) -> List[str]:
        print(f"--- [ENGINE: Dummy NLP] Finding keywords in text: '{text[:30]}...' ---")
        return ["Dummy", "phân tích", "từ khóa"]