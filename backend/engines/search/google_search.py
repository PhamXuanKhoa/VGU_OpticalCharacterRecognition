import os
from googleapiclient.discovery import build
from services.search_interface import SearchEngine
from typing import List

class GoogleSearchEngine(SearchEngine):
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        self.cse_id = os.getenv("GOOGLE_CSE_ID")
        if not self.api_key or not self.cse_id:
            print("WARNING: GOOGLE_API_KEY or GOOGLE_CSE_ID environment variables are not set. Google Search API calls will fail.")
        

        self.service = build("customsearch", "v1", developerKey=self.api_key)

    def find_related_documents(self, keywords: List[str]) -> List[str]:
        if not self.api_key or not self.cse_id:
            return ["Error: Google API credentials are not configured."]


        query = " ".join(keywords)
        print(f"--- [ENGINE: Google Search API] Searching for: '{query}' ---")
        
        try:

            result = self.service.cse().list(
                q=query,
                cx=self.cse_id,
                num=10
            ).execute()


            items = result.get('items', [])
            links = [item['link'] for item in items]
            
            print(f"Found {len(links)} links.")
            return links
        except Exception as e:
            print(f"Error calling Google Search API: {e}")
            return [f"Error during search: {e}"]