import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Upload, X } from "lucide-react";

interface FileUploadZoneProps {
    onFileSelect: (files: FileList | null) => void;
    uploadedFiles: File[];
    fileProgresses: Record<string, number>;
    isDisabled: boolean;
    onClearStoredImage: () => void;
    // --- FIX: Add the new callback to the interface ---
    onImageStored: () => void;
}

const LOCAL_STORAGE_KEY = 'my-uploaded-image-preview';

export default function FileUploadZone({
                                           onFileSelect,
                                           uploadedFiles,
                                           fileProgresses,
                                           isDisabled,
                                           onClearStoredImage,
                                           onImageStored // --- FIX: Destructure the new prop
                                       }: FileUploadZoneProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);

    // Effect to load the initially stored image on mount
    useEffect(() => {
        const savedImage = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedImage) {
            setImageBase64(savedImage);
        }
    }, []);

    // --- FIX: New effect to watch for completed uploads ---
    useEffect(() => {
        // Find a newly completed image file that isn't already the preview
        const completedImageFile = uploadedFiles.find(file =>
            file.type.startsWith('image/') &&
            (fileProgresses[file.name] ?? 0) === 100
        );

        if (completedImageFile) {
            // Check if we already have a preview. If so, don't re-process.
            // This prevents this effect from running unnecessarily.
            if (!imageBase64) {
                const reader = new FileReader();
                reader.readAsDataURL(completedImageFile);
                reader.onload = () => {
                    const result = reader.result as string;
                    // 1. Save to localStorage
                    localStorage.setItem(LOCAL_STORAGE_KEY, result);
                    // 2. Set the state to show the preview
                    setImageBase64(result);
                    // 3. Notify the parent to disable the form
                    onImageStored();
                };
            }
        }
    }, [fileProgresses, uploadedFiles, onImageStored, imageBase64]);

    const handleRemoveStoredImage = () => {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setImageBase64(null);
        onClearStoredImage();
    };

    // --- The file selection handler is now much simpler ---
    const handleFileSelection = (files: FileList | null) => {
        // It just notifies the parent about the new files.
        onFileSelect(files);
    };

    const handleBoxClick = () => fileInputRef.current?.click();
    const handleDragOver = (e: React.DragEvent) => e.preventDefault();
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (isDisabled) return;
        handleFileSelection(e.dataTransfer.files);
    };

    const getFileIcon = (fileType: string): string => {
        if (fileType === 'application/pdf') return '/icons/pdf.png';
        if (fileType.startsWith('image/')) return '/icons/image.png';
        return '/icons/file.png';
    };

    const inProgressFiles = uploadedFiles.filter(
        file => (fileProgresses[file.name] ?? 0) < 100
    );

    return (
        <div className="px-6">
            <div
                className={cn(
                    "border-2 border-dashed border-border rounded-md p-8 flex flex-col items-center justify-center text-center transition-colors",
                    !isDisabled && "cursor-pointer hover:border-primary",
                    isDisabled && "bg-muted cursor-not-allowed opacity-60"
                )}
                onClick={!isDisabled ? handleBoxClick : undefined}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <div className="mb-2 bg-muted rounded-full p-3">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">
                    {isDisabled ? "An image is already stored. Please remove it before uploading a new one" : "Upload an image to process"}
                </p>
                {!isDisabled && (
                    <p className="text-sm text-muted-foreground mt-1">
                        or,{" "}
                        <label className="text-primary hover:text-primary/90 font-medium cursor-pointer">
                            click to browse
                        </label>
                    </p>
                )}
                <input
                    type="file"
                    disabled={isDisabled}
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileSelection(e.target.files)}
                />
            </div>

            {imageBase64 && (
                <div className="mt-4 border border-border rounded-lg p-2 flex items-center gap-2 relative">
                    <img src={imageBase64} alt="Stored preview" className="w-12 h-12 object-cover rounded-md" />
                    <div className="flex-1">
                        <span className="text-sm text-foreground truncate max-w-[250px]">Choosen Image</span>
                        <p className="text-xs text-muted-foreground">Saved in your browser's storage.</p>
                    </div>
                    <button
                        onClick={handleRemoveStoredImage}
                        className="p-1 rounded-full cursor-pointer hover:bg-muted"
                        title="Remove stored image"
                    >
                        <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                </div>
            )}

            <div className={cn("space-y-3", inProgressFiles.length > 0 ? "mt-4" : "")}>
                {inProgressFiles.map((file, index) => (
                    <div className="border border-border rounded-lg p-2 flex items-center gap-2" key={file.name + index}>
                        <img src={getFileIcon(file.type)} alt="file icon" className="w-12 h-12 object-contain" />
                        <div className="flex-1">
                            <span className="text-sm text-foreground truncate max-w-[250px]">{file.name}</span>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="h-2 bg-muted rounded-full overflow-hidden flex-1">
                                    <div className="h-full bg-accent" style={{ width: `${fileProgresses[file.name] || 0}%` }} />
                                </div>
                                <span className="text-xs text-muted-foreground">{Math.round(fileProgresses[file.name] || 0)}%</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}