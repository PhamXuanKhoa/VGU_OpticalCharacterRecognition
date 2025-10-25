import { useState, useEffect } from "react";
import { API_URL } from "@/lib/constants";

export interface ProcessingResults {
    ocr: string;
    keywords: string[];
    links: string[];
    summary: string;
}

/**
 * Helper function to convert a Base64 string back into a File object.
 * This is crucial for uploading the locally stored image.
 * @param base64 The Base64 data URL string.
 * @param filename The desired filename for the new File object.
 * @returns A File object.
 */
const base64ToFile = (base64: string, filename: string): File => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};


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
    const [isFileStored, setIsFileStored] = useState(false);

    // State for the main processing flow
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDoneProcessing, setIsDoneProcessing] = useState(false);
    const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

    // State to hold the final results
    const [results, setResults] = useState<ProcessingResults | null>(null);

    // State to hold the Base64 string from localStorage
    const [storedImageBase64, setStoredImageBase64] = useState<string | null>(null);

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

    // Function to handle new file uploads
    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;
        const newFiles = Array.from(files);
        setUploadedFiles((prev) => [...prev, ...newFiles]);
        setIsUploading(true);
        newFiles.forEach(async (file) => {
            setFileProgresses((prev) => ({ ...prev, [file.name]: 0 }));
            const interval = setInterval(() => {
                setFileProgresses((prev) => ({ ...prev, [file.name]: Math.min((prev[file.name] || 0) + 10, 99) }));
            }, 200);
            const formData = new FormData();
            formData.append("file", file);
            try {
                const response = await fetch(`${API_URL}upload-image`, { method: "POST", body: formData });
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

    const clearUploadedFiles = () => {
        setUploadedFiles([]);
        setFileProgresses({});
        setTaskId(null);
    };

    // Function to handle the entire processing flow, including re-processing
    const handleStartProcessing = async () => {
        // Capture if this is a re-run before we reset the state
        const isReProcessing = isDoneProcessing;

        setIsProcessing(true);
        setIsDoneProcessing(false);
        setResults(null);

        let currentTaskId = taskId;

        try {
            // Step 1: Force a re-upload to get a new task ID if this is a re-run.
            // The existing logic already handles the initial upload case.
            if ((isReProcessing || !currentTaskId) && isFileStored && storedImageBase64) {
                console.log("Re-processing or initial processing. Uploading image to get a new task ID...");
                const imageFile = base64ToFile(storedImageBase64, "stored_image.png");
                const formData = new FormData();
                formData.append("file", imageFile);

                const uploadResponse = await fetch(`${API_URL}upload-image`, {
                    method: "POST",
                    body: formData,
                });

                if (!uploadResponse.ok) throw new Error("Upload of stored image failed");
                const uploadData = await uploadResponse.json();

                currentTaskId = uploadData.task_id;
                setTaskId(currentTaskId); // Save the new task ID for this run
                console.log("Image uploaded. New Task ID:", currentTaskId);
            }

            if (!currentTaskId) {
                throw new Error("Cannot process without a Task ID.");
            }

            // Step 2: Proceed with engine selection and processing
            await fetch(`${API_URL}select-engines/${currentTaskId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ocr: selectedOCREngine, nlp: selectedNlpEngine, search: selectedSearchEngine, summarizer: selectedSummarizerEngine }),
            });

            await fetch(`${API_URL}process-task/${currentTaskId}`, { method: "POST" });

            // Step 3: Fetch results
            const [ocrRes, nlpRes, linksRes, summaryRes] = await Promise.all([
                fetch(`${API_URL}results/${currentTaskId}/extracted-text`),
                fetch(`${API_URL}results/${currentTaskId}/keywords`),
                fetch(`${API_URL}results/${currentTaskId}/document-links`),
                fetch(`${API_URL}results/${currentTaskId}/summary`),
            ]);
            const ocrData = await ocrRes.json();
            const nlpData = await nlpRes.json();
            const linksData = await linksRes.json();
            const summaryData = await summaryRes.json();
            setResults({
                ocr: ocrData.extracted_text ?? "No text extracted.",
                keywords: nlpData.keywords ?? [],
                links: linksData.document_links ?? [],
                summary: summaryData.final_summary ?? "No summary available.",
            });
            setIsDoneProcessing(true);
            setIsSuccessDialogOpen(true);
            try {
                const audio = new Audio('https://www.myinstants.com/media/sounds/ding-sound-effect_1_CVUaI0C.mp3');
                audio.play();
            } catch (audioError) {
                console.error("Failed to play notification sound:", audioError);
            }
        } catch (error) {
            console.error("An error occurred during processing:", error);
        } finally {
            setIsProcessing(false);
        }
    };

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
            isFileStored,
            setIsFileStored,
            clearUploadedFiles,
            setStoredImageBase64,
        },
        processing: {
            isProcessing,
            isDoneProcessing,
            isSuccessDialogOpen,
            setIsSuccessDialogOpen,
            handleStartProcessing,
            isProcessButtonDisabled: (
                isUploading || isProcessing ||
                !isFileStored || // Can't process if no file is ready
                !selectedOCREngine || !selectedNlpEngine || !selectedSearchEngine || !selectedSummarizerEngine
            ),
            // Selectors are disabled if NO file is stored, or if the app is busy processing.
            // After processing is done, they become enabled again.
            areSelectorsDisabled: !isFileStored || isUploading || isProcessing,
        },
        results,
    };
};