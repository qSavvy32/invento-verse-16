import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useInvention } from "@/contexts/InventionContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Loader2,
  Users,
  Lightbulb,
  Scale,
  BarChart,
  Construction,
  Box,
  Inspect,
  Package
} from "lucide-react";

interface AiAssistantPanelProps {
  onAnalysisComplete: () => void;
}

export const AiAssistantPanel = ({ onAnalysisComplete }: AiAssistantPanelProps) => {
  const { state, updateVisualizations, update3DVisualization, setAnalysisResults, setThreejsVisualization } = useInvention();
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>("technical");
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
    technical: false,
    challenges: false,
    materials: false,
    users: false,
    competition: false,
    ip: false,
    regulatory: false,
    visualization: false,
    threejs: false,
  });
  const [customPrompt, setCustomPrompt] = useState("");
  
  const runAnalysis = async (analysisType: string) => {
    // Don't proceed if there's not enough data
    if (!state.title && !state.description) {
      toast.error("Please provide a title and description first");
      return;
    }
    
    setIsLoading(prev => ({ ...prev, [analysisType]: true }));
    
    try {
      // Log the request for debugging
      console.log(`Starting ${analysisType} analysis with:`, {
        title: state.title,
        description: state.description,
        hasSketch: !!state.sketchDataUrl
      });
      
      const { data, error } = await supabase.functions.invoke("analyze-invention", {
        body: {
          title: state.title,
          description: state.description,
          sketchDataUrl: state.sketchDataUrl,
          analysisType: analysisType,
          customPrompt: analysisType === "custom" ? customPrompt : undefined
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      console.log(`Analysis result for ${analysisType}:`, data);
      
      // Add timestamp to the analysis results
      const timestamp = new Date().toLocaleTimeString();
      
      if (analysisType === "technical") {
        // Check different possible data formats
        let technicalResults: string[] = [];
        
        // If we have engineering_challenges in a structured format
        if (data.engineering_challenges && Array.isArray(data.engineering_challenges)) {
          technicalResults = data.engineering_challenges.map((challenge: any) => 
            `${challenge.challenge || challenge.name || 'Challenge'}: ${challenge.description || challenge.explanation || ''}`
          );
        } 
        // If we have design_considerations in a structured format
        else if (data.design_considerations && Array.isArray(data.design_considerations)) {
          technicalResults = data.design_considerations.map((item: any) => 
            `${item.consideration || 'Consideration'}: ${item.explanation || item.description || ''}`
          );
        }
        // If we have technical_feasibility as an object
        else if (data.technical_feasibility && typeof data.technical_feasibility === 'object') {
          technicalResults = [`Technical feasibility (${data.technical_feasibility.assessment || 'unknown'}): ${data.technical_feasibility.explanation || ''}`];
        }
        // If we have a technical array directly
        else if (data.technical && Array.isArray(data.technical)) {
          technicalResults = data.technical;
        }
        // Last resort: if we have key_challenges
        else if (data.key_challenges && Array.isArray(data.key_challenges)) {
          technicalResults = data.key_challenges.map((challenge: any) => 
            typeof challenge === 'string' ? challenge : `${challenge.challenge || 'Challenge'}: ${challenge.description || ''}`
          );
        }
        // Raw text in analysis field
        else if (data.analysis && typeof data.analysis === 'string') {
          technicalResults = [data.analysis];
        }
        // If we have just a plain object with non-standard structure
        else if (typeof data === 'object' && data !== null) {
          // Create results from all object properties
          technicalResults = Object.entries(data)
            .filter(([key]) => !['id', 'created_at', 'updated_at'].includes(key))
            .map(([key, value]) => {
              if (typeof value === 'string') {
                return `${key.replace(/_/g, ' ')}: ${value}`;
              }
              return `${key.replace(/_/g, ' ')}: ${JSON.stringify(value)}`;
            });
        }
        
        // If we still have no results, create a generic response
        if (technicalResults.length === 0) {
          technicalResults = ["Analysis completed but no specific technical points could be extracted."];
        }
        
        // Prepend timestamp to the first result for better tracking
        if (technicalResults.length > 0) {
          technicalResults[0] = `[${timestamp}] ${technicalResults[0]}`;
        }
        
        // Add the results to the existing array
        setAnalysisResults("technical", [...state.analysisResults.technical, ...technicalResults]);
      } 
      // Handle other types of analysis
      else if (["challenges", "materials"].includes(analysisType)) {
        let results: string[] = [];
        
        if (Array.isArray(data)) {
          results = data.map((item: string) => `${item}`);
        }
        else if (data.technical && Array.isArray(data.technical)) {
          results = data.technical;
        }
        else if (typeof data === 'object' && data !== null) {
          results = Object.entries(data)
            .filter(([key]) => key !== 'analysis_type' && key !== 'invention_title' && key !== 'invention_description')
            .map(([key, value]) => {
              if (typeof value === 'string') {
                return `${key.replace(/_/g, ' ')}: ${value}`;
              } else if (Array.isArray(value)) {
                return `${key.replace(/_/g, ' ')}: ${value.join(', ')}`;
              }
              return `${key.replace(/_/g, ' ')}: ${JSON.stringify(value)}`;
            });
        }
        
        if (results.length > 0) {
          results[0] = `[${timestamp} - ${analysisType}] ${results[0]}`;
        } else {
          results = [`[${timestamp}] No specific ${analysisType} analysis results found.`];
        }
        
        setAnalysisResults("technical", [...state.analysisResults.technical, ...results]);
      } 
      else if (["users", "competition"].includes(analysisType)) {
        let results: string[] = [];
        
        if (Array.isArray(data)) {
          results = data;
        } 
        else if (data.market && Array.isArray(data.market)) {
          results = data.market;
        }
        else if (data.user_analysis && typeof data.user_analysis === 'object') {
          // Handle structured user analysis
          results = [];
          
          // Extract primary user group
          if (data.user_analysis.primary_user_group) {
            const primary = data.user_analysis.primary_user_group;
            results.push(`Primary users: ${primary.group_name || 'Unknown'}`);
            
            if (primary.needs_addressed && Array.isArray(primary.needs_addressed)) {
              primary.needs_addressed.forEach((need: string) => {
                results.push(`- Need: ${need}`);
              });
            }
          }
          
          // Extract target user groups
          if (data.user_analysis.target_user_groups && Array.isArray(data.user_analysis.target_user_groups)) {
            data.user_analysis.target_user_groups.forEach((group: any) => {
              results.push(`User group: ${group.group_name} - ${group.description || ''}`);
            });
          }
        }
        else if (typeof data === 'object' && data !== null) {
          results = Object.entries(data)
            .filter(([key]) => key !== 'analysis_type' && key !== 'invention_title' && key !== 'invention_description')
            .map(([key, value]) => {
              if (typeof value === 'string') {
                return `${key.replace(/_/g, ' ')}: ${value}`;
              } else if (Array.isArray(value)) {
                return `${key.replace(/_/g, ' ')}: ${value.join(', ')}`;
              }
              return `${key.replace(/_/g, ' ')}: ${JSON.stringify(value)}`;
            });
        }
        
        if (results.length > 0) {
          results[0] = `[${timestamp} - ${analysisType}] ${results[0]}`;
        } else {
          results = [`[${timestamp}] No specific ${analysisType} analysis results found.`];
        }
        
        setAnalysisResults("market", [...state.analysisResults.market, ...results]);
      } 
      else if (["ip", "regulatory"].includes(analysisType)) {
        let results: string[] = [];
        
        if (Array.isArray(data)) {
          results = data;
        }
        else if (data.legal && Array.isArray(data.legal)) {
          results = data.legal;
        }
        else if (typeof data === 'object' && data !== null) {
          results = Object.entries(data)
            .filter(([key]) => key !== 'analysis_type' && key !== 'invention_title' && key !== 'invention_description')
            .map(([key, value]) => {
              if (typeof value === 'string') {
                return `${key.replace(/_/g, ' ')}: ${value}`;
              } else if (Array.isArray(value)) {
                return `${key.replace(/_/g, ' ')}: ${value.join(', ')}`;
              }
              return `${key.replace(/_/g, ' ')}: ${JSON.stringify(value)}`;
            });
        }
        
        if (results.length > 0) {
          results[0] = `[${timestamp} - ${analysisType}] ${results[0]}`;
        } else {
          results = [`[${timestamp}] No specific ${analysisType} analysis results found.`];
        }
        
        setAnalysisResults("legal", [...state.analysisResults.legal, ...results]);
      } 
      else if (analysisType === "comprehensive") {
        // Process comprehensive analysis which may contain multiple categories
        if (data.technical && Array.isArray(data.technical)) {
          const technicalResults = data.technical;
          if (technicalResults.length > 0) {
            technicalResults[0] = `[${timestamp} - Technical] ${technicalResults[0]}`;
          }
          setAnalysisResults("technical", [...state.analysisResults.technical, ...technicalResults]);
        }
        
        if (data.market && Array.isArray(data.market)) {
          const marketResults = data.market;
          if (marketResults.length > 0) {
            marketResults[0] = `[${timestamp} - Market] ${marketResults[0]}`;
          }
          setAnalysisResults("market", [...state.analysisResults.market, ...marketResults]);
        }
        
        if (data.legal && Array.isArray(data.legal)) {
          const legalResults = data.legal;
          if (legalResults.length > 0) {
            legalResults[0] = `[${timestamp} - Legal] ${legalResults[0]}`;
          }
          setAnalysisResults("legal", [...state.analysisResults.legal, ...legalResults]);
        }
        
        if (data.business && Array.isArray(data.business)) {
          const businessResults = data.business;
          if (businessResults.length > 0) {
            businessResults[0] = `[${timestamp} - Business] ${businessResults[0]}`;
          }
          setAnalysisResults("business", [...state.analysisResults.business, ...businessResults]);
        }
        
        // If we don't have structured data, try to extract from the raw response
        if (!data.technical && !data.market && !data.legal && !data.business) {
          const allPoints = Object.entries(data)
            .filter(([key]) => key !== 'analysis_type' && key !== 'invention_title' && key !== 'invention_description')
            .map(([key, value]) => {
              if (typeof value === 'string') {
                return `${key.replace(/_/g, ' ')}: ${value}`;
              } else if (Array.isArray(value)) {
                return `${key.replace(/_/g, ' ')}: ${value.join(', ')}`;
              }
              return `${key.replace(/_/g, ' ')}: ${JSON.stringify(value)}`;
            });
          
          if (allPoints.length > 0) {
            const third = Math.ceil(allPoints.length / 3);
            
            const technicalResults = allPoints.slice(0, third);
            if (technicalResults.length > 0) {
              technicalResults[0] = `[${timestamp} - Technical] ${technicalResults[0]}`;
              setAnalysisResults("technical", [...state.analysisResults.technical, ...technicalResults]);
            }
            
            const marketResults = allPoints.slice(third, 2 * third);
            if (marketResults.length > 0) {
              marketResults[0] = `[${timestamp} - Market] ${marketResults[0]}`;
              setAnalysisResults("market", [...state.analysisResults.market, ...marketResults]);
            }
            
            const legalResults = allPoints.slice(2 * third);
            if (legalResults.length > 0) {
              legalResults[0] = `[${timestamp} - Legal] ${legalResults[0]}`;
              setAnalysisResults("legal", [...state.analysisResults.legal, ...legalResults]);
            }
          }
        }
      }
      
      // Make sure to notify that the analysis is complete
      onAnalysisComplete();
      toast.success(`${analysisType} analysis complete`);
    } catch (error) {
      console.error(`Error running ${analysisType} analysis:`, error);
      toast.error(`Analysis failed`, {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [analysisType]: false }));
    }
  };
  
  const generate3DVisualization = async () => {
    // Don't proceed if there's not enough data
    if (!state.title && !state.description) {
      toast.error("Please provide a title and description first");
      return;
    }
    
    setIsLoading(prev => ({ ...prev, visualization: true }));
    
    try {
      const promptData = {
        concept: state.description,
        materials: "",
        users: "",
        problem: ""
      };
      
      updateVisualizations(promptData);
      
      const { data, error } = await supabase.functions.invoke("generate-3d-visualization", {
        body: {
          title: state.title,
          description: state.description,
          sketchDataUrl: state.sketchDataUrl,
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.visualization_url) {
        update3DVisualization(data.visualization_url);
        toast.success("3D visualization generated", {
          description: "View it in the 3D Visualization tab"
        });
      } else {
        throw new Error("No visualization URL returned");
      }
    } catch (error) {
      console.error("Error generating 3D visualization:", error);
      toast.error("Visualization failed", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, visualization: false }));
    }
  };
  
  const generateThreejsVisualization = async () => {
    // Don't proceed if there's not enough data
    if (!state.title && !state.description) {
      toast.error("Please provide a title and description first");
      return;
    }
    
    setIsLoading(prev => ({ ...prev, threejs: true }));
    
    try {
      toast.info("Generating 3D visualization with Claude...", {
        description: "This may take a minute to complete"
      });
      
      const { data, error } = await supabase.functions.invoke("generate-threejs-visualization", {
        body: {
          title: state.title,
          description: state.description,
          sketchDataUrl: state.sketchDataUrl
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      console.log("ThreeJS visualization result:", data);
      
      if (data?.visualization_code && data?.visualization_html) {
        setThreejsVisualization(data.visualization_code, data.visualization_html);
        toast.success("ThreeJS visualization generated", {
          description: "The 3D model is now available below"
        });
      } else {
        throw new Error("No visualization code returned");
      }
    } catch (error) {
      console.error("Error generating ThreeJS visualization:", error);
      toast.error("ThreeJS visualization failed", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, threejs: false }));
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        <Button 
          onClick={() => runAnalysis("technical")} 
          disabled={isLoading.technical}
          variant="outline"
          className="flex items-center gap-2 h-auto py-2"
        >
          {isLoading.technical ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Construction className="h-4 w-4" />
          )}
          <div className="text-left">
            <div className="font-medium">Technical Analysis</div>
            <div className="text-xs text-muted-foreground">Feasibility and engineering</div>
          </div>
        </Button>
        
        <Button 
          onClick={() => runAnalysis("users")} 
          disabled={isLoading.users}
          variant="outline"
          className="flex items-center gap-2 h-auto py-2"
        >
          {isLoading.users ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Users className="h-4 w-4" />
          )}
          <div className="text-left">
            <div className="font-medium">User Analysis</div>
            <div className="text-xs text-muted-foreground">Target audience and needs</div>
          </div>
        </Button>
        
        <Button 
          onClick={() => runAnalysis("materials")} 
          disabled={isLoading.materials}
          variant="outline"
          className="flex items-center gap-2 h-auto py-2"
        >
          {isLoading.materials ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Box className="h-4 w-4" />
          )}
          <div className="text-left">
            <div className="font-medium">Materials Analysis</div>
            <div className="text-xs text-muted-foreground">Components and materials</div>
          </div>
        </Button>
        
        <Button 
          onClick={() => runAnalysis("ip")} 
          disabled={isLoading.ip}
          variant="outline"
          className="flex items-center gap-2 h-auto py-2"
        >
          {isLoading.ip ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Scale className="h-4 w-4" />
          )}
          <div className="text-left">
            <div className="font-medium">IP Analysis</div>
            <div className="text-xs text-muted-foreground">Patent and legal issues</div>
          </div>
        </Button>
        
        <Button 
          onClick={() => runAnalysis("competition")} 
          disabled={isLoading.competition}
          variant="outline"
          className="flex items-center gap-2 h-auto py-2"
        >
          {isLoading.competition ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <BarChart className="h-4 w-4" />
          )}
          <div className="text-left">
            <div className="font-medium">Market Analysis</div>
            <div className="text-xs text-muted-foreground">Competition and positioning</div>
          </div>
        </Button>
        
        <Button 
          onClick={() => runAnalysis("challenges")} 
          disabled={isLoading.challenges}
          variant="outline"
          className="flex items-center gap-2 h-auto py-2"
        >
          {isLoading.challenges ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Inspect className="h-4 w-4" />
          )}
          <div className="text-left">
            <div className="font-medium">Key Challenges</div>
            <div className="text-xs text-muted-foreground">Critical issues to solve</div>
          </div>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <Button 
          onClick={() => generate3DVisualization()} 
          disabled={isLoading.visualization}
          variant="outline"
          className="flex items-center"
        >
          {isLoading.visualization ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Lightbulb className="mr-2 h-4 w-4" />
          )}
          <span>Generate AI Image</span>
        </Button>
        
        <Button
          onClick={() => generateThreejsVisualization()}
          disabled={isLoading.threejs}
          variant="outline"
          className="flex items-center"
        >
          {isLoading.threejs ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Package className="mr-2 h-4 w-4" />
          )}
          <span>Generate 3D Visualization</span>
        </Button>
        
        <Button
          onClick={() => runAnalysis("comprehensive")}
          disabled={Object.values(isLoading).some(v => v)}
          variant="outline"
          className="flex items-center"
        >
          {Object.values(isLoading).some(v => v) ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Lightbulb className="mr-2 h-4 w-4" />
          )}
          <span>Comprehensive Analysis</span>
        </Button>
      </div>
    </div>
  );
};
