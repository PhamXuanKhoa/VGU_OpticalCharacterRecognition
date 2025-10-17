import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import React from "react";

interface ResultCardProps {
    title: string;
    description: string;
    tooltipText: string;
    children: React.ReactNode;
    copyText: string;
}

export default function ResultCard({ title, description, tooltipText, children, copyText }: ResultCardProps) {
    const handleCopy = () => {
        navigator.clipboard.writeText(copyText).catch(err => console.error("Failed to copy:", err));
    };

    return (
        <Card className="w-full mx-auto max-w-lg bg-card rounded-lg p-0 shadow-md flex-1">
            <CardContent className="p-0 flex flex-col h-full">
                <div className="p-6 pb-4">
                    <h2 className="text-2xl font-medium text-foreground">{title}</h2>
                    <p className="text-lg text-muted-foreground mt-1">{description}</p>
                </div>

                <div className="px-6 flex-grow">
                    <div className="border-2 border-dashed border-border rounded-md p-3 h-full overflow-y-auto">
                        <div style={{ wordWrap: "break-word" }}>{children}</div>
                    </div>
                </div>

                <div className="px-6 mt-5 py-3 border-t border-border bg-muted rounded-b-lg flex justify-between items-center">
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button style={{ cursor: "help" }} variant="ghost" size="sm" className="flex items-center text-muted-foreground hover:text-foreground">
                                    <HelpCircle className="h-4 w-4 mr-1" />
                                    What is this?
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="py-3 bg-background text-foreground border">
                                <p className="text-muted-foreground text-xs max-w-[200px]">{tooltipText}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <Button onClick={handleCopy} style={{ cursor: "pointer" }} className="h-9 px-4 text-sm font-medium">
                        Copy
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}