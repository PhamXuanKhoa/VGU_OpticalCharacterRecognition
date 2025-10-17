import ResultCard from "./ResultCard";
import type { ProcessingResults } from "@/components/hooks/useApi";

interface ResultsDisplayProps {
    isDoneProcessing: boolean;
    results: ProcessingResults | null;
}

export default function ResultsDisplay({ isDoneProcessing, results }: ResultsDisplayProps) {
    if (!isDoneProcessing || !results) {
        return null;
    }

    return (
        <>
            <div className="flex flex-col md:flex-row items-stretch justify-center p-10 gap-4">
                <ResultCard
                    title="OCR Result"
                    description="The text from your file has been successfully extracted."
                    tooltipText="This is the recognized text from your document."
                    copyText={results.ocr}
                >
                    <p>{results.ocr}</p>
                </ResultCard>
                <ResultCard
                    title="Extracted Keywords"
                    description="Keywords found in your text are listed below."
                    tooltipText="These are important keywords identified from the extracted text."
                    copyText={results.keywords.join(', ')}
                >
                    <p>{results.keywords.join(', ')}</p>
                </ResultCard>
            </div>
            <div className="flex flex-col md:flex-row items-stretch justify-center p-10 pt-0 gap-4">
                <ResultCard
                    title="Document Links"
                    description="Relevant articles found online based on your document."
                    tooltipText="These are links to articles found using the extracted keywords."
                    copyText={results.links.join('\n')}
                >
                    {results.links.map((link, i) => (
                        <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="block text-blue-500 hover:underline">{link}</a>
                    ))}
                </ResultCard>
                <ResultCard
                    title="Document Summarization"
                    description="Your document has been successfully summarized."
                    tooltipText="This is a summary of the relevant documents found online."
                    copyText={results.summary}
                >
                    <p>{results.summary}</p>
                </ResultCard>
            </div>
        </>
    );
}