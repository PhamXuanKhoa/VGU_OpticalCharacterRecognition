import { useState, useEffect } from "react";
import { API_URL } from "@/lib/constants";

export interface ProcessingResults {
    ocr: string;
    keywords: string[];
    links: string[];
    summary: string;
}

export const useApi = () => {
    // State for initial data
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [availableEngines, setAvailableEngines] = useState<any>(null);

    // State for engine selection
    const [selectedOCREngine, setSelectedOCREngine] = useState<string | null>(null);
    const [selectedNlpEngine, setSelectedNlpEngine] = useState<string | null>(null);
    const [selectedSearchEngine, setSelectedSearchEngine] = useState<string | null>(null);
    const [selectedSummarizerEngine, setSelectedSummarizerEngine] = useState<string | null>(null);

    // State for file upload process
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [fileProgresses, setFileProgresses] = useState<Record<string, number>>({});
    const [isUploading, setIsUploading] = useState(false);
    const [taskId, setTaskId] = useState<string | null>(null);

    // State for the main processing flow
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDoneProcessing, setIsDoneProcessing] = useState(false);
    const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

    // State to hold the final results
    const [results, setResults] = useState<ProcessingResults | null>(null);

    // Effect to fetch available engines on mount
    useEffect(() => {
        const fetchEngines = async () => {
            try {
                const response = await fetch(`${API_URL}available-engines`);
                if (!response.ok) throw new Error("Network response was not ok");
                const data = await response.json();
                setAvailableEngines(data);
            } catch (error) {
                console.error("Failed to fetch available engines:", error);
            } finally {
                setIsPageLoading(false);
            }
        };
        fetchEngines();
    }, []);

    // Function to handle file uploads
    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;

        const newFiles = Array.from(files);
        setUploadedFiles((prev) => [...prev, ...newFiles]);
        setIsUploading(true);

        newFiles.forEach(async (file) => {
            // Fake progress for UI feedback
            setFileProgresses((prev) => ({ ...prev, [file.name]: 0 }));
            const interval = setInterval(() => {
                setFileProgresses((prev) => {
                    const newProgress = Math.min((prev[file.name] || 0) + Math.random() * 20, 99);
                    return { ...prev, [file.name]: newProgress };
                });
            }, 200);

            // Actual upload
            const formData = new FormData();
            formData.append("file", file);

            try {
                const response = await fetch(`${API_URL}upload-image`, {
                    method: "POST",
                    body: formData,
                });
                if (!response.ok) throw new Error("Upload failed");
                const data = await response.json();
                setTaskId(data.task_id);
            } catch (error) {
                console.error("Error uploading file:", error);
            } finally {
                clearInterval(interval);
                setFileProgresses((prev) => ({ ...prev, [file.name]: 100 }));
                setIsUploading(false);
            }
        });
    };

    const handleStartProcessing = async () => {
        if (!taskId) return;
        setIsProcessing(true);
        setIsDoneProcessing(false);
        setResults(null);

        try {
            // 1. Select engines
            await fetch(`${API_URL}select-engines/${taskId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ocr: selectedOCREngine,
                    nlp: selectedNlpEngine,
                    search: selectedSearchEngine,
                    summarizer: selectedSummarizerEngine,
                }),
            });

            // 2. Process task
            await fetch(`${API_URL}process-task/${taskId}`, { method: "POST" });

            // 3. Fetch all results concurrently
            const [ocrRes, nlpRes, linksRes, summaryRes] = await Promise.all([
                fetch(`${API_URL}results/${taskId}/extracted-text`),
                fetch(`${API_URL}results/${taskId}/keywords`),
                fetch(`${API_URL}results/${taskId}/document-links`),
                fetch(`${API_URL}results/${taskId}/summary`),
            ]);

            const ocrData = await ocrRes.json();
            const nlpData = await nlpRes.json();
            const linksData = await linksRes.json();
            const summaryData = await summaryRes.json();

            // 4. Update state with results
            setResults({
                ocr: ocrData.extracted_text ?? "No text extracted.",
                keywords: nlpData.keywords ?? [],
                links: linksData.document_links ?? [],
                summary: summaryData.final_summary ?? "No summary available.",
            });

            setIsDoneProcessing(true);
            setIsSuccessDialogOpen(true);
            const audio = new Audio('https://www.myinstants.com/media/sounds/ghe-chua-ghe-chua.mp3');
            audio.play();

        } catch (error) {
            console.error("An error occurred during processing:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    // Return all the state and handlers the UI will need
    return {
        isPageLoading,
        availableEngines,
        engineSelection: {
            selectedOCREngine, setSelectedOCREngine,
            selectedNlpEngine, setSelectedNlpEngine,
            selectedSearchEngine, setSelectedSearchEngine,
            selectedSummarizerEngine, setSelectedSummarizerEngine,
        },
        fileUpload: {
            uploadedFiles,
            fileProgresses,
            isUploading,
            handleFileSelect,
        },
        processing: {
            isProcessing,
            isDoneProcessing,
            isSuccessDialogOpen,
            setIsSuccessDialogOpen,
            handleStartProcessing,
            isProcessButtonDisabled: !taskId || isUploading || isProcessing || !selectedOCREngine || !selectedNlpEngine || !selectedSearchEngine || !selectedSummarizerEngine,
            areSelectorsDisabled: !taskId,
        },
        results,
    };
};