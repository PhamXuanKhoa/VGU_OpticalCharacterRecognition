## Project Overview

This is a full-stack web application for Optical Character Recognition (OCR) and document processing. It consists of a Python FastAPI backend and a React/Vite frontend. The application is containerized using Docker.

The backend provides an API for uploading images, extracting text using various OCR engines (Gemini, VietOCR, Tesseract, EasyOCR), performing Natural Language Processing (NLP) tasks (keyword identification), searching for related articles (using Google Search and DuckDuckGo), and summarizing text (using Gemini).

The frontend provides a user interface for uploading images, selecting the desired engines, and viewing the results.

## Building and Running

The project is designed to be run using Docker and Docker Compose.

**Prerequisites:**

*   Docker Desktop

**To run the application:**

1.  Make sure you have a `.env` file in the `frontend` directory with the necessary environment variables. You can use `frontend/.env.template` as a starting point.
2.  Replace `your_gemini_api_key_here` in `docker-compose.yml` with your actual Gemini API key.
3.  Run the following command from the project root:

    ```bash
    docker-compose up --build
    ```

This will build the Docker image and start the application.

*   The frontend will be available at `http://localhost:5173`.
*   The backend API documentation will be available at `http://localhost:8000/docs`.

**To stop the application:**

```bash
docker-compose down
```

## Development Conventions

### Backend

*   The backend is written in Python using the FastAPI framework.
*   Dependencies are managed with `pip` and are listed in `backend/requirements.txt`.
*   The main application file is `backend/main.py`.
*   The application is started with `uvicorn main:app`.

### Frontend

*   The frontend is a React application built with Vite.
*   It uses TypeScript.
*   Dependencies are managed with `npm` and are listed in `frontend/package.json`.
*   The main source file is `frontend/src/main.tsx`.
*   The following scripts are available in `frontend/package.json`:
    *   `npm run dev`: Starts the development server.
    *   `npm run build`: Builds the application for production.
    *   `npm run lint`: Lints the code using ESLint.
    *   `npm run preview`: Previews the production build.

### Code Style

*   The frontend code is formatted using ESLint.
*   The Python code seems to follow the PEP 8 style guide, but there is no linter configuration file to enforce it.