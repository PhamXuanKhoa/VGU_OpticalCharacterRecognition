from abc import ABC, abstractmethod
from typing import List

class NLPEngine(ABC):
    @abstractmethod
    def find_keywords(self, text: str) -> List[str]:
        pass