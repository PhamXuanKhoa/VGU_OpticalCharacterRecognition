from abc import ABC, abstractmethod
from typing import List

class SummarizerEngine(ABC):
    @abstractmethod
    def summarize(self, document_urls: List[str]) -> str:
        pass