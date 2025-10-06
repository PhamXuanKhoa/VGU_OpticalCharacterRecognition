import stanza
from services.nlp_interface import NLPEngine
from typing import List, cast
from stanza.models.common.doc import Document

class StanfordNLPEngine(NLPEngine):
    def __init__(self):
        print("Loading Stanza pipeline...")
        try:
            self.nlp = stanza.Pipeline(lang='vi', processors='tokenize,pos,lemma')
            print("Pipeline loaded.")
        except Exception as e:
            print(f"Error loading Stanza pipeline: {e}")
            # Download the model if it's missing
            stanza.download('vi')
            self.nlp = stanza.Pipeline(lang='vi', processors='tokenize,pos,lemma')
            print("Pipeline loaded after downloading.")

    def find_keywords(self, text: str) -> List[str]:
        print(f"--- [ENGINE: Stanford NLP] Finding keywords in text: '{text[:30]}...' ---")
        doc = cast(Document, self.nlp(text))
        keywords = []
        unique_keywords = set()

        for sentence in doc.sentences:
            for word in sentence.words:
                if word.upos in ['NOUN', 'PROPN']:
                    unique_keywords.add(word.lemma.lower())
        
        keywords = list(unique_keywords)
        print(f"Stanford NLP extracted keywords: {keywords}")
        return keywords
