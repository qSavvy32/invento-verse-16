
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useInvention } from "@/contexts/InventionContext";
import { GenerateCritiqueButton } from "./GenerateCritiqueButton";
import { CritiqueCard } from "./CritiqueCard";
import { SaveExportSection } from "./SaveExportSection";
import { useCritiqueGeneration } from "./hooks/useCritiqueGeneration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; 
import { Zap, Skull } from "lucide-react";

export const DevilsAdvocate = () => {
  const { state, saveToDatabase } = useInvention();
  const { critiques, isAnalyzing, error, generateCritique } = useCritiqueGeneration();
  
  const handleGenerateCritique = async () => {
    await generateCritique(state.title, state.description, state.sketchDataUrl);
  };

  // Create a wrapper function that properly returns a Promise
  const handleSaveToDatabase = async (showToast?: boolean): Promise<void> => {
    return saveToDatabase(showToast);
  };
  
  return (
    <div className="space-y-6 w-full">
      <Card className="border-red-200 bg-red-50/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-red-500 flex items-center gap-2 text-xl">
            <Skull className="h-5 w-5 text-red-500" />
            Devil's Advocate
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="w-full mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-6">
            <GenerateCritiqueButton 
              isAnalyzing={isAnalyzing}
              onGenerateCritique={handleGenerateCritique}
            />
            
            {critiques && <CritiqueCard critiques={critiques} />}
            
            {/* Save Your Work Section */}
            <SaveExportSection 
              state={state} 
              saveToDatabase={handleSaveToDatabase} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
