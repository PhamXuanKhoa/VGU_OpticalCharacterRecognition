import { useRef } from "react";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";

interface FileUploadZoneProps {
    onFileSelect: (files: FileList | null) => void;
    uploadedFiles: File[];
    fileProgresses: Record<string, number>;
    isDisabled: boolean;
}

export default function FileUploadZone({ onFileSelect, uploadedFiles, fileProgresses, isDisabled }: FileUploadZoneProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleBoxClick = () => fileInputRef.current?.click();
    const handleDragOver = (e: React.DragEvent) => e.preventDefault();
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (isDisabled) return;
        onFileSelect(e.dataTransfer.files);
    };

    const getFileIcon = (fileType: string): string => {
        if (fileType === 'application/pdf') return '/icons/pdf.png';
        if (fileType.startsWith('image/')) return '/icons/image.png';
        return '/icons/file.png';
    };

    return (
        <div className="px-6">
            <div
                className={cn(
                    "border-2 border-dashed border-border rounded-md p-8 flex flex-col items-center justify-center text-center",
                    !isDisabled && "cursor-pointer hover:border-primary"
                )}
                onClick={!isDisabled ? handleBoxClick : undefined}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <div className="mb-2 bg-muted rounded-full p-3">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">Upload a file to process</p>
                <p className="text-sm text-muted-foreground mt-1">or,{" "}
                    <label className={cn(!isDisabled && "text-primary hover:text-primary/90 font-medium cursor-pointer")}>
                        click to browse
                    </label>
                </p>
                <input
                    type="file"
                    disabled={isDisabled}
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*, .pdf, .txt"
                    onChange={(e) => onFileSelect(e.target.files)}
                />
            </div>

            <div className={cn("space-y-3", uploadedFiles.length > 0 ? "mt-4" : "")}>
                {uploadedFiles.map((file, index) => (
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