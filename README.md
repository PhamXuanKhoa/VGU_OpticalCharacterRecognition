# Project OCR Main

This project is a full-stack application designed for Optical Character Recognition (OCR) and document processing, featuring a Python FastAPI backend and a React/Vite frontend. It allows users to upload images, select various OCR, NLP, search, and summarization engines, and then process the document to extract text, keywords, related links, and a final summary.

## Features

*   **Image Upload:** Upload images for OCR processing.
*   **Dynamic Engine Selection:** Choose from various OCR, NLP, search, and summarization engines (including dummy, Gemini, Google Search, DuckDuckGo, and VietOCR).
*   **Text Extraction:** Extract text content from uploaded images.
*   **Keyword Identification:** Identify key terms and phrases using NLP engines.
*   **Document Linking:** Find related documents or articles based on extracted keywords.
*   **Content Summarization:** Generate summaries of processed content.
*   **Dockerized Deployment:** Easy setup and deployment using Docker and Docker Compose.

## Technologies Used

**Backend:**
*   **Python 3.10:** Programming language.
*   **FastAPI:** Web framework for building APIs.
*   **Uvicorn:** ASGI server for running FastAPI.
*   **Google Generative AI (Gemini API):** For advanced NLP, OCR, and summarization capabilities.
*   **VietOCR:** For Vietnamese OCR.
*   **Requests, BeautifulSoup4:** For web scraping/search.
*   **Pillow:** Image processing library.

**Frontend:**
*   **React:** JavaScript library for building user interfaces.
*   **Vite:** Fast frontend build tool.
*   **TypeScript:** Typed superset of JavaScript.
*   **Tailwind CSS / Shadcn UI:** For styling and UI components.
*   **XMLHttpRequest:** For making API calls.

**Deployment:**
*   **Docker:** Containerization platform.
*   **Docker Compose:** Tool for defining and running multi-container Docker applications.

## Setup and Local Development

Follow these steps to get the project up and running on your local machine using Docker Compose.

### Prerequisites

*   [Docker Desktop](https://www.docker.com/products/docker-desktop) (includes Docker Engine and Docker Compose) installed and running.
*   Git installed.

### 1. Clone the Repository

```bash
git clone https://github.com/minhle-120/VGU_OCR.git
cd VGU_OCR
```

### 2. Configure Environment Variables

*   **For the Backend (`.env` in the project root):**
    This file contains sensitive API keys for the backend.
    Create a file named `.env` in the root directory of the project (`VGU_OCR/`).
    ```
    GEMINI_API_KEY=your_gemini_api_key_here
    GOOGLE_API_KEY=key
    GOOGLE_CSE_ID=key
    ```
    **Note:** Replace `your_gemini_api_key_here` and `your_secret_key_here` with your actual keys. This file is `.gitignore` and should not be committed to version control.


### 3. Build and Run with Docker Compose

Navigate to the root of your project (`VGU_OCR/`) in your terminal and run:

```bash
docker-compose up --build -d
```

*   `--build`: This command builds the Docker images for both backend and frontend services. You only need to run this the first time or after making changes to Dockerfiles or dependencies.
*   `-d`: Runs the services in detached mode (in the background).

### 4. Access the Application

Once the services are up:

*   **Frontend:** Open your web browser and go to `http://localhost:5173`.
*   **Backend API (FastAPI Docs):** Open your web browser and go to `http://localhost:8000/docs`.

### 5. Stop the Application

To stop and remove the running containers, networks, and volumes created by `docker-compose`:

```bash
docker-compose down
```

## 6. Credits

This project would not have been possible without the help of these amazing individuals:

-   **@minhle-120:** Developed the FastAPI backend and OCR engines.
-   **@PhamXuanKhoa:** Designed the entire UI/UX and created the React components.
