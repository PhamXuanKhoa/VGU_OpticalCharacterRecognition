import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

from engines.ocr.vietocr import VietOCRCroppingEngine
from engines.nlp.stanford_nlp import StanfordNLPEngine
from engines.ocr.easyocr_ocr import EasyOCREngine
from engines.nlp.gemma_nlp import GemmaNLPEngine

if __name__ == "__main__":
    def get_dir_size(path='.'):
        total_size = 0
        # check if path exists
        if not os.path.exists(path):
            return 0
        with os.scandir(path) as it:
            for entry in it:
                if entry.is_file():
                    total_size += entry.stat().st_size
                elif entry.is_dir():
                    total_size += get_dir_size(entry.path)
        return total_size

    print("--- Initializing GemmaNLPEngine to trigger model download ---")
    try:
        # Initializing the engine will trigger the model download if not present
        nlp_engine = GemmaNLPEngine()
        print("Gemma NLP model download (if necessary) and initialization successful.")

        from huggingface_hub import snapshot_download
        import os

        model_id = "google/gemma-3-270m-it"
        token = os.getenv("HUGGING_FACE_HUB_TOKEN")
        # Use snapshot_download to get the path and ensure all files are downloaded
        model_path = snapshot_download(repo_id=model_id, token=token)

        print(f"--- Contents of {model_path} ---")
        total_size = 0
        for dirpath, dirnames, filenames in os.walk(model_path):
            for f in filenames:
                fp = os.path.join(dirpath, f)
                # follow symlinks to get the actual file size
                size = os.path.getsize(fp)
                total_size += size
                print(f"- {fp}: {size / 1024 / 1024:.2f} MB")
        print(f"Total size of {model_id}: {total_size / 1024 / 1024:.2f} MB")

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

    print("\n--- Cache Directory Sizes ---")
    home = os.path.expanduser("~")
    stanford_path = os.path.join(home, "stanfordnlp_resources")
    vietocr_path = os.path.join(home, ".cache", "vietocr")
    easyocr_path = os.path.join(home, ".EasyOCR")

    stanford_size = get_dir_size(stanford_path)
    print(f"- Stanford NLP ({stanford_path}): {stanford_size / 1024 / 1024:.2f} MB")

    vietocr_size = get_dir_size(vietocr_path)
    print(f"- VietOCR ({vietocr_path}): {vietocr_size / 1024 / 1024:.2f} MB")

    easyocr_size = get_dir_size(easyocr_path)
    print(f"- EasyOCR ({easyocr_path}): {easyocr_size / 1024 / 1024:.2f} MB")