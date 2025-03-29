
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useInvention } from "@/contexts/InventionContext";
import { GenerateCritiqueButton } from "./GenerateCritiqueButton";
import { CritiqueCard } from "./CritiqueCard";
import { SaveExportSection } from "./SaveExportSection";
import { useCritiqueGeneration } from "./hooks/useCritiqueGeneration";

export const DevilsAdvocate = () => {
  const { state, saveToDatabase } = useInvention();
  const { critiques, isAnalyzing, error, generateCritique } = useCritiqueGeneration();
  
  const handleGenerateCritique = async () => {
    await generateCritique(state.title, state.description, state.sketchDataUrl);
  };
  
  return (
    <div className="space-y-6 flex flex-col items-center w-full">
      {error && (
        <Alert variant="destructive" className="w-full">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <GenerateCritiqueButton 
        isAnalyzing={isAnalyzing}
        onGenerateCritique={handleGenerateCritique}
      />
      
      {critiques && <CritiqueCard critiques={critiques} />}
      
      {/* Save Your Work Section */}
      <SaveExportSection state={state} saveToDatabase={saveToDatabase} />
    </div>
  );
};
