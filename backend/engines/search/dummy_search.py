from services.search_interface import SearchEngine
from typing import List

class DummySearchEngine(SearchEngine):
    def find_related_documents(self, keywords: List[str]) -> List[str]:
        print(f"--- [ENGINE: Dummy Search] Searching for documents with keywords: {keywords} ---")
        return [
            "https://github.com/PhamXuanKhoa/VGU_OpticalCharacterRecognition"
            "https://dummy.com/search-result-1",
            "https://dummy.com/search-result-2",
        ]