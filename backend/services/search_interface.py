from abc import ABC, abstractmethod
from typing import List

class SearchEngine(ABC):
    @abstractmethod
    def find_related_documents(self, keywords: List[str]) -> List[str]:
        pass