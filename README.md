# VGU_OpticalCharacterRecognition

VGU_OpticalCharacterRecognition is a comprehensive, full-stack application designed for advanced Optical Character Recognition (OCR) and document processing. It integrates a Python FastAPI backend with a React/Vite frontend to provide a robust platform for text extraction, analysis, and document management.

The application allows users to upload images, extract text using various OCR engines, identify key terms with Natural Language Processing (NLP), discover related articles through integrated search functionalities, and generate concise summaries of the content.

## Features

*   **Image Upload and Processing**: Interface for uploading images for OCR processing.
*   **Dynamic Engine Selection**: Flexibility to choose from multiple engines for OCR, NLP, search, and summarization, including options like Gemini, Google Search, DuckDuckGo, and VietOCR.
*   **Text Extraction**: High-accuracy text extraction from image-based documents.
*   **Keyword Identification**: Automated identification of key terms and phrases using NLP.
*   **Document Linking**: Retrieval of relevant documents and articles based on extracted keywords.
*   **Content Summarization**: Generation of automated summaries for extracted text.
*   **Containerized Deployment**: Simplified setup and deployment using Docker and Docker Compose for a consistent environment.

## Technology Stack

### **Backend**

*   **Python 3.10**: Core language for backend development.
*   **FastAPI**: High-performance web framework for building APIs.
*   **Uvicorn**: ASGI server for running FastAPI applications.
*   **Google Generative AI (Gemini API)**: Utilized for advanced OCR, NLP, and summarization capabilities.
*   **VietOCR**: Specialized OCR engine for Vietnamese language text.
*   **Requests & BeautifulSoup4**: Libraries for web scraping and search functionalities.
*   **Pillow**: Image processing library for handling image manipulations.

### **Frontend**

*   **React**: JavaScript library for building user interfaces.
*   **Vite**: Modern frontend build tool for faster development.
*   **TypeScript**: Typed superset of JavaScript for enhanced code quality.
*   **Tailwind CSS / Shadcn UI**: Frameworks for designing and building the user interface and components.
*   **XMLHttpRequest**: Standard API for making requests to the backend.

### **Deployment**

*   **Docker**: Platform for developing, shipping, and running applications in containers.
*   **Docker Compose**: Tool for defining and running multi-container Docker applications.

## Getting Started

To get the project up and running on your local machine, please follow the steps below.

### **Prerequisites**

Ensure you have Docker Desktop installed on your system. It can be downloaded from the [Docker website](https://www.docker.com/products/docker-desktop).

### **Step 1: Pull the Docker Image**

Open your terminal or command prompt and execute the following command to pull the latest Docker image:

```bash
docker pull ghcr.io/phamxuankhoa/vgu_opticalcharacterrecognition:latest
```

### **Step 2: Run the Docker Container**

Run the application using the following command, replacing `"your_gemini_api_key_here"` with your actual Gemini API key:

```bash
docker run -d -p 5173:80 -p 8000:8000 -e GEMINI_API_KEY="your_gemini_api_key_here" --name vgu_ocr_app ghcr.io/phamxuankhoa/vgu_opticalcharacterrecognition:latest
```

### **Step 3: Access the Application**

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

## Credits

This project was developed through the collaborative efforts of:

*   **[@minhle-120] (https://github.com/minhle-120):** Backend development, including the FastAPI implementation and integration of OCR engines.
*   **[@PhamXuanKhoa] (https://www.github.com/PhamXuanKhoa):** Frontend development, including UI/UX design and the creation of React components.
