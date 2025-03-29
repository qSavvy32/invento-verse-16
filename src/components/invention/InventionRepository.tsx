
import { useInvention } from "@/contexts/InventionContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Image, Package, Mic, Languages } from "lucide-react";
import { VoiceInput } from "@/components/VoiceInput";
import { useState } from "react";
import { LANGUAGE_OPTIONS } from "@/components/voice/LanguageSelector";

export const InventionRepository = () => {
  const { state, updateTitle, updateDescription } = useInvention();
  
  const handleTranscriptionComplete = (text: string) => {
    // Append the transcribed text to the existing description
    const newDescription = state.description 
      ? `${state.description}\n\n${text}` 
      : text;
    
    updateDescription(newDescription);
  };
  
  // Helper function to get language label from code
  const getLanguageLabel = (code: string) => {
    const language = LANGUAGE_OPTIONS.find(option => option.value === code);
    return language ? language.label : code;
  };
  
  return (
    <Card className="p-4 h-full">
      <h3 className="text-lg font-semibold mb-4">Invention Repository</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="text-sm font-medium mb-1 block">Title</label>
          <Input
            id="title"
            placeholder="Give your invention a name"
            value={state.title}
            onChange={(e) => updateTitle(e.target.value)}
            className="text-base font-semibold"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="text-sm font-medium mb-1 flex justify-between items-center">
            <span>Description</span>
            <VoiceInput 
              onTranscriptionComplete={handleTranscriptionComplete} 
              className="ml-auto"
            />
          </label>
          <Textarea
            id="description"
            placeholder="Describe your invention..."
            value={state.description}
            onChange={(e) => updateDescription(e.target.value)}
            className="min-h-[120px]"
          />
        </div>
        
        {/* Preview uploaded assets */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Assets</h4>
          
          <div className="grid grid-cols-1 gap-2">
            {state.sketchDataUrl && (
              <div className="flex items-center p-2 border rounded-md">
                <Image className="h-4 w-4 mr-2" />
                <span className="text-sm truncate">Sketch image</span>
                <div className="ml-auto w-12 h-12 bg-gray-100 rounded overflow-hidden">
                  <img src={state.sketchDataUrl} alt="Sketch" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
            
            {state.visualization3dUrl && (
              <div className="flex items-center p-2 border rounded-md">
                <Package className="h-4 w-4 mr-2" />
                <span className="text-sm truncate">3D Visualization</span>
                <div className="ml-auto w-12 h-12 bg-gray-100 rounded overflow-hidden">
                  <img src={state.visualization3dUrl} alt="3D Visualization" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
            
            {state.threejsVisualization.html && (
              <div className="flex items-center p-2 border rounded-md">
                <Package className="h-4 w-4 mr-2" />
                <span className="text-sm truncate">ThreeJS Model</span>
                <div className="ml-auto w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs">
                  3D View
                </div>
              </div>
            )}
            
            {/* Display audio transcriptions */}
            {state.audioTranscriptions.map((transcription, index) => (
              <div key={index} className="flex items-center p-2 border rounded-md">
                <Mic className="h-4 w-4 mr-2" />
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center">
                    <span className="text-sm truncate">Voice Note</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded ml-2 flex items-center">
                      <Languages className="h-3 w-3 mr-1" />
                      {getLanguageLabel(transcription.language)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {transcription.text.substring(0, 50)}...
                  </p>
                </div>
                {transcription.audioUrl && (
                  <audio 
                    src={transcription.audioUrl} 
                    controls 
                    className="h-8 w-24 ml-auto"
                  />
                )}
              </div>
            ))}
          </div>
          
          {!state.sketchDataUrl && 
           !state.visualization3dUrl && 
           !state.threejsVisualization.html &&
           state.audioTranscriptions.length === 0 && (
            <div className="text-sm text-muted-foreground italic">
              No assets uploaded yet. Use the tools to add sketches and visualizations.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
