from services.nlp_interface import NLPEngine
from underthesea import pos_tag
from typing import List

class UndertheseaNLP(NLPEngine):
    def find_keywords(self, text: str) -> List[str]:
        """Extracts noun phrases as keywords from the text."""
        pos_tags = pos_tag(text)
        keywords = []
        current_keyword = ""
        for word, tag in pos_tags:
            if tag in ['N', 'Np']:
                current_keyword += word + " "
            else:
                if current_keyword:
                    keywords.append(current_keyword.strip())
                    current_keyword = ""
        if current_keyword:
            keywords.append(current_keyword.strip())
        return list(set(keywords))
