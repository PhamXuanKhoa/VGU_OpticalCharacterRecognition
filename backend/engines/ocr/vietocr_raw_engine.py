import os
import sys
from PIL import Image, ImageOps
import numpy as np
import math # Import math for ceil function

# --- VietOCR Imports ---
try:
    from vietocr.tool.predictor import Predictor
    from vietocr.tool.config import Cfg
except ImportError:
    print("Error: The 'vietocr' library is not installed.")
    print("Please install it using: pip install vietocr")
    sys.exit(1)

# --- OCR Engine Interface ---
from services.ocr_interface import OCREngine


class VietOCRRawEngine(OCREngine):
    def __init__(self):
        # Hardcoded parameters for this engine
        self.model_name = 'vgg_transformer'
        self.vertical_squeeze_percentage = 70
        self.vertical_overlap_percentage = 50
        self.horizontal_overlap_percentage = 50

        # 1. Load configuration
        config = Cfg.load_config_from_name(self.model_name)
        config['cnn']['pretrained'] = True
        config['device'] = 'cpu' # Can be 'cuda:0' if GPU is available and configured
        
        # Store these config values for cropping logic
        self.target_height = config['dataset']['image_height']
        self.min_width = config['dataset']['image_min_width']
        self.max_width = config['dataset']['image_max_width']

        # 2. Initialize the Predictor (the OCR model)
        print(f"Initializing VietOCR Predictor ({self.model_name})...")
        self.detector = Predictor(config)
        print("VietOCR Predictor initialized.")

    def extract_text(self, image_path: str) -> str:
        print(f"--- [ENGINE: VietOCR Raw] Processing image at {image_path} ---")
        try:
            original_img = Image.open(image_path).convert("RGB")
            print(f"Original image size: {original_img.width}x{original_img.height}")

            # Define overlaps here, using self. attributes
            vertical_overlap = int(self.target_height * (self.vertical_overlap_percentage / 100))
            horizontal_overlap = int(self.max_width * (self.horizontal_overlap_percentage / 100))
            print(f"Using Vertical Overlap: {vertical_overlap}px ({self.vertical_overlap_percentage}%)")
            print(f"Using Horizontal Overlap: {horizontal_overlap}px ({self.horizontal_overlap_percentage}%)")

            # 3. --- DYNAMIC Vertical Squeeze ---
            w, h = original_img.size
            if w > h:
                print("Image is wide (width > height), skipping vertical squeeze.")
                img_to_process = original_img
            else:
                print("Image is portrait or square, dynamic vertical squeeze is applicable.")
                if self.vertical_squeeze_percentage != 100 and self.vertical_squeeze_percentage > 0:
                    print(f"Applying vertical squeeze of {self.vertical_squeeze_percentage}%...")
                    new_squeezed_height = int(h * (self.vertical_squeeze_percentage / 100))
                    img_to_process = original_img.resize((w, new_squeezed_height), Image.Resampling.LANCZOS)
                    print(f"Size after vertical squeeze: {img_to_process.width}x{img_to_process.height}")
                else:
                    img_to_process = original_img
            
            # 4. Squeeze or Expand Image Width (to a multiple of max_width for better tiling)
            base_width = self.max_width
            current_width, current_height = img_to_process.size
            
            if current_width == 0 or current_height == 0:
                return "Error: Image has zero width or height after initial processing."

            num_blocks_1 = round(current_width / base_width)
            target_width_1 = max(base_width, num_blocks_1 * base_width) # Ensure at least base_width
            
            num_blocks_2 = math.ceil(current_width / base_width)
            target_width_2 = max(base_width, num_blocks_2 * base_width) # Ensure at least base_width

            # Choose the target width that is closer to the current width
            if abs(current_width - target_width_1) <= abs(current_width - target_width_2):
                new_width = target_width_1
            else:
                new_width = target_width_2
            
            print(f"Current image width: {current_width}. Adjusting to the closer multiple of {base_width}, which is {new_width}.")
            
            # Calculate new height maintaining aspect ratio
            new_height = int(current_height * (new_width / current_width)) if current_width > 0 else self.target_height
            adjusted_img = img_to_process.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            extracted_texts = []
            
            # 5. Cropping Logic
            img_width, img_height = adjusted_img.size # Use adjusted_img size
            
            y_start = 0
            while y_start < img_height:
                strip_text_segments = []
                
                y_end = min(y_start + self.target_height + vertical_overlap, img_height)
                
                strip_img = adjusted_img.crop((0, y_start, img_width, y_end))
                
                # Adjust the last strip's start position if it's too small
                if strip_img.height < self.target_height and y_start > 0:
                    y_start = max(0, img_height - self.target_height)
                    y_end = img_height
                    strip_img = adjusted_img.crop((0, y_start, img_width, y_end))
                
                # Resize strip height to target_height while preserving aspect ratio and padding
                current_strip_width, current_strip_height = strip_img.size
                if current_strip_height == 0:
                    y_start += self.target_height - vertical_overlap # Move to next strip if current is empty
                    continue

                aspect_ratio = current_strip_width / current_strip_height
                new_strip_width_for_height = int(self.target_height * aspect_ratio)

                resized_strip = strip_img.resize((new_strip_width_for_height, self.target_height), Image.Resampling.LANCZOS)
                
                x_start = 0
                while x_start < resized_strip.width:
                    x_end = min(x_start + self.max_width + horizontal_overlap, resized_strip.width)
                    segment_img = resized_strip.crop((x_start, 0, x_end, self.target_height))

                    # Dynamic Padding for segments narrower than max_width
                    if 0 < segment_img.width < self.max_width:
                        padding_needed = self.max_width - segment_img.width
                        left_pad = padding_needed // 2
                        right_pad = padding_needed - left_pad
                        segment_img = ImageOps.expand(segment_img, border=(left_pad, 0, right_pad, 0), fill='white')
                    
                    if segment_img.width >= self.min_width:
                        text_segment = self.detector.predict(segment_img)
                        strip_text_segments.append(text_segment)
                    
                    if x_end >= resized_strip.width:
                        break
                    x_start = x_end - horizontal_overlap
                
                if strip_text_segments:
                    extracted_texts.append(" ".join(strip_text_segments))
                
                if y_end >= img_height:
                    break
                y_start = y_end - vertical_overlap
            
            raw_combined_text = "\n".join(extracted_texts)
            
            # --- REMOVED: No cleaning applied here ---
            # cleaned_text = clean_ocr_output(raw_combined_text)
            # return cleaned_text
            # --- END REMOVED ---
            
            return raw_combined_text # Return the raw text
        
        except Exception as e:
            print(f"An error occurred during VietOCR inference: {e}")
            return f"Error with VietOCR raw engine: {e}"
