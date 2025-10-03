
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

from engines.ocr.vietocr import VietOCRCroppingEngine

if __name__ == "__main__":
    print("Attempting to initialize VietOCRCroppingEngine to trigger model download...")
    try:
        # Initializing the engine will trigger the model download if not present
        engine = VietOCRCroppingEngine()
        print("VietOCR model download (if necessary) and initialization successful.")
    except Exception as e:
        print(f"Error during VietOCR model download/initialization: {e}")
        sys.exit(1)
