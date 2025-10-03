# Use an official Python runtime as a parent image
FROM python:3.10-slim-bullseye

# Set the working directory in the container
WORKDIR /app/backend

# Copy the requirements file to the working directory
COPY requirements.txt .

# Install Tesseract OCR engine and Vietnamese language pack
RUN apt-get update && apt-get install -y tesseract-ocr tesseract-ocr-vie && rm -rf /var/lib/apt/lists/*

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu

# Copy the rest of the application's code
COPY . .

# Download VietOCR model during build
RUN --mount=type=cache,target=/root/.cache python /app/backend/download_vietocr_model.py && rm /app/backend/download_vietocr_model.py

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Run the app when the container launches with hot-reloading
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]