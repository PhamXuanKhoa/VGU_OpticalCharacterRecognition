"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { HelpCircle, Upload, Loader2 } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
export default function FileUpload() {
    const [selectedOCREngine, setSelectedOCREngine] = useState(null);
    const [selectedNlpEngine, setSelectedNlpEngine] = useState(null);
    const [selectedSearchEngine, setSelectedSearchEngine] = useState(null);
    const [selectedSummarizerEngine, setSelectedSummarizerEngine] = useState(null);
    const [isDoneProcessing, setIsDoneProcessing] = useState(false);
    const engineLogos = {
        dummy: "/logos/Dummy.png",
        gemini: "/logos/Gemini.png",
        google: "/logos/Google.svg",
        duckduckgo: "/logos/DuckDuckGo.svg"
    };
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [availableEngines, setAvailableEngines] = useState(null);
    useEffect(() => {
        const xhr = new XMLHttpRequest();
        const url = import.meta.env.VITE_API_URL + "available-engines";
        xhr.open("GET", url, true);
        xhr.onload = function () {
            setIsPageLoading(false);
            if (xhr.status >= 200 && xhr.status < 300) {
                setAvailableEngines(JSON.parse(xhr.responseText));
                console.log(JSON.parse(xhr.responseText));
            }
            else {
                console.error("Preload error:", xhr.statusText);
            }
        };
        xhr.onerror = function () {
            setIsPageLoading(false);
            console.error("Network error during preload.");
        };
        xhr.send();
    }, []);
    const handleStartProcessing = async () => {
        if (!taskId) {
            console.error("No taskId set yet");
            return;
        }
        try {
            setIsProcessing(true);
            setIsDisableProcessButton(true);
            const firstResponse = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("POST", `${import.meta.env.VITE_API_URL}select-engines/${taskId}`, true);
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve(JSON.parse(xhr.responseText));
                        }
                        else {
                            reject(new Error(`Request 1 failed: ${xhr.status}`));
                        }
                    }
                };
                xhr.onerror = () => reject(new Error("Network error on Request 1"));
                xhr.send(JSON.stringify({
                    ocr: selectedOCREngine,
                    nlp: selectedNlpEngine,
                    search: selectedSearchEngine,
                    summarizer: selectedSummarizerEngine,
                }));
            });
            const secondResponse = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("POST", `${import.meta.env.VITE_API_URL}process-task/${taskId}`, true);
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve(JSON.parse(xhr.responseText));
                        }
                        else {
                            reject(new Error(`Request 2 failed: ${xhr.status}`));
                        }
                    }
                };
                xhr.onerror = () => reject(new Error("Network error on Request 2"));
                xhr.send();
            });
            console.log("First response:", firstResponse);
            console.log("Second response:", secondResponse);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            const ocrResultResponse = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("GET", `${import.meta.env.VITE_API_URL}results/${taskId}/extracted-text`, true);
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve(JSON.parse(xhr.responseText));
                        }
                        else {
                            reject(new Error(`Request 2 failed: ${xhr.status}`));
                        }
                    }
                };
                xhr.onerror = () => reject(new Error("Network error on Request 1"));
                xhr.send();
            });
            const ocrElement = document.getElementById("ocr-result-text");
            if (ocrElement) {
                ocrElement.textContent = ocrResultResponse.extracted_text ?? "";
            }
            const nlpResultResponse = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("GET", `${import.meta.env.VITE_API_URL}results/${taskId}/keywords`, true);
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve(JSON.parse(xhr.responseText));
                        }
                        else {
                            reject(new Error(`Request failed: ${xhr.status}`));
                        }
                    }
                };
                xhr.onerror = () => reject(new Error("Network error"));
                xhr.send();
            });
            const nlpElement = document.getElementById("nlp-result-text");
            if (nlpElement) {
                nlpElement.textContent = nlpResultResponse.keywords.join(', ');
            }
            const documentLinksResultResponse = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("GET", `${import.meta.env.VITE_API_URL}results/${taskId}/document-links`, true);
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve(JSON.parse(xhr.responseText));
                        }
                        else {
                            reject(new Error(`Request failed: ${xhr.status}`));
                        }
                    }
                };
                xhr.onerror = () => reject(new Error("Network error"));
                xhr.send();
            });
            const linksElement = document.getElementById("document-links-result-text");
            if (linksElement) {
                linksElement.innerHTML = documentLinksResultResponse.document_links.join('<br>');
                ;
            }
            const summaryResultResponse = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("GET", `${import.meta.env.VITE_API_URL}results/${taskId}/summary`, true);
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve(JSON.parse(xhr.responseText));
                        }
                        else {
                            reject(new Error(`Request 2 failed: ${xhr.status}`));
                        }
                    }
                };
                xhr.onerror = () => reject(new Error("Network error on Request 1"));
                xhr.send();
            });
            const summaryElement = document.getElementById("summary-result-text");
            if (summaryElement) {
                summaryElement.textContent = summaryResultResponse.final_summary ?? "";
            }
            setIsProcessing(false);
            setIsDoneProcessing(true);
        }
    };
    const handleCopyOcr = async () => {
        const textElement = document.querySelector("#ocr-result-text");
        if (!textElement) {
            console.error("No element found with id #ocr-result-text");
            return;
        }
        const textToCopy = textElement.textContent ?? "";
        try {
            await navigator.clipboard.writeText(textToCopy);
            console.log("Copied!");
        }
        catch (err) {
            console.error("Failed to copy:", err);
        }
    };
    const fileInputRef = useRef(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [fileProgresses, setFileProgresses] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDisaled, setIsDisaled] = useState(false);
    const [isDisableProcessButton, setIsDisableProcessButton] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [taskId, setTaskId] = useState(null);
    const [isDisableOCRSelectEngine, setIsDisableOCRSelectEngine] = useState(true);
    const [isDisableKeywordFinderEngine, setIsDisableKeywordFinderEngine] = useState(true);
    const [isDisableSearchSelectEngine, setIsDisableSearchSelectEngine] = useState(true);
    const [isDisableSummarizerSelectEngine, setIsDisableSummarizerSelectEngine] = useState(true);
    const handleBoxClick = () => {
        fileInputRef.current?.click();
    };
    const handleFileSelect = (files) => {
        if (!files)
            return;
        setIsUploading(true);
        const newFiles = Array.from(files);
        setUploadedFiles((prev) => [...prev, ...newFiles]);
        newFiles.forEach(async (file) => {
            setIsDisaled(true);
            let progress = 0;
            const interval = setInterval(() => {
                progress = progress + Math.random() * 10;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    setIsDisableProcessButton(false);
                    setIsUploading(false);
                }
                setFileProgresses((prev) => ({
                    ...prev,
                    [file.name]: Math.min(progress, 100),
                }));
            }, 10);
            const formData = new FormData();
            formData.append("file", file);
            const xhr = new XMLHttpRequest();
            const url = import.meta.env.VITE_API_URL + "upload-image";
            xhr.open("POST", url, true);
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const data = JSON.parse(xhr.responseText);
                    console.log("Success:", data);
                }
                else {
                    console.error("Error uploading file:", xhr.statusText);
                }
            };
            xhr.onerror = function () {
                console.error("Error uploading file: A network error occurred.");
            };
            xhr.send(formData);
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const data = JSON.parse(xhr.responseText);
                    const newTaskId = data.task_id;
                    setTaskId(newTaskId);
                    setIsDisableOCRSelectEngine(false);
                    setIsDisableKeywordFinderEngine(false);
                    setIsDisableSearchSelectEngine(false);
                    setIsDisableSummarizerSelectEngine(false);
                }
                else {
                    console.error("Error uploading file:", xhr.statusText);
                }
            };
        });
    };
    const handleDragOver = (e) => {
        e.preventDefault();
    };
    const handleDrop = (e) => {
        e.preventDefault();
        if (isDisaled)
            return;
        handleFileSelect(e.dataTransfer.files);
    };
    return (_jsxs(_Fragment, { children: [isPageLoading && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-background", children: _jsxs("div", { className: "flex items-center space-x-3 text-lg font-medium text-foreground", children: [_jsx(Loader2, { className: "h-6 w-6 animate-spin" }), _jsx("p", { className: "text-lg text-muted-foreground mt-1", children: "Retrieving information..." })] }) })), _jsx("div", { className: "flex items-center justify-center p-10", children: _jsx(Card, { className: "w-full mx-auto max-w-lg bg-card rounded-lg p-0 shadow-md", children: _jsxs(CardContent, { className: "p-0", children: [_jsx("div", { className: "p-6 pb-4", children: _jsx("div", { className: "flex justify-between items-start", children: _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-medium text-foreground", children: "Optical Character Recognition & Summarizer - A Project By Group 3" }), _jsx("p", { className: "text-lg text-muted-foreground mt-1", children: "Drag or drop file here to start processing." })] }) }) }), _jsx("div", { className: "px-6 pb-4 mt-2", children: _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "projectName", className: "mb-2", children: "Desired OCR tool" }), _jsxs(Select, { disabled: isDisableOCRSelectEngine, onValueChange: (val) => {
                                                        setSelectedOCREngine(val);
                                                    }, children: [_jsx(SelectTrigger, { id: "projectName", className: "ps-2 w-full", children: _jsx(SelectValue, { placeholder: "Select OCR engine" }) }), _jsx(SelectContent, { children: _jsx(SelectGroup, { children: availableEngines?.ocr_engines?.map((engine) => (_jsx(SelectItem, { value: engine, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("img", { className: "size-5 rounded", src: engineLogos[engine], alt: engine, width: 20, height: 20 }), _jsx("span", { className: "truncate capitalize", children: engine })] }) }, engine))) }) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "nlpSelect", className: "mb-2", children: "Desired keywords finder tool" }), _jsxs(Select, { disabled: isDisableKeywordFinderEngine, onValueChange: (val) => {
                                                        setSelectedNlpEngine(val);
                                                    }, children: [_jsx(SelectTrigger, { id: "nlpSelect", className: "ps-2 w-full", children: _jsx(SelectValue, { placeholder: "Select NLP engine" }) }), _jsx(SelectContent, { children: _jsx(SelectGroup, { children: availableEngines?.nlp_engines?.map((engine) => (_jsx(SelectItem, { value: engine, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("img", { className: "size-5 rounded", src: engineLogos[engine], alt: engine, width: 20, height: 20 }), _jsx("span", { className: "truncate capitalize", children: engine })] }) }, engine))) }) })] })] })] }) }), _jsx("div", { className: "px-6 pb-4 mt-2", style: { marginTop: "0px" }, children: _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "searchSelect", className: "mb-2", children: "Desired search tool" }), _jsxs(Select, { disabled: isDisableSearchSelectEngine, onValueChange: (val) => {
                                                        setSelectedSearchEngine(val);
                                                    }, children: [_jsx(SelectTrigger, { id: "searchSelect", className: "ps-2 w-full", children: _jsx(SelectValue, { placeholder: "Select search engine" }) }), _jsx(SelectContent, { children: _jsx(SelectGroup, { children: availableEngines?.search_engines?.map((engine) => (_jsx(SelectItem, { value: engine, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("img", { className: "size-5 rounded", src: engineLogos[engine], alt: engine, width: 20, height: 20 }), _jsx("span", { className: "truncate capitalize", children: engine })] }) }, engine))) }) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "summarizerSelect", className: "mb-2", children: "Desired summarizer tool" }), _jsxs(Select, { disabled: isDisableSummarizerSelectEngine, onValueChange: (val) => {
                                                        setSelectedSummarizerEngine(val);
                                                    }, children: [_jsx(SelectTrigger, { id: "summarizerSelect", className: "ps-2 w-full", children: _jsx(SelectValue, { placeholder: "Select summarizer engine" }) }), _jsx(SelectContent, { children: _jsx(SelectGroup, { children: availableEngines?.summarizer_engines?.map((engine) => (_jsx(SelectItem, { value: engine, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("img", { className: "size-5 rounded", src: engineLogos[engine], alt: engine, width: 20, height: 20 }), _jsx("span", { className: "truncate capitalize", children: engine })] }) }, engine))) }) })] })] })] }) }), _jsx("div", { className: "px-6", children: _jsxs("div", { className: "border-2 border-dashed border-border rounded-md p-8 flex flex-col items-center justify-center text-center cursor-pointer", onClick: handleBoxClick, onDragOver: handleDragOver, onDrop: handleDrop, children: [_jsx("div", { className: "mb-2 bg-muted rounded-full p-3", children: _jsx(Upload, { className: "h-5 w-5 text-muted-foreground" }) }), _jsx("p", { className: "text-sm font-medium text-foreground", children: "Upload a file to OCR" }), _jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: ["or,", " ", _jsx("label", { htmlFor: "fileUpload", className: "text-primary hover:text-primary/90 font-medium cursor-pointer", onClick: (e) => e.stopPropagation(), children: "click to browse" })] }), _jsx("input", { type: "file", disabled: isDisaled, id: "fileUpload", ref: fileInputRef, className: "hidden", accept: "image/*, .pdf, .txt", onChange: (e) => handleFileSelect(e.target.files) })] }) }), _jsx("div", { className: cn("px-6 pb-5 space-y-3", uploadedFiles.length > 0 ? "mt-4" : ""), children: uploadedFiles.map((file, index) => {
                                    let imageUrl = '';
                                    if (file.type === 'application/pdf') {
                                        imageUrl = '/icons/pdf.png';
                                    }
                                    else if (file.type.startsWith('image/')) {
                                        imageUrl = '/icons/image.png';
                                    }
                                    else {
                                        imageUrl = '/icons/file.png';
                                    }
                                    return (_jsx("div", { className: "border border-border rounded-lg p-2 flex flex-col", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-18 h-14 rounded-sm flex items-center justify-center self-start row-span-2 overflow-hidden", children: _jsx("img", { src: imageUrl, alt: file.name, style: { width: '50px', height: '50px' }, className: "w-full h-full object-cover" }) }), _jsxs("div", { className: "flex-1 pr-1", children: [_jsx("div", { className: "flex justify-between items-center", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-foreground truncate max-w-[250px]", children: file.name }), _jsxs("span", { className: "text-sm text-muted-foreground whitespace-nowrap", children: [Math.round(file.size / 1024), " KB"] })] }) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "h-2 bg-muted rounded-full overflow-hidden flex-1", children: _jsx("div", { className: "h-full bg-primary", style: {
                                                                            width: `${fileProgresses[file.name] || 0}%`,
                                                                        } }) }), _jsxs("span", { className: "text-xs text-muted-foreground whitespace-nowrap", children: [Math.round(fileProgresses[file.name] || 0), "%"] })] })] })] }) }, file.name + index));
                                }) }), _jsxs("div", { className: "px-6 py-3 border-t border-border bg-muted rounded-b-lg flex justify-between items-center", children: [_jsx(TooltipProvider, { delayDuration: 0, children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsxs(Button, { style: { cursor: "help" }, variant: "ghost", size: "sm", className: "flex items-center text-muted-foreground hover:text-foreground", children: [_jsx(HelpCircle, { className: "h-4 w-4 mr-1" }), "Need help?"] }) }), _jsx(TooltipContent, { className: "py-3 bg-background text-foreground border", children: _jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-[13px] font-medium", children: "Need assistance?" }), _jsx("p", { className: "text-muted-foreground dark:text-muted-background text-xs max-w-[200px]", children: "Upload your document or image by drag and drop into the area above to start the OCR process." })] }) })] }) }), _jsx("div", { className: "flex gap-2", children: _jsx(Button, { onClick: handleStartProcessing, style: { cursor: "pointer" }, className: "h-9 px-4 text-sm font-medium", disabled: isDisableProcessButton, children: isUploading && !isProcessing ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Uploading..."] })) : isProcessing ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Processing..."] })) : ("Start processing") }) })] })] }) }) }), _jsxs("div", { className: cn("hidden items-center justify-center p-10", isDoneProcessing ? 'flex' : 'none'), id: "ocrResultCard", children: [_jsx(Card, { className: "w-full mx-auto max-w-lg bg-card rounded-lg p-0 shadow-md", children: _jsxs(CardContent, { className: "p-0", children: [_jsx("div", { className: "p-6 pb-4", children: _jsx("div", { className: "flex justify-between items-start", children: _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-medium text-foreground", children: "OCR Result" }), _jsx("p", { className: "text-lg text-muted-foreground mt-1", children: "The text from your file has been successfully extracted. Please view the results below" })] }) }) }), _jsx("div", { className: "px-6", children: _jsx("div", { className: "border-2 border-dashed border-border rounded-md p-3 flex flex-col", children: _jsx("p", { id: "ocr-result-text" }) }) }), _jsxs("div", { className: "px-6 mt-5 py-3 border-t border-border bg-muted rounded-b-lg flex justify-between items-center", children: [_jsx(TooltipProvider, { delayDuration: 0, children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsxs(Button, { style: { cursor: "help" }, variant: "ghost", size: "sm", className: "flex items-center text-muted-foreground hover:text-foreground", children: [_jsx(HelpCircle, { className: "h-4 w-4 mr-1" }), "What is this?"] }) }), _jsx(TooltipContent, { className: "py-3 bg-background text-foreground border", children: _jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-[13px] font-medium", children: "What is this?" }), _jsx("p", { className: "text-muted-foreground dark:text-muted-background text-xs max-w-[200px]", children: "Above is the recognized text from your document. You can now select and copy it." })] }) })] }) }), _jsx("div", { className: "flex gap-2", children: _jsx(Button, { onClick: handleCopyOcr, style: { cursor: "pointer" }, className: "h-9 px-4 text-sm font-medium", children: "Copy text" }) })] })] }) }), _jsx(Card, { className: "w-full mx-auto max-w-lg bg-card rounded-lg p-0 shadow-md", children: _jsxs(CardContent, { className: "p-0", children: [_jsx("div", { className: "p-6 pb-4", children: _jsx("div", { className: "flex justify-between items-start", children: _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-medium text-foreground", children: "Extracted Keywords" }), _jsx("p", { className: "text-lg text-muted-foreground mt-1", children: "The keywords found in your text are listed below. You can use them for further research" })] }) }) }), _jsx("div", { className: "px-6", children: _jsx("div", { className: "border-2 border-dashed border-border rounded-md p-3 flex flex-col", children: _jsx("p", { id: "nlp-result-text" }) }) }), _jsxs("div", { className: "px-6 mt-5 py-3 border-t border-border bg-muted rounded-b-lg flex justify-between items-center", children: [_jsx(TooltipProvider, { delayDuration: 0, children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsxs(Button, { style: { cursor: "help" }, variant: "ghost", size: "sm", className: "flex items-center text-muted-foreground hover:text-foreground", children: [_jsx(HelpCircle, { className: "h-4 w-4 mr-1" }), "What is this?"] }) }), _jsx(TooltipContent, { className: "py-3 bg-background text-foreground border", children: _jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-[13px] font-medium", children: "What is this?" }), _jsx("p", { className: "text-muted-foreground dark:text-muted-background text-xs max-w-[200px]", children: "Above is the recognized text from your document. You can now select and copy it." })] }) })] }) }), _jsx("div", { className: "flex gap-2", children: _jsx(Button, { style: { cursor: "pointer" }, className: "h-9 px-4 text-sm font-medium", children: "Copy keywords" }) })] })] }) })] }), _jsxs("div", { className: cn("hidden items-center justify-center p-10", isDoneProcessing ? 'flex' : 'none'), id: "ocrResultCard", children: [_jsx(Card, { className: "w-full mx-auto max-w-lg bg-card rounded-lg p-0 shadow-md", children: _jsxs(CardContent, { className: "p-0", children: [_jsx("div", { className: "p-6 pb-4", children: _jsx("div", { className: "flex justify-between items-start", children: _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-medium text-foreground", children: "Document Links" }), _jsx("p", { className: "text-lg text-muted-foreground mt-1", children: "Here are the most relevant articles found online based on your document" })] }) }) }), _jsx("div", { className: "px-6", children: _jsx("div", { className: "border-2 border-dashed border-border rounded-md p-3 flex flex-col", children: _jsx("p", { id: "document-links-result-text" }) }) }), _jsxs("div", { className: "px-6 mt-5 py-3 border-t border-border bg-muted rounded-b-lg flex justify-between items-center", children: [_jsx(TooltipProvider, { delayDuration: 0, children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsxs(Button, { style: { cursor: "help" }, variant: "ghost", size: "sm", className: "flex items-center text-muted-foreground hover:text-foreground", children: [_jsx(HelpCircle, { className: "h-4 w-4 mr-1" }), "What is this?"] }) }), _jsx(TooltipContent, { className: "py-3 bg-background text-foreground border", children: _jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-[13px] font-medium", children: "What is this?" }), _jsx("p", { className: "text-muted-foreground dark:text-muted-background text-xs max-w-[200px]", children: "Above is the recognized text from your document. You can now select and copy it." })] }) })] }) }), _jsx("div", { className: "flex gap-2", children: _jsx(Button, { style: { cursor: "pointer" }, className: "h-9 px-4 text-sm font-medium", children: "Copy links" }) })] })] }) }), _jsx(Card, { className: "w-full mx-auto max-w-lg bg-card rounded-lg p-0 shadow-md", children: _jsxs(CardContent, { className: "p-0", children: [_jsx("div", { className: "p-6 pb-4", children: _jsx("div", { className: "flex justify-between items-start", children: _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-medium text-foreground", children: "Document Summarization" }), _jsx("p", { className: "text-lg text-muted-foreground mt-1", children: "Your document has been successfully summarized. You can view the result below" })] }) }) }), _jsx("div", { className: "px-6", children: _jsx("div", { className: "border-2 border-dashed border-border rounded-md p-3 flex flex-col", children: _jsx("p", { id: "summary-result-text" }) }) }), _jsxs("div", { className: "px-6 mt-5 py-3 border-t border-border bg-muted rounded-b-lg flex justify-between items-center", children: [_jsx(TooltipProvider, { delayDuration: 0, children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsxs(Button, { style: { cursor: "help" }, variant: "ghost", size: "sm", className: "flex items-center text-muted-foreground hover:text-foreground", children: [_jsx(HelpCircle, { className: "h-4 w-4 mr-1" }), "What is this?"] }) }), _jsx(TooltipContent, { className: "py-3 bg-background text-foreground border", children: _jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-[13px] font-medium", children: "What is this?" }), _jsx("p", { className: "text-muted-foreground dark:text-muted-background text-xs max-w-[200px]", children: "Above is the recognized text from your document. You can now select and copy it." })] }) })] }) }), _jsx("div", { className: "flex gap-2", children: _jsx(Button, { style: { cursor: "pointer" }, className: "h-9 px-4 text-sm font-medium", children: "Copy summarization" }) })] })] }) })] })] }));
}
