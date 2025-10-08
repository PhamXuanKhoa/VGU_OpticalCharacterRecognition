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

Ensure you have the following software installed on your system:

1.  **Git**: For cloning the project repository. It can be downloaded from [git-scm.com](https://git-scm.com/downloads). (Optional)
2.  **Docker Desktop**: For running the application in a containerized environment. It can be downloaded from the [Docker website](https://www.docker.com/products/docker-desktop).

### **Step 1: Clone the Repository**

Open your terminal or command prompt and execute the following command to clone the project repository:

```bash
git clone https://github.com/PhamXuanKhoa/VGU_OpticalCharacterRecognition
```

Alternatively, you can download the source code directly from the [releases tab](https://github.com/PhamXuanKhoa/VGU_OpticalCharacterRecognition/releases) of the repository.

### **Step 2: Configure Gemini API Key**

A Gemini API key is required for the application's advanced features.

1.  Navigate to the root of the project directory and open the `docker-compose.yml` file in a text editor.
2.  Locate the following environment variable:
    ```yaml
    GEMINI_API_KEY=your_gemini_api_key_here
    ```
3.  Replace `your_gemini_api_key_here` with your valid Gemini API key.

### **Step 3: Launch the Application**

With Docker running, you can now build and start the application.

1.  Ensure your terminal's current directory is the project's root folder (`VGU_OpticalCharacterRecognition`).
2.  Execute the following command:
    ```bash
    docker-compose up --build
    ```
    **Note**: The initial build process may take some time as it needs to download all the necessary dependencies and libraries. A stable internet connection is recommended.

### **Step 4: Access the Application**

Once the build and startup process is complete, the application will be accessible.

*   **Frontend Application**: Open your web browser and navigate to `http://localhost:5173`.
*   **Backend API Documentation**: The backend API documentation is available at `http://localhost:8000/docs`.

### **Stopping the Application**

To stop the application, return to the terminal where the application is running and press `Ctrl + C`. To remove the containers and associated networks, run:

```bash
docker-compose down
```

## Credits

This project was developed through the collaborative efforts of:

*   **[@minhle-120] (https://github.com/minhle-120):** Backend development, including the FastAPI implementation and integration of OCR engines.
*   **[@PhamXuanKhoa] (https://www.github.com/PhamXuanKhoa):** Frontend development, including UI/UX design and the creation of React components.
