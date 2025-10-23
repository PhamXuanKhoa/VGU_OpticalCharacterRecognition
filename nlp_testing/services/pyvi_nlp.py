from services.nlp_interface import NLPEngine
from pyvi import ViTokenizer, ViPosTagger
from typing import List

class PyviNLPEngine(NLPEngine):
    def find_keywords(self, text: str) -> List[str]:
        # Tokenize the text
        tokenized_text = ViTokenizer.tokenize(text)
        
        # Perform Part-of-Speech tagging
        # The output is a tuple of two lists: (words, pos_tags)
        words, pos_tags = ViPosTagger.postagging(tokenized_text)
        
        # Filter for nouns (N) and proper nouns (Np)
        keywords = []
        for i, tag in enumerate(pos_tags):
            if tag in ['N', 'Np']:
                # Pyvi replaces spaces with underscores, so we change them back
                keywords.append(words[i].replace("_", " "))
                
        return keywords
