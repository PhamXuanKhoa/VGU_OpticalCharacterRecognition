# VGU_OpticalCharacterRecognition

VGU_OpticalCharacterRecognition is a comprehensive, full-stack application designed for advanced Optical Character Recognition (OCR) and document processing. It integrates a Python FastAPI backend with a React/Vite frontend to provide a robust platform for text extraction, analysis, and document management.

The application allows users to upload images, extract text using various OCR engines, identify key terms with Natural Language Processing (NLP), discover related articles through integrated search functionalities, and generate concise summaries of the content.

## Getting Started

We provide two versions of the application as pre-built Docker images from GitHub Container Registry (GHCR):

*   `latest-full`: A comprehensive image with all models pre-installed for immediate, full functionality. (~2.7 GB download size)
*   `latest-slim`: A lightweight image that does not pre-install the Stanford NLP, VietOCR, and EasyOCR models. These will be downloaded on their first use, which may cause an initial delay. (~1 GB download size)

### **Prerequisites**

Ensure you have Docker Desktop installed and running on your system.

### **Step 1: Obtain a Gemini API Key (optional)**

This application uses the Google Gemini API for its advanced OCR, NLP, and summarization features. You can obtain a free API key from Google AI Studio.

1.  **Navigate to Google AI Studio**: Open your web browser and go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).
2.  **Create an API Key**: You may be asked to sign in with your Google account. Once you are on the "API keys" page, click the **"Create API key"** button.
3.  **Copy Your Key**: A new API key will be generated for you. Copy this key and keep it secure. You will use this key in the next step to run the application.

### **Step 2: Pull the Docker Image**

Choose the version you want to use and pull the image from GHCR.

*For the full version:*
```bash
docker pull ghcr.io/phamxuankhoa/vgu_opticalcharacterrecognition:latest-full
```

*For the slim version:*
```bash
docker pull ghcr.io/phamxuankhoa/vgu_opticalcharacterrecognition:latest-slim
```

### **Step 3: Run the Docker Container**

Run the application using the following command, replacing `your_gemini_api_key_here` with the actual Gemini API key you obtained in Step 1.

*For the full version:*
```bash
docker run -d -p 5173:80 -p 8000:8000 -e GEMINI_API_KEY="your_gemini_api_key_here" --name vgu_ocr_app ghcr.io/phamxuankhoa/vgu_opticalcharacterrecognition:latest-full
```

*For the slim version:*
```bash
docker run -d -p 5173:80 -p 8000:8000 -e GEMINI_API_KEY="your_gemini_api_key_here" --name vgu_ocr_app ghcr.io/phamxuankhoa/vgu_opticalcharacterrecognition:latest-slim
```

*Add this if you want to use google search (you will need to get your own google search key):*
```bash
-e GOOGLE_API_KEY="google_api_key" -e GOOGLE_CSE_ID="google_cse_key"
```

### **Step 4: Access the Application**

Once the container is running, the application will be accessible.

*   **Frontend Application**: Open your web browser and navigate to `http://localhost:5173`.
*   **Backend API Documentation**: The backend API documentation is available at `http://localhost:8000/docs`.

### **Stopping the Application**

To stop the application, run:

```bash
docker stop vgu_ocr_app
```

To remove the container, run:

```bash
docker rm vgu_ocr_app
```

## Features

*   **Image Upload and Processing**: Interface for uploading images for OCR processing.
*   **Dynamic Engine Selection**: Flexibility to choose from a wide array of engines for each processing step.
*   **Text Extraction**: High-accuracy text extraction from image-based documents.
*   **Keyword Identification**: Automated identification of key terms and phrases using NLP.
*   **Document Linking**: Retrieval of relevant documents and articles based on extracted keywords.
*   **Content Summarization**: Generation of automated summaries for extracted text.
*   **Containerized Deployment**: Simplified setup and deployment using Docker for a consistent environment.

## Available Engines

The application supports a variety of engines for different tasks, allowing users to select the best tool for their specific needs.

### **OCR Engines**
*   **Gemini**: Powerful, multimodal OCR from Google's Gemini.
*   **VietOCR**: Specialized engine for Vietnamese. (https://github.com/pbcquoc/vietocr)
*   **Pytesseract**: A popular OCR engine based on Google's Tesseract.
*   **EasyOCR**: A versatile OCR library supporting numerous languages.

### **NLP (Keyword Extraction) Engines**
*   **Gemini**: Advanced NLP capabilities from Google's Gemini.
*   **Gemma**: Keyword extraction using Google's Gemma models. (https://huggingface.co/google/gemma-3-270m-it)
*   **SpaCy**: Industrial-strength NLP with pre-trained models.
*   **Stanza**: A comprehensive NLP toolkit from Stanford University.
*   **Underthesea**: A robust NLP toolkit specifically for Vietnamese.
*   **Pyvi**: A simple NLP toolkit for Vietnamese language processing.

### **Search Engines**
*   **DuckDuckGo**: Provide the top 5 links from DuckDuckGo.
*   **DuckDuckGo Long**: Provides more links for each keyword, up to 20 links
*   **DuckDuckGo Edu**: Filters DuckDuckGo search results for educational domains.
*   **Arxiv Search**: Searches for academic papers and preprints on ArXiv.

### **Summarization Engines**
*   **Gemini**: High-quality text summarization using Google's Gemini.
*   **Gemma**: Text summarization using Google's Gemma models. (quite slow with long text) (https://huggingface.co/google/gemma-3-270m-it)

## Technology Stack

### **Backend**
*   **Python 3.10**: Core language for backend development.
*   **FastAPI**: High-performance web framework for building APIs.
*   **Uvicorn**: ASGI server for running FastAPI applications.
*   **Requests & BeautifulSoup4**: Libraries for web scraping and search functionalities.
*   **Pillow**: Image processing library for handling image manipulations.

### **Frontend**
*   **React**: JavaScript library for building user interfaces.
*   **Vite**: Modern frontend build tool for faster development.
*   **TypeScript**: Typed superset of JavaScript for enhanced code quality.
*   **Tailwind CSS / Shadcn UI**: Frameworks for designing and building the user interface and components.
*   **Fetch API**: Standard API for making requests to the backend.

### **Deployment**
*   **Docker**: Platform for developing, shipping, and running applications in containers.

## Credits

This project was developed through the collaborative efforts of:

*   **[@minhle-120](https://github.com/minhle-120):** Backend development, including the FastAPI implementation and integration of engines.
*   **[@PhamXuanKhoa](https://www.github.com/PhamXuanKhoa):** Frontend development, including UI/UX design and the creation of React components.
