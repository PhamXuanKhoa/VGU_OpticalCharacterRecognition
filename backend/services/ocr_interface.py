from abc import ABC, abstractmethod

class OCREngine(ABC):
    @abstractmethod
    def extract_text(self, image_path: str) -> str:
        pass