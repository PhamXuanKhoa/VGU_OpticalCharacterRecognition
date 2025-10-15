import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

from engines.ocr.vietocr import VietOCRCroppingEngine
from engines.nlp.stanford_nlp import StanfordNLPEngine
from engines.ocr.easyocr_ocr import EasyOCREngine
from engines.nlp.gemma_nlp import GemmaNLPEngine

if __name__ == "__main__":
    print("--- Initializing GemmaNLPEngine to trigger model download ---")
    try:
        # Initializing the engine will trigger the model download if not present
        nlp_engine = GemmaNLPEngine()
        print("Gemma NLP model download (if necessary) and initialization successful.")
    except Exception as e:
        print(f"Error during Gemma NLP model download/initialization: {e}")
        sys.exit(1)

    print("\n--- Initializing StanfordNLPEngine to trigger model download ---")
    try:
        # Initializing the engine will trigger the model download if not present
        nlp_engine = StanfordNLPEngine()
        print("Stanford NLP model download (if necessary) and initialization successful.")
    except Exception as e:
        print(f"Error during Stanford NLP model download/initialization: {e}")
        sys.exit(1)

    print("\n--- Initializing VietOCRCroppingEngine to trigger model download ---")
    try:
        # Initializing the engine will trigger the model download if not present
        ocr_engine = VietOCRCroppingEngine()
        print("VietOCR model download (if necessary) and initialization successful.")
    except Exception as e:
        print(f"Error during VietOCR model download/initialization: {e}")
        sys.exit(1)

    print("\n--- Initializing EasyOCREngine to trigger model download ---")
    try:
        # Initializing the engine will trigger the model download if not present
        ocr_engine = EasyOCREngine()
        print("EasyOCR model download (if necessary) and initialization successful.")
    except Exception as e:
        print(f"Error during EasyOCR model download/initialization: {e}")
        sys.exit(1)