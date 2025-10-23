from ddgs import DDGS
from services.search_interface import SearchEngine
from typing import List
import random

class DuckDuckGoLongEngine(SearchEngine):
    """
    A search engine for DuckDuckGo that uses the duckduckgo-search library
    and a randomized distribution logic for long keyword lists.
    """

    def find_related_documents(self, keywords: List[str]) -> List[str]:
        TOTAL_LINKS = 20
        num_keywords = len(keywords)
        if not num_keywords:
            return []

        all_links = set()
        
        print(f"--- [ENGINE: DuckDuckGo Long] Distributing {TOTAL_LINKS} links among {num_keywords} keywords. ---")

        with DDGS() as ddgs:
            if num_keywords > TOTAL_LINKS:

                print("--- More keywords than slots. Using random selection logic. ---")
                available_keywords = list(keywords)
                initial_search_keywords = random.sample(available_keywords, TOTAL_LINKS)
                leftover_keywords = [kw for kw in available_keywords if kw not in initial_search_keywords]


                for keyword in initial_search_keywords:
                    try:
                        results = ddgs.text(keyword, region='vn-vn', max_results=1)
                        if results and results[0]['href'] not in all_links:
                            all_links.add(results[0]['href'])
                    except Exception as e:
                        print(f"Error searching DDG for keyword '{keyword}': {e}")


                if len(all_links) < TOTAL_LINKS:
                    print(f"--- Found {len(all_links)} links, filling up to {TOTAL_LINKS}... ---")
                    random.shuffle(leftover_keywords)
                    for keyword in leftover_keywords:
                        if len(all_links) >= TOTAL_LINKS:
                            break
                        try:

                            results = ddgs.text(keyword, region='vn-vn', max_results=1)
                            if results and results[0]['href'] not in all_links:
                                all_links.add(results[0]['href'])
                        except Exception as e:
                            print(f"Error searching DDG for keyword '{keyword}': {e}")
            else:

                print("--- Fewer keywords than slots. Using fair distribution logic. ---")
                links_per_kw = TOTAL_LINKS // num_keywords
                remainder = TOTAL_LINKS % num_keywords

                for i, keyword in enumerate(keywords):
                    num_to_fetch = links_per_kw + (1 if i < remainder else 0)
                    if num_to_fetch == 0:
                        continue
                    
                    print(f"--- Searching for: '{keyword}' to get {num_to_fetch} link(s) ---")
                    try:
                        results = ddgs.text(keyword, region='vn-vn', max_results=num_to_fetch)
                        for r in results:
                            if r['href'] not in all_links:
                                all_links.add(r['href'])
                    except Exception as e:
                        print(f"Error searching DDG for keyword '{keyword}': {e}")

        final_links = list(all_links)
        print(f"Found {len(final_links)} unique links in total via DuckDuckGo Long.")
        return final_links
