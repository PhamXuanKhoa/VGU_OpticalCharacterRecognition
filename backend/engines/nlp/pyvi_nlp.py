from pyvi import ViTokenizer, ViPosTagger
from services.nlp_interface import NLPEngine
from typing import List

class PyviNLPEngine(NLPEngine):
    def __init__(self):
        pass

    def find_keywords(self, text: str) -> List[str]:
        print(f"--- [ENGINE: Pyvi NLP] Finding keywords in text: '{text[:50]}...' ---")
        tokens = ViTokenizer.tokenize(text)
        pos_tags = ViPosTagger.postagging(tokens)
        
        keywords = []
        for i in range(len(pos_tags[0])):
            if pos_tags[1][i] in ['N', 'Np']:
                keyword = pos_tags[0][i].replace("_", " ")
                keywords.append(keyword)
        
        print(f"Pyvi NLP extracted keywords: {keywords}")
        return list(set(keywords))