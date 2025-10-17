import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ENGINE_LOGOS } from "@/lib/constants";

interface EngineSelectionProps {
    engines: any;
    isDisabled: boolean;
    selection: {
        selectedOCREngine: string | null;
        setSelectedOCREngine: (val: string) => void;
        selectedNlpEngine: string | null;
        setSelectedNlpEngine: (val: string) => void;
        selectedSearchEngine: string | null;
        setSelectedSearchEngine: (val: string) => void;
        selectedSummarizerEngine: string | null;
        setSelectedSummarizerEngine: (val: string) => void;
    }
}

const EngineSelectItem = ({ engine }: { engine: string }) => (
    <SelectItem key={engine} value={engine}>
        <div className="flex items-center gap-2">
            <img className="size-5 rounded" src={ENGINE_LOGOS[engine]} alt={engine} width={20} height={20} />
            <span className="truncate capitalize">{engine.replace(/_/g, ' ')}</span>
        </div>
    </SelectItem>
);

export default function EngineSelection({ engines, isDisabled, selection }: EngineSelectionProps) {
    return (
        <div className="px-6 pb-4 mb-2">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="ocrSelect" className="mb-2">Desired OCR tool</Label>
                    <Select disabled={isDisabled} onValueChange={selection.setSelectedOCREngine}>
                        <SelectTrigger className='ps-2 w-full' id="ocrSelect"><SelectValue placeholder="Select OCR engine" /></SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {engines?.ocr_engines?.map((engine: string) => <EngineSelectItem key={engine} engine={engine} />)}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="nlpSelect" className="mb-2">Desired keywords finder tool</Label>
                    <Select disabled={isDisabled} onValueChange={selection.setSelectedNlpEngine}>
                        <SelectTrigger className='ps-2 w-full' id="nlpSelect"><SelectValue placeholder="Select NLP engine" /></SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {engines?.nlp_engines?.map((engine: string) => <EngineSelectItem key={engine} engine={engine} />)}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label htmlFor="searchSelect" className="mb-2">Desired search tool</Label>
                    <Select disabled={isDisabled} onValueChange={selection.setSelectedSearchEngine}>
                        <SelectTrigger className='ps-2 w-full' id="searchSelect"><SelectValue placeholder="Select search engine" /></SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {engines?.search_engines?.map((engine: string) => <EngineSelectItem key={engine} engine={engine} />)}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="summarizerSelect" className="mb-2">Desired summarizer tool</Label>
                    <Select disabled={isDisabled} onValueChange={selection.setSelectedSummarizerEngine}>
                        <SelectTrigger className='ps-2 w-full' id="summarizerSelect"><SelectValue placeholder="Select summarizer engine" /></SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {engines?.summarizer_engines?.map((engine: string) => <EngineSelectItem key={engine} engine={engine} />)}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}