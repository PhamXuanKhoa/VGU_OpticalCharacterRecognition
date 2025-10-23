import time
import os


from services.stanford_nlp import StanfordNLPEngine
from services.underthesea_nlp import UndertheseaNLP
from services.pyvi_nlp import PyviNLPEngine
from services.gemma_nlp import GemmaNLPEngine

def run_multi_test():
    """
    Initializes and tests multiple NLP engines on a list of Vietnamese texts.
    """
    test_texts = [
        {
            "name": "Factual Description (Vịnh Hạ Long)",
            "text": """
            Vịnh Hạ Long là một di sản thiên nhiên thế giới được UNESCO công nhận, 
            nằm ở tỉnh Quảng Ninh, Việt Nam. Vẻ đẹp của vịnh được tạo nên bởi hàng 
            ngàn hòn đảo đá vôi với hình thù kỳ vĩ và những hang động tuyệt đẹp.
            """
        },
        {
            "name": "News Article (VinFast)",
            "text": """
            VinFast, thành viên của tập đoàn Vingroup, đã chính thức ra mắt mẫu xe điện 
            VF 9 tại thị trường Mỹ. Sự kiện này đánh dấu một bước tiến quan trọng trong 
            chiến lược vươn ra toàn cầu của hãng xe Việt Nam, khẳng định tham vọng 
            cạnh tranh sòng phẳng với các thương hiệu lớn trên thế giới.
            """
        },
        {
            "name": "Cultural Description (Phở)",
            "text": """
            Phở là một món ăn truyền thống của Việt Nam, được xem là một trong những 
            món ăn tiêu biểu cho ẩm thực Việt. Thành phần chính của phở là bánh phở 
            và nước dùng đậm đà được ninh từ xương bò cùng nhiều loại gia vị.
            """
        }
    ]

    engines_to_test = {
        "Stanza (Stanford)": StanfordNLPEngine,
        "Underthesea": UndertheseaNLP,
        "Pyvi": PyviNLPEngine,
        "Gemma": GemmaNLPEngine
    }

    for i, test_data in enumerate(test_texts):
        print("="*80)
        print(f"                 TEST CASE {i+1}: {test_data['name']}")
        print("="*80)
        text_to_analyze = test_data['text']
        print(f"Input Text: \"{text_to_analyze.strip()[:70]}...\"\n")

        for name, EngineClass in engines_to_test.items():
            print(f"--- Testing Engine: {name} ---")
            
            try:
                start_time = time.time()
                engine = EngineClass()
                keywords = engine.find_keywords(text_to_analyze)
                end_time = time.time()
                duration = end_time - start_time
                
                print(f"\n[RESULTS FOR {name}]")
                print(f"  - Extracted Keywords: {sorted(list(set(keywords)))}")
                print(f"  - Time Taken: {duration:.4f} seconds")

            except Exception as e:
                print(f"\n[ERROR FOR {name}]")
                print(f"  - An error occurred: {e}")
            
            print("-" * 70 + "\n")

if __name__ == "__main__":
    run_multi_test()