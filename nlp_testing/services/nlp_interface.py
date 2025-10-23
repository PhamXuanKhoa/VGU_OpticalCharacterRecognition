from abc import ABC, abstractmethod
from typing import List

class NLPEngine(ABC):
    @abstractmethod
    def find_keywords(self, text: str) -> List[str]:
        """
        An abstract method that takes a string of text and 
        returns a list of keywords.
        """
        pass