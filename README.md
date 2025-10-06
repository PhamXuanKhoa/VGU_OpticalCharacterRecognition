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

## 🚀 Getting Started: A Simple Guide

Follow these steps to get the project running on your computer.

### **Prerequisites**

Before you begin, you will need to have two programs installed:

1.  **Git (optional):** This is a tool that helps you copy the project files to your computer. If you don't have it, you can download it from [git-scm.com](https://git-scm.com/downloads).
2.  **Docker Desktop:** This program runs the application in a self-contained environment. You can download it from the [Docker website](https://www.docker.com/products/docker-desktop).

### **Step 1: Clone the Project to Your Computer**

1.  Open a terminal or command prompt.
    *   On Windows, you can search for "Command Prompt" or "Windows PowerShell".
    *   On macOS, you can search for "Terminal".
2.  Run the following command to copy the project files:

    ```bash
    git clone https://github.com/PhamXuanKhoa/VGU_OpticalCharacterRecognition
    ```
    Alternatively, if you do not have Git, you can download the source code from the [releases tab](https://github.com/PhamXuanKhoa/VGU_OpticalCharacterRecognition/releases) of this repository.

### **Step 2: Add Your Gemini API Key**

To use some of the advanced features, you'll need a Gemini API key.

1.  Open the `docker-compose.yml` file in a text editor.
2.  Find the following lines in the file:

    ```yaml
      GEMINI_API_KEY=your_gemini_api_key_here
    ```

3.  Replace `your_gemini_api_key_here` with your actual Gemini API key.

### **Step 3: Run the Application**

Now you are ready to start the application.

1.  Make sure you are in the `VGU_OpticalCharacterRecognition` folder in your terminal.
2.  Run the following command (make sure you have docker running first):

    ```bash
    docker-compose up --build
    ```

    **Note**: The first time you run this command, it might take a while and require a fast internet connection to download all necessary libraries and dependencies.

    This command will build the application and start it. This might take a few minutes the first time you run it.

### **Step 4: Access the Application**

Once the command in the previous step has finished, the application is running!

*   **See the App:** Open your web browser and go to `http://localhost:5173`.
*   **Backend API (for developers):** You can see the backend documentation at `http://localhost:8000/docs`.

### **How to Stop the Application**

When you are finished, you can stop the application by going back to your terminal and pressing `Ctrl + C`. Then, run the following command to clean up:

```bash
docker-compose down
```

## 🙏 Credits

This project is brought to you by the combined efforts of these awesome people:

-   **[@minhle-120] (https://github.com/minhle-120):** The mastermind behind the FastAPI backend and OCR engines. 🧑‍💻
-   **[@PhamXuanKhoa] (https://www.github.com/PhamXuanKhoa):** The creative genius who designed the entire UI/UX and built the React components. 🎨
