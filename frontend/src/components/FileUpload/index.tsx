"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useApi } from "@/components/hooks/useApi";
import EngineSelection from "./components/EngineSelection";
import ResultsDisplay from "./components/ResultsDisplay";
import FileUploadZone from "./components/FileUploadZone";

const LOCAL_STORAGE_KEY = 'my-uploaded-image-preview';

export default function FileUpload(): JSX.Element {
    const {
        isPageLoading,
        availableEngines,
        engineSelection,
        fileUpload,
        processing,
        results
    } = useApi();

    // On initial load, check localStorage and update the hook's state
    useEffect(() => {
        const savedImage = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedImage) {
            fileUpload.setIsFileStored(true);
            // Pass the actual Base64 string to the hook so it can be used for upload
            fileUpload.setStoredImageBase64(savedImage);
        }
    }, [fileUpload]); // Dependency on fileUpload object is sufficient

    const handleClearStoredImage = () => {
        fileUpload.setIsFileStored(false);
        fileUpload.clearUploadedFiles();
        // Also clear the stored Base64 data from the hook's state
        fileUpload.setStoredImageBase64(null);
    };

    const handleImageStored = () => {
        fileUpload.setIsFileStored(true);
    };

    if (isPageLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-card">
                <div className="flex items-center space-x-3 text-lg font-medium">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p>Retrieving information...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center justify-center p-10">
                <Card className="w-full mx-auto max-w-lg bg-card p-0 shadow-xl/30" style={{ borderRadius: "10px" }}>
                    <CardContent className="p-0">
                        <div className="p-6 pb-4">
                            <h2 className="text-2xl font-medium">Optical Character Recognition & Summarizer</h2>
                            <p className="text-lg text-muted-foreground mt-1">Select your engines and upload a file to start.</p>
                        </div>

                        <EngineSelection
                            engines={availableEngines}
                            isDisabled={processing.areSelectorsDisabled}
                            selection={engineSelection}
                        />

                        <FileUploadZone
                            onFileSelect={fileUpload.handleFileSelect}
                            uploadedFiles={fileUpload.uploadedFiles}
                            fileProgresses={fileUpload.fileProgresses}
                            isDisabled={fileUpload.isFileStored}
                            onClearStoredImage={handleClearStoredImage}
                            onImageStored={handleImageStored}
                        />

                        <div className="px-6 py-4 mt-4 border-t bg-muted rounded-b-lg flex justify-between items-center">
                            <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button style={{ cursor: "help" }} variant="ghost" size="sm">
                                            <HelpCircle className="h-4 w-4 mr-1" /> Need help?
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Upload your document to start the process.</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <Button onClick={processing.handleStartProcessing} className='cursor-pointer' disabled={processing.isProcessButtonDisabled}>
                                {processing.isProcessing ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                                ) : "Start processing"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <ResultsDisplay isDoneProcessing={processing.isDoneProcessing} results={results} />

            <AlertDialog open={processing.isSuccessDialogOpen} onOpenChange={processing.setIsSuccessDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Done Processing</AlertDialogTitle>
                        <AlertDialogDescription>Your file has been processed. Please see the results.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => processing.setIsSuccessDialogOpen(false)}>OK</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}