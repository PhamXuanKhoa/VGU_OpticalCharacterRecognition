"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { HelpCircle, Upload, Loader2 } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";

export default function FileUpload(): JSX.Element {
    const API_URL = "http://localhost:8000/";
    const [selectedOCREngine, setSelectedOCREngine] = useState<string | null>(null);
    const [selectedNlpEngine, setSelectedNlpEngine] = useState<string | null>(null);
    const [selectedSearchEngine, setSelectedSearchEngine] = useState<string | null>(null);
    const [selectedSummarizerEngine, setSelectedSummarizerEngine] = useState<string | null>(null);

    const [isDoneProcessing, setIsDoneProcessing] = useState(false);

    const engineLogos: Record<string, string> = {
        dummy: "/logos/Dummy.png",
        gemini: "/logos/Gemini.png",
        google: "/logos/Google.svg",
        duckduckgo: "/logos/DuckDuckGo.svg"
    };

    const [isPageLoading, setIsPageLoading] = useState(true);
    const [availableEngines, setAvailableEngines] = useState<any>(null);

    useEffect(() => {
        const xhr = new XMLHttpRequest();
        const url = API_URL + "available-engines";

        xhr.open("GET", url, true);

        xhr.onload = function () {
            setIsPageLoading(false);
            if (xhr.status >= 200 && xhr.status < 300) {
                setAvailableEngines(JSON.parse(xhr.responseText));
                console.log(JSON.parse(xhr.responseText));
            } else {
                console.error("Preload error:", xhr.statusText);
            }
        };

        xhr.onerror = function (): void {
            setIsPageLoading(false);
            console.error("Network error during preload.");
        };

        xhr.send();
    }, []);

    const handleStartProcessing = async (): Promise<void> => {
        if (!taskId) {
            console.error("No taskId set yet");
            return;
        }

        try {
            setIsProcessing(true);
            setIsDisableProcessButton(true);

            const firstResponse = await new Promise<any>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("POST", `${API_URL}select-engines/${taskId}`, true);
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve(JSON.parse(xhr.responseText));
                        } else {
                            reject(new Error(`Request 1 failed: ${xhr.status}`));
                        }
                    }
                };
                xhr.onerror = () => reject(new Error("Network error on Request 1"));
                xhr.send(
                    JSON.stringify({
                        ocr: selectedOCREngine,
                        nlp: selectedNlpEngine,
                        search: selectedSearchEngine,
                        summarizer: selectedSummarizerEngine,
                    })
                );
            });

            const secondResponse = await new Promise<any>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("POST", `${API_URL}process-task/${taskId}`, true);
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve(JSON.parse(xhr.responseText));
                        } else {
                            reject(new Error(`Request 2 failed: ${xhr.status}`));
                        }
                    }
                };
                xhr.onerror = () => reject(new Error("Network error on Request 2"));
                xhr.send();
            });

            console.log("First response:", firstResponse);
            console.log("Second response:", secondResponse);
        } catch (err) {
            console.error(err);
        } finally {
            const ocrResultResponse = await new Promise<any>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("GET", `${API_URL}results/${taskId}/extracted-text`, true);
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve(JSON.parse(xhr.responseText));
                        } else {
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

            const nlpResultResponse = await new Promise<any>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("GET", `${API_URL}results/${taskId}/keywords`, true);
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve(JSON.parse(xhr.responseText));
                        } else {
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

            const documentLinksResultResponse = await new Promise<any>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("GET", `${API_URL}results/${taskId}/document-links`, true);
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve(JSON.parse(xhr.responseText));
                        } else {
                            reject(new Error(`Request failed: ${xhr.status}`));
                        }
                    }
                };
                xhr.onerror = () => reject(new Error("Network error"));
                xhr.send();
            });

            const linksElement = document.getElementById("document-links-result-text");
            if (linksElement) {
                linksElement.innerHTML = documentLinksResultResponse.document_links.join('<br>');;
            }

            const summaryResultResponse = await new Promise<any>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("GET", `${API_URL}results/${taskId}/summary`, true);
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve(JSON.parse(xhr.responseText));
                        } else {
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

    const handleCopyOcr = async (): Promise<void> => {
        const textElement= document.querySelector("#ocr-result-text");

        if (!textElement) {
            console.error("No element found with id #ocr-result-text");
            return;
        }

        const textToCopy: string = textElement.textContent ?? "";

        try {
            await navigator.clipboard.writeText(textToCopy);
            console.log("Copied!");
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [fileProgresses, setFileProgresses] = useState<Record<string, number>>(
        {}
    );

    const [isProcessing, setIsProcessing] = useState(false);
    const [isDisaled, setIsDisaled] = useState(false);
    const [isDisableProcessButton, setIsDisableProcessButton] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [taskId, setTaskId] = useState<string | null>(null);

    const [isDisableOCRSelectEngine, setIsDisableOCRSelectEngine] = useState(true);
    const [isDisableKeywordFinderEngine, setIsDisableKeywordFinderEngine] = useState(true);
    const [isDisableSearchSelectEngine, setIsDisableSearchSelectEngine] = useState(true);
    const [isDisableSummarizerSelectEngine, setIsDisableSummarizerSelectEngine] = useState(true);

    const handleBoxClick:() => void = (): void => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (files: FileList | null): void => {
        if (!files) return;

        setIsUploading(true);

        const newFiles: File[] = Array.from(files);
        setUploadedFiles((prev: File[]): File[] => [...prev, ...newFiles]);

        newFiles.forEach(async (file: File): Promise<void> => {
            setIsDisaled(true);

            let progress: number = 0;
            const interval: any = setInterval((): void => {
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

            const url = API_URL + "upload-image";
            xhr.open("POST", url, true);

            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const data = JSON.parse(xhr.responseText);
                    console.log("Success:", data);
                } else {
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
                } else {
                    console.error("Error uploading file:", xhr.statusText);
                }
            };
        });
    };

    const handleDragOver = (e: React.DragEvent): void => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent): void => {
        e.preventDefault();
        if (isDisaled) return;
        handleFileSelect(e.dataTransfer.files);
    };

    return (
        <>
            {isPageLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
                    <div className="flex items-center space-x-3 text-lg font-medium text-foreground">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <p className="text-lg text-muted-foreground mt-1">Retrieving information...</p>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-center p-10">
                <Card className="w-full mx-auto max-w-lg bg-card rounded-lg p-0 shadow-md">
                    <CardContent className="p-0">
                        <div className="p-6 pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-medium text-foreground">
                                        Optical Character Recognition & Summarizer - A Project By Group 3
                                    </h2>
                                    <p className="text-lg text-muted-foreground mt-1">
                                        Drag or drop file here to start processing.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 pb-4 mt-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="projectName" className="mb-2">Desired OCR tool</Label>
                                    <Select
                                        disabled={isDisableOCRSelectEngine}
                                        onValueChange={(val: string): void => {
                                            setSelectedOCREngine(val);
                                        }}
                                    >
                                        <SelectTrigger id="projectName" className="ps-2 w-full">
                                            <SelectValue placeholder="Select OCR engine" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {availableEngines?.ocr_engines?.map((engine: string) => (
                                                    <SelectItem key={engine} value={engine}>
                                                        <div className="flex items-center gap-2">
                                                            <img
                                                                className="size-5 rounded"
                                                                src={engineLogos[engine]}
                                                                alt={engine}
                                                                width={20}
                                                                height={20}
                                                            />
                                                            <span className="truncate capitalize">{engine}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="nlpSelect" className="mb-2">
                                        Desired keywords finder tool
                                    </Label>
                                    <Select
                                        disabled={isDisableKeywordFinderEngine}
                                        onValueChange={(val: string): void => {
                                            setSelectedNlpEngine(val);
                                        }}
                                    >
                                        <SelectTrigger id="nlpSelect" className="ps-2 w-full">
                                            <SelectValue placeholder="Select NLP engine" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {availableEngines?.nlp_engines?.map((engine: string) => (
                                                    <SelectItem key={engine} value={engine}>
                                                        <div className="flex items-center gap-2">
                                                            <img
                                                                className="size-5 rounded"
                                                                src={engineLogos[engine]}
                                                                alt={engine}
                                                                width={20}
                                                                height={20}
                                                            />
                                                            <span className="truncate capitalize">{engine}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 pb-4 mt-2" style={{marginTop: "0px"}}>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="searchSelect" className="mb-2">Desired search tool</Label>
                                    <Select
                                        disabled={isDisableSearchSelectEngine}
                                        onValueChange={(val: string): void => {
                                            setSelectedSearchEngine(val);
                                        }}
                                    >
                                        <SelectTrigger id="searchSelect" className="ps-2 w-full">
                                            <SelectValue placeholder="Select search engine" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {availableEngines?.search_engines?.map((engine: string) => (
                                                    <SelectItem key={engine} value={engine}>
                                                        <div className="flex items-center gap-2">
                                                            <img
                                                                className="size-5 rounded"
                                                                src={engineLogos[engine]}
                                                                alt={engine}
                                                                width={20}
                                                                height={20}
                                                            />
                                                            <span className="truncate capitalize">{engine}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="summarizerSelect" className="mb-2">
                                        Desired summarizer tool
                                    </Label>
                                    <Select
                                        disabled={isDisableSummarizerSelectEngine}
                                        onValueChange={(val: string): void => {
                                            setSelectedSummarizerEngine(val);
                                        }}
                                    >
                                        <SelectTrigger id="summarizerSelect" className="ps-2 w-full">
                                            <SelectValue placeholder="Select summarizer engine" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {availableEngines?.summarizer_engines?.map((engine: string) => (
                                                    <SelectItem key={engine} value={engine}>
                                                        <div className="flex items-center gap-2">
                                                            <img
                                                                className="size-5 rounded"
                                                                src={engineLogos[engine]}
                                                                alt={engine}
                                                                width={20}
                                                                height={20}
                                                            />
                                                            <span className="truncate capitalize">{engine}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="px-6">
                            <div
                                className="border-2 border-dashed border-border rounded-md p-8 flex flex-col items-center justify-center text-center cursor-pointer"
                                onClick={handleBoxClick}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            >
                                <div className="mb-2 bg-muted rounded-full p-3">
                                    <Upload className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium text-foreground">
                                    Upload a file to OCR
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    or,{" "}
                                    <label
                                        htmlFor="fileUpload"
                                        className="text-primary hover:text-primary/90 font-medium cursor-pointer"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        click to browse
                                    </label>
                                </p>
                                <input
                                    type="file"
                                    disabled={isDisaled}
                                    id="fileUpload"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*, .pdf, .txt"
                                    onChange={(e) => handleFileSelect(e.target.files)}
                                />
                            </div>
                        </div>

                        <div
                            className={cn(
                                "px-6 pb-5 space-y-3",
                                uploadedFiles.length > 0 ? "mt-4" : ""
                            )}
                        >
                            {uploadedFiles.map((file: File, index: number) => {
                                let imageUrl: string = '';

                                if (file.type === 'application/pdf') {
                                    imageUrl = '/icons/pdf.png';
                                } else if (file.type.startsWith('image/')) {
                                    imageUrl = '/icons/image.png';
                                } else {
                                    imageUrl = '/icons/file.png';
                                }

                                return (
                                    <div
                                        className="border border-border rounded-lg p-2 flex flex-col"
                                        key={file.name + index}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-18 h-14 rounded-sm flex items-center justify-center self-start row-span-2 overflow-hidden">
                                                <img
                                                    src={imageUrl}
                                                    alt={file.name}
                                                    style={{width:'50px', height:'50px'}}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            <div className="flex-1 pr-1">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                            <span className="text-sm text-foreground truncate max-w-[250px]">
                                {file.name}
                            </span>
                                                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                                {Math.round(file.size / 1024)} KB
                            </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 bg-muted rounded-full overflow-hidden flex-1">
                                                        <div
                                                            className="h-full bg-primary"
                                                            style={{
                                                                width: `${fileProgresses[file.name] || 0}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {Math.round(fileProgresses[file.name] || 0)}%
                        </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="px-6 py-3 border-t border-border bg-muted rounded-b-lg flex justify-between items-center">
                            <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            style={{cursor: "help"}}
                                            variant="ghost"
                                            size="sm"
                                            className="flex items-center text-muted-foreground hover:text-foreground"
                                        >
                                            <HelpCircle className="h-4 w-4 mr-1" />
                                            Need help?
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="py-3 bg-background text-foreground border">
                                        <div className="space-y-1">
                                            <p className="text-[13px] font-medium">Need assistance?</p>
                                            <p className="text-muted-foreground dark:text-muted-background text-xs max-w-[200px]">
                                                Upload your document or image by drag and drop into the area above to start the OCR process.
                                            </p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleStartProcessing}
                                    style={{ cursor: "pointer" }}
                                    className="h-9 px-4 text-sm font-medium"
                                    disabled={isDisableProcessButton}
                                >
                                    {isUploading && !isProcessing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : isProcessing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        "Start processing"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className={cn("hidden items-center justify-center p-10", isDoneProcessing ? 'flex' : 'none')} id="ocrResultCard">
                <Card className="w-full mx-auto max-w-lg bg-card rounded-lg p-0 shadow-md">
                    <CardContent className="p-0">
                        <div className="p-6 pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-medium text-foreground">
                                        OCR Result
                                    </h2>
                                    <p className="text-lg text-muted-foreground mt-1">
                                        The text from your file has been successfully extracted. Please view the results below
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="px-6">
                            <div className="border-2 border-dashed border-border rounded-md p-3 flex flex-col">
                                <p id="ocr-result-text"></p>
                            </div>
                        </div>

                        <div className="px-6 mt-5 py-3 border-t border-border bg-muted rounded-b-lg flex justify-between items-center">
                            <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            style={{cursor: "help"}}
                                            variant="ghost"
                                            size="sm"
                                            className="flex items-center text-muted-foreground hover:text-foreground"
                                        >
                                            <HelpCircle className="h-4 w-4 mr-1" />
                                            What is this?
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="py-3 bg-background text-foreground border">
                                        <div className="space-y-1">
                                            <p className="text-[13px] font-medium">What is this?</p>
                                            <p className="text-muted-foreground dark:text-muted-background text-xs max-w-[200px]">
                                                Above is the recognized text from your document. You can now select and copy it.
                                            </p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleCopyOcr}
                                    style={{cursor: "pointer"}}
                                    className="h-9 px-4 text-sm font-medium">
                                    Copy text
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="w-full mx-auto max-w-lg bg-card rounded-lg p-0 shadow-md">
                    <CardContent className="p-0">
                        <div className="p-6 pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-medium text-foreground">
                                        Extracted Keywords
                                    </h2>
                                    <p className="text-lg text-muted-foreground mt-1">
                                        The keywords found in your text are listed below. You can use them for further research
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="px-6">
                            <div className="border-2 border-dashed border-border rounded-md p-3 flex flex-col">
                                <p id="nlp-result-text"></p>
                            </div>
                        </div>

                        <div className="px-6 mt-5 py-3 border-t border-border bg-muted rounded-b-lg flex justify-between items-center">
                            <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            style={{cursor: "help"}}
                                            variant="ghost"
                                            size="sm"
                                            className="flex items-center text-muted-foreground hover:text-foreground"
                                        >
                                            <HelpCircle className="h-4 w-4 mr-1" />
                                            What is this?
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="py-3 bg-background text-foreground border">
                                        <div className="space-y-1">
                                            <p className="text-[13px] font-medium">What is this?</p>
                                            <p className="text-muted-foreground dark:text-muted-background text-xs max-w-[200px]">
                                                Above is the recognized text from your document. You can now select and copy it.
                                            </p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <div className="flex gap-2">
                                <Button
                                    style={{cursor: "pointer"}}
                                    className="h-9 px-4 text-sm font-medium">
                                    Copy keywords
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className={cn("hidden items-center justify-center p-10", isDoneProcessing ? 'flex' : 'none')} id="ocrResultCard">
                <Card className="w-full mx-auto max-w-lg bg-card rounded-lg p-0 shadow-md">
                    <CardContent className="p-0">
                        <div className="p-6 pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-medium text-foreground">
                                        Document Links
                                    </h2>
                                    <p className="text-lg text-muted-foreground mt-1">
                                        Here are the most relevant articles found online based on your document
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="px-6">
                            <div className="border-2 border-dashed border-border rounded-md p-3 flex flex-col">
                                <p id="document-links-result-text"></p>
                            </div>
                        </div>

                        <div className="px-6 mt-5 py-3 border-t border-border bg-muted rounded-b-lg flex justify-between items-center">
                            <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            style={{cursor: "help"}}
                                            variant="ghost"
                                            size="sm"
                                            className="flex items-center text-muted-foreground hover:text-foreground"
                                        >
                                            <HelpCircle className="h-4 w-4 mr-1" />
                                            What is this?
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="py-3 bg-background text-foreground border">
                                        <div className="space-y-1">
                                            <p className="text-[13px] font-medium">What is this?</p>
                                            <p className="text-muted-foreground dark:text-muted-background text-xs max-w-[200px]">
                                                Above is the recognized text from your document. You can now select and copy it.
                                            </p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <div className="flex gap-2">
                                <Button
                                    style={{cursor: "pointer"}}
                                    className="h-9 px-4 text-sm font-medium">
                                    Copy links
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="w-full mx-auto max-w-lg bg-card rounded-lg p-0 shadow-md">
                    <CardContent className="p-0">
                        <div className="p-6 pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-medium text-foreground">
                                        Document Summarization
                                    </h2>
                                    <p className="text-lg text-muted-foreground mt-1">
                                        Your document has been successfully summarized. You can view the result below
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="px-6">
                            <div className="border-2 border-dashed border-border rounded-md p-3 flex flex-col">
                                <p id="summary-result-text"></p>
                            </div>
                        </div>

                        <div className="px-6 mt-5 py-3 border-t border-border bg-muted rounded-b-lg flex justify-between items-center">
                            <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            style={{cursor: "help"}}
                                            variant="ghost"
                                            size="sm"
                                            className="flex items-center text-muted-foreground hover:text-foreground"
                                        >
                                            <HelpCircle className="h-4 w-4 mr-1" />
                                            What is this?
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="py-3 bg-background text-foreground border">
                                        <div className="space-y-1">
                                            <p className="text-[13px] font-medium">What is this?</p>
                                            <p className="text-muted-foreground dark:text-muted-background text-xs max-w-[200px]">
                                                Above is the recognized text from your document. You can now select and copy it.
                                            </p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <div className="flex gap-2">
                                <Button
                                    style={{cursor: "pointer"}}
                                    className="h-9 px-4 text-sm font-medium">
                                    Copy summarization
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}