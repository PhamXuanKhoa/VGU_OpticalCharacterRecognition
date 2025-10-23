import arxiv
from typing import List
from services.search_interface import SearchEngine

class ArxivSearchEngine(SearchEngine):
    """
    A search engine for arXiv that uses the official 'arxiv' library.
    """

    def find_related_documents(self, keywords: List[str]) -> List[str]:
        """
        Searches arXiv for a given list of keywords and returns a list of result URLs,
        distributing a total of 10 search slots among the keywords.
        """
        TOTAL_LINKS = 10
        num_keywords = len(keywords)
        if not num_keywords:
            return []

        all_links = set()
        client = arxiv.Client()

        links_per_kw = TOTAL_LINKS // num_keywords if num_keywords > 0 else 0
        remainder = TOTAL_LINKS % num_keywords if num_keywords > 0 else 0

        print(f"--- [ENGINE: arXiv Library] Distributing {TOTAL_LINKS} links among {num_keywords} keywords. ---")

        for i, keyword in enumerate(keywords):

            num_to_fetch = links_per_kw + (1 if i < remainder else 0)
            

            if num_keywords > TOTAL_LINKS:
                if i < TOTAL_LINKS:
                    num_to_fetch = 1
                else:

                    break
            
            if num_to_fetch == 0:
                continue

            print(f"--- Searching for: '{keyword}' to get {num_to_fetch} link(s) ---")
            
            try:
                search = arxiv.Search(
                    query=keyword,
                    max_results=num_to_fetch,
                    sort_by=arxiv.SortCriterion.Relevance
                )
                results = client.results(search)
                for r in results:
                    all_links.add(r.entry_id)
            except Exception as e:
                print(f"Error searching for keyword '{keyword}': {e}")

        final_links = list(all_links)
        print(f"Found {len(final_links)} unique links in total via arXiv library.")
        return final_links
