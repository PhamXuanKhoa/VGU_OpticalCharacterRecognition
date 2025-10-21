from abc import ABC, abstractmethod
from typing import List

class SummarizerEngine(ABC):
    @abstractmethod
    def summarize(self, ocr_text:str, document_urls: List[str]) -> str:
        pass