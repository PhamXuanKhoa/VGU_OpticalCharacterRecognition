from services.summarizer_interface import SummarizerEngine
from typing import List

class DummySummarizerEngine(SummarizerEngine):
    def summarize(self, document_urls: List[str]) -> str:
        print(f"--- [ENGINE: Dummy Summarizer] Summarizing content from {len(document_urls)} URLs ---")
        return "Dummy Summarizer: This is a simulated summary."