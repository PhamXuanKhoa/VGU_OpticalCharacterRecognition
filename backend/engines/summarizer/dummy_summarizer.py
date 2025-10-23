from services.summarizer_interface import SummarizerEngine
from typing import List


class DummySummarizerEngine(SummarizerEngine):
    def summarize(self, ocr_text: str, document_urls: List[str]) -> str:
        print(f"--- [ENGINE: Dummy Summarizer] Summarizing content from {len(document_urls)} URLs ---")

        return """[URL 1: https://github.com/PhamXuanKhoa/VGU_OpticalCharacterRecognition

RATING: 10/10

SUMMARY: VGU_OpticalCharacterRecognition is a comprehensive, full-stack application for advanced Optical Character Recognition (OCR) and document processing. It combines a high-performance Python FastAPI backend with a modern React/Vite frontend to offer a robust platform for text analysis.]"""