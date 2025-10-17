"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useApi } from "@/components/hooks/useApi";
import EngineSelection from "./components/EngineSelection";
import FileUploadZone from "./components/FileUploadZone";
import ResultsDisplay from "./components/ResultsDisplay";

export default function FileUpload(): JSX.Element {
    const {
        isPageLoading,
        availableEngines,
        engineSelection,
        fileUpload,
        processing,
        results
    } = useApi();

    if (isPageLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-card">
                <div className="flex items-center space-x-3 text-lg font-medium">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p className="text-lg text-muted-foreground mt-1">Retrieving information...</p>
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
                            <h2 className="text-2xl font-medium text-foreground">
                                Optical Character Recognition & Summarizer
                            </h2>
                            <p className="text-lg text-muted-foreground mt-1">
                                Select your engines and upload a file to start.
                            </p>
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
                            isDisabled={fileUpload.uploadedFiles.length > 0}
                        />

                        <div className="px-6 py-4 mt-4 border-t border-border bg-muted rounded-b-lg flex justify-between items-center">
                            <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button style={{ cursor: "help" }} variant="ghost" size="sm">
                                            <HelpCircle className="h-4 w-4 mr-1" /> Need help?
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Upload your document to start the process.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <Button
                                onClick={processing.handleStartProcessing}
                                disabled={processing.isProcessButtonDisabled}
                                className="h-9 px-4 text-sm font-medium"
                            >
                                {processing.isProcessing ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                                ) : (
                                    "Start processing"
                                )}
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
                        <AlertDialogDescription>
                            Your file has been processed. Please see the results.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => processing.setIsSuccessDialogOpen(false)}>OK</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}