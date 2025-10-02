import requests
from bs4 import BeautifulSoup
from services.search_interface import SearchEngine
from typing import List

class DuckDuckGoScrapeEngine(SearchEngine):
    def find_related_documents(self, keywords: List[str]) -> List[str]:
        # Combine keywords into a search query
        query = "+".join(keywords)
        url = f"https://html.duckduckgo.com/html/?q={query}"
        print(f"--- [ENGINE: DuckDuckGo Scraper] Searching at: '{url}' ---")
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        }

        try:
            # Make the request and parse the HTML
            response = requests.get(url, headers=headers)
            response.raise_for_status() # Raise an exception for bad status codes
            soup = BeautifulSoup(response.text, 'html.parser')

            # Find result links. This selector is specific to DuckDuckGo's HTML version and might break.
            links = []
            for result in soup.find_all('a', class_='result__a'):
                links.append(result['href'])
                if len(links) >= 5: # Limit to 5 results
                    break
            
            print(f"Found {len(links)} links via scraping.")
            return links
        except Exception as e:
            print(f"Error scraping DuckDuckGo: {e}")
            return [f"Error during scraping: {e}"]
