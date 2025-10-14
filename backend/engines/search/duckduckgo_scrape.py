from ddgs import DDGS
from services.search_interface import SearchEngine
from typing import List

class DuckDuckGoScrapeEngine(SearchEngine):
    """
    A search engine for DuckDuckGo that uses the duckduckgo-search library.
    This engine performs a single, combined search for all keywords.
    """
    def find_related_documents(self, keywords: List[str]) -> List[str]:
        if not keywords:
            return []
        
        query = " ".join(keywords)
        print(f"--- [ENGINE: DuckDuckGo Library] Searching for: '{query}' ---")
        
        links = []
        try:
            with DDGS() as ddgs:
                results = ddgs.text(query, region='vn-vn', max_results=5)
                for r in results:
                    links.append(r['href'])
            
            print(f"Found {len(links)} links via duckduckgo-search library.")
        except Exception as e:
            print(f"Error using duckduckgo-search library: {e}")
            # Return an empty list or a list with an error message
            return [f"Error during search: {e}"]
        
        return links
