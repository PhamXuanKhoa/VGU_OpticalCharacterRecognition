from typing import List

from engines.ocr.dummy_ocr import DummyOCREngine
from engines.ocr.gemini_ocr import GeminiOCREngine
from engines.ocr.vietocr import VietOCRCroppingEngine
from engines.ocr.vietocr_raw_engine import VietOCRRawEngine
from engines.ocr.pytesseract_ocr import PytesseractOCREngine

from engines.nlp.dummy_nlp import DummyNLPEngine
from engines.nlp.gemini_nlp import GeminiNLPEngine
from engines.nlp.stanford_nlp import StanfordNLPEngine


from engines.search.dummy_search import DummySearchEngine
from engines.search.google_search import GoogleSearchEngine
from engines.search.duckduckgo_scrape import DuckDuckGoScrapeEngine

from engines.summarizer.dummy_summarizer import DummySummarizerEngine
from engines.summarizer.gemini_summarizer import GeminiSummarizerEngine



OCR_ENGINES = {
    "dummy": DummyOCREngine,
    "gemini": GeminiOCREngine,
    "vietocr": VietOCRCroppingEngine,
    "vietocr_raw": VietOCRRawEngine,
    "tesseract_viet": PytesseractOCREngine
}

NLP_ENGINES = {
    "dummy": DummyNLPEngine,
    "gemini": GeminiNLPEngine,
    "stanford_viet": StanfordNLPEngine
}

SEARCH_ENGINES = {
    "dummy": DummySearchEngine,
    "google": GoogleSearchEngine,
    "duckduckgo": DuckDuckGoScrapeEngine,
}

SUMMARIZER_ENGINES = {
    "dummy": DummySummarizerEngine,
    "gemini": GeminiSummarizerEngine
}

def get_ocr_engine(engine_name: str):
    engine_class = OCR_ENGINES.get(engine_name)
    if not engine_class:
        raise ValueError(f"Unknown OCR engine: '{engine_name}'. Available: {list(OCR_ENGINES.keys())}")
    return engine_class()

def get_nlp_engine(engine_name: str):
    engine_class = NLP_ENGINES.get(engine_name)
    if not engine_class:
        raise ValueError(f"Unknown NLP engine: '{engine_name}'. Available: {list(NLP_ENGINES.keys())}")
    return engine_class()

def get_search_engine(engine_name: str):
    engine_class = SEARCH_ENGINES.get(engine_name)
    if not engine_class:
        raise ValueError(f"Unknown Search engine: '{engine_name}'. Available: {list(SEARCH_ENGINES.keys())}")
    return engine_class()

def get_summarizer_engine(engine_name: str):
    engine_class = SUMMARIZER_ENGINES.get(engine_name)
    if not engine_class:
        raise ValueError(f"Unknown Summarizer engine: '{engine_name}'. Available: {list(SUMMARIZER_ENGINES.keys())}")
    return engine_class()

def get_available_ocr_engines() -> List[str]:
    return list(OCR_ENGINES.keys())

def get_available_nlp_engines() -> List[str]:
    return list(NLP_ENGINES.keys())

def get_available_search_engines() -> List[str]:
    return list(SEARCH_ENGINES.keys())

def get_available_summarizer_engines() -> List[str]:
    return list(SUMMARIZER_ENGINES.keys())