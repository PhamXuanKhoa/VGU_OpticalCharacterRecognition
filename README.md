# 📝 VGU_OpticalCharacterRecognition

Welcome to VGU_OpticalCharacterRecognition! This is a full-stack powerhouse for Optical Character Recognition (OCR) and document processing. 🧠✨ We've combined a slick Python FastAPI backend with a stunning React/Vite frontend to bring you a seamless experience.

Got an image with text? Upload it! 🖼️ Want to extract text, pinpoint keywords, find related articles, and get a neat summary? You're in the right place. ✅

## ✨ Features

*   **Image Upload:** 📤 Pop your images in for some OCR magic.
*   **Dynamic Engine Selection:** ⚙️ Your choice of OCR, NLP, search, and summarization engines. We've got dummy engines for testing, and heavy-hitters like Gemini, Google Search, DuckDuckGo, and VietOCR.
*   **Text Extraction:** ✍️ Pull text from your images with ease.
*   **Keyword Identification:** 🔑 Use NLP engines to find the key terms and phrases that matter.
*   **Document Linking:** 🔗 Discover related documents and articles based on extracted keywords.
*   **Content Summarization:** 📚 Get the gist of your content with automatically generated summaries.
*   **Dockerized Deployment:** 🐳 Easy-peasy setup and deployment with Docker and Docker Compose.

## 🛠️ Technologies Used

### **Backend:**
*   **Python 3.10:** 🐍 The brains of the operation.
*   **FastAPI:** ⚡ A lightning-fast web framework for building APIs.
*   **Uvicorn:** 🦄 An ASGI server to keep FastAPI running smoothly.
*   **Google Generative AI (Gemini API):** 🤖 For next-level NLP, OCR, and summarization.
*   **VietOCR:** 🇻🇳 Specialized for Vietnamese OCR.
*   **Requests, BeautifulSoup4:** 🕸️ Our tools for web scraping and searching.
*   **Pillow:** 🖼️ For all your image processing needs.

### **Frontend:**
*   **React:** ⚛️ Building beautiful and responsive user interfaces.
*   **Vite:** 🚀 A frontend build tool that's fast.
*   **TypeScript:** ⌨️ Because we like our JavaScript with types.
*   **Tailwind CSS / Shadcn UI:** 🎨 For styling and UI components that pop.
*   **XMLHttpRequest:** 📞 Making those all-important API calls.

### **Deployment:**
*   **Docker:** 📦 Containerization for consistency and ease.
*   **Docker Compose:** 🎼 Orchestrating our multi-container Docker applications.

## 🚀 Setup and Local Development

Ready to get this project running on your local machine? Let's do it!

### **Prerequisites**

*   [Docker Desktop](https://www.docker.com/products/docker-desktop) (Docker Engine and Docker Compose included) up and running.
*   Git installed and ready to go.

### **1. Clone the Repository**

```bash
git clone https://github.com/minhle-120/VGU_OCR.git
cd VGU_OCR
```

### **2. Configure Environment Variables**

*   **For the Backend (`.env` in the project root):**
    This file is for your secret API keys. 🤫
    Create a new file named `.env` in the root directory of the project (`VGU_OCR/`).

    ```
    GEMINI_API_KEY=your_gemini_api_key_here
    GOOGLE_API_KEY=key
    GOOGLE_CSE_ID=key
    ```
    **Note:** Don't forget to replace `your_gemini_api_key_here` and the other keys with your actual credentials. This file is listed in `.gitignore`, so it won't be committed.

### **3. Build and Run with Docker Compose**

Head to the root of your project (`VGU_OCR/`) in your terminal and fire away:

```bash
docker-compose up --build
```

*   `--build`: This will build the Docker images for both the backend and frontend. You'll only need to do this the first time or when you change the Dockerfiles or dependencies.
*   `-d`: This runs the services in detached mode, so they'll hum along in the background.

### **4. Access the Application**

Once everything is up and running:

*   **Frontend:** 🖥️ Open your browser and navigate to `http://localhost:5173`.
*   **Backend API (FastAPI Docs):** 📄 Check out the backend's Swagger UI at `http://localhost:8000/docs`.

### **5. Stop the Application**

When you're ready to shut things down, run:

```bash
docker-compose down
```
This will stop and remove the containers, networks, and volumes.

## 🙏 Credits

This project is brought to you by the combined efforts of these awesome people:

-   **[@minhle-120] (https://github.com/minhle-120):** The mastermind behind the FastAPI backend and OCR engines. 🧑‍💻
-   **[@PhamXuanKhoa] (https://www.github.com/PhamXuanKhoa):** The creative genius who designed the entire UI/UX and built the React components. 🎨
