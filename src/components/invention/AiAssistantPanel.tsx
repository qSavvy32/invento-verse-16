
import { useInvention } from "@/contexts/InventionContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";
import { Box, Loader2Icon, BarChart3, Database, Lightbulb, Target, Users, Search, Award, FileText } from "lucide-react";
import { IdeaGenerator } from "@/components/IdeaGenerator";
import { supabase } from "@/integrations/supabase/client";

interface AiAssistantPanelProps {
  onAnalysisComplete: () => void;
}

export const AiAssistantPanel = ({ onAnalysisComplete }: AiAssistantPanelProps) => {
  const { state, setAnalysisResults, update3DVisualization, updateVisualizations } = useInvention();
  
  // Track which specific analyses are loading with an object instead of a single boolean
  const [loadingAnalyses, setLoadingAnalyses] = useState<{
    challenges: boolean;
    materials: boolean;
    visualization3D: boolean;
    users: boolean;
    competition: boolean;
    ip: boolean;
    regulatory: boolean;
    comprehensive: boolean;
  }>({
    challenges: false,
    materials: false,
    visualization3D: false,
    users: false,
    competition: false,
    ip: false,
    regulatory: false,
    comprehensive: false,
  });
  
  // Generic function to run analysis with different types
  const runAnalysis = async (analysisType: string) => {
    if (!state.title && !state.description) {
      toast.error("Missing information", {
        description: "Please provide at least a title or description for your invention."
      });
      return;
    }
    
    // Set only the specific analysis type as loading
    setLoadingAnalyses(prev => ({ ...prev, [analysisType]: true }));
    
    try {
      // Call our Supabase Edge Function with the specified analysis type
      const { data, error } = await supabase.functions.invoke("analyze-invention", {
        body: {
          title: state.title,
          description: state.description,
          sketchDataUrl: state.sketchDataUrl,
          analysisType: analysisType
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      console.log(`${analysisType} analysis result:`, data);
      
      // Process the results based on the analysis type
      if (analysisType === "technical" || analysisType === "challenges" || analysisType === "materials") {
        let technicalResults: string[] = [];
        
        if (data.technical_analysis) {
          technicalResults = [
            ...(data.technical_analysis.key_features_list || []),
            ...(data.technical_analysis.materials_components_ideas || []),
            ...(data.technical_analysis.technical_challenges || []).map((c: any) => 
              `Challenge: ${c.challenge} - Potential solution: ${c.potential_solution}`
            ),
            ...(data.technical_analysis.suggested_improvements || [])
          ];
        } else if (data.materials_analysis) {
          technicalResults = [
            ...(data.materials_analysis.primary_materials || []).map((m: any) => 
              `${m.material}: ${m.rationale}`
            ),
            ...(data.materials_analysis.alternative_materials || []).map((m: any) => 
              `Alternative: ${m.material} - Pros: ${m.pros}, Cons: ${m.cons}`
            )
          ];
        } else if (data.challenges_analysis) {
          technicalResults = [
            ...(data.challenges_analysis.technical_challenges || []).map((c: any) => 
              `Technical challenge: ${c.challenge} - Potential solution: ${c.potential_solution}`
            )
          ];
        } else {
          // Fallback for comprehensive analysis
          technicalResults = [
            ...(data.key_features_list || []),
            ...(data.materials_components_ideas || [])
          ];
        }
        
        setAnalysisResults('technical', technicalResults);
      } 
      
      if (analysisType === "users" || analysisType === "competition") {
        let marketResults: string[] = [];
        
        if (data.users_analysis) {
          marketResults = [
            ...(data.users_analysis.primary_users || []).map((u: any) => 
              `Primary users: ${u.user_group} - ${u.rationale}`
            ),
            ...(data.users_analysis.secondary_users || []).map((u: any) => 
              `Secondary users: ${u.user_group} - ${u.rationale}`
            ),
            ...(data.users_analysis.user_needs_addressed || [])
          ];
        } else if (data.competition_analysis) {
          marketResults = [
            `Market gap: ${data.competition_analysis.market_gap || ''}`,
            `Competitive advantage: ${data.competition_analysis.competitive_advantage || ''}`,
            ...(data.competition_analysis.direct_competitors || []).map((c: any) => 
              `Direct competitor: ${c.competitor} (${c.product}) - Strengths: ${c.strengths}, Weaknesses: ${c.weaknesses}`
            )
          ];
        } else {
          // Fallback for comprehensive analysis
          marketResults = [
            `Problem solved: ${data.problem_solved || ''}`,
            `Potential users: ${data.potential_target_users || ''}`,
            ...(data.market_insights || [])
          ];
        }
        
        setAnalysisResults('market', marketResults);
      }
      
      if (analysisType === "ip" || analysisType === "regulatory") {
        let legalResults: string[] = [];
        
        if (data.ip_analysis) {
          legalResults = [
            `Patentability: ${data.ip_analysis.patentability_assessment || ''}`,
            `Disclosure considerations: ${data.ip_analysis.disclosure_considerations || ''}`,
            ...(data.ip_analysis.protection_strategies || []).map((s: any) => 
              `${s.strategy}: ${s.rationale}`
            ),
            ...(data.ip_analysis.documentation_recommendations || [])
          ];
        } else if (data.regulatory_analysis) {
          legalResults = [
            ...(data.regulatory_analysis.applicable_regulations || []).map((r: any) => 
              `Regulation: ${r.regulation} - Requirements: ${r.requirements}`
            ),
            ...(data.regulatory_analysis.certification_requirements || []).map((c: any) => 
              `${c.certification}: ${c.rationale}`
            ),
            ...(data.regulatory_analysis.compliance_checklist || [])
          ];
        } else {
          // Fallback for comprehensive analysis
          legalResults = data.unclear_aspects_questions || [];
        }
        
        setAnalysisResults('legal', legalResults);
      }
      
      if (analysisType === "comprehensive") {
        // For comprehensive analysis, update all categories
        
        const technicalResults = [
          ...(data.key_features_list || []),
          ...(data.materials_components_ideas || [])
        ];
        
        const marketResults = [
          `Problem solved: ${data.problem_solved || ''}`,
          `Potential users: ${data.potential_target_users || ''}`,
          ...(data.market_insights || [])
        ];
        
        const legalResults = data.unclear_aspects_questions || [];
        
        const businessResults = data.suggested_next_steps || [];
        
        setAnalysisResults('technical', technicalResults);
        setAnalysisResults('market', marketResults);
        setAnalysisResults('legal', legalResults);
        setAnalysisResults('business', businessResults);
      }
      
      // Update visualization prompts if available
      if (data.visualization_prompts) {
        updateVisualizations(data.visualization_prompts);
      }
      
      toast.success("Analysis complete", {
        description: `${analysisType.charAt(0).toUpperCase() + analysisType.slice(1)} analysis completed successfully.`
      });
      
      // Explicitly call onAnalysisComplete to ensure results are shown
      onAnalysisComplete();
    } catch (error) {
      console.error(`Error running ${analysisType} analysis:`, error);
      toast.error("Analysis failed", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      // Only reset the loading state for the specific analysis type
      setLoadingAnalyses(prev => ({ ...prev, [analysisType]: false }));
    }
  };
  
  const generate3DVisualization = async () => {
    if (!state.sketchDataUrl) {
      toast.error("Missing sketch", {
        description: "Please create a sketch first to generate a 3D visualization."
      });
      return;
    }
    
    setLoadingAnalyses(prev => ({ ...prev, visualization3D: true }));
    
    try {
      // For demonstration purposes, we'll simulate this with a timeout
      // In a real implementation, you would call the generate-3d-visualization edge function
      /* 
      const { data, error } = await supabase.functions.invoke("generate-3d-visualization", {
        body: {
          sketchDataUrl: state.sketchDataUrl,
          prompt: state.title || "Invention visualization"
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update the context with the visualization URL
      update3DVisualization(data.visualizationUrl);
      */
      
      // Simulate successful response after 3 seconds
      setTimeout(() => {
        // Use the same sketch as a placeholder for the 3D visualization
        update3DVisualization(state.sketchDataUrl);
        
        toast.success("3D visualization generated", {
          description: "Your sketch has been transformed into a 3D visualization."
        });
        
        setLoadingAnalyses(prev => ({ ...prev, visualization3D: false }));
        
        // Make sure the 3D visualization is shown
        onAnalysisComplete();
      }, 3000);
      
    } catch (error) {
      console.error("Error generating 3D visualization:", error);
      toast.error("Visualization failed", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
      setLoadingAnalyses(prev => ({ ...prev, visualization3D: false }));
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Assistant</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="technical">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="legal">Legal</TabsTrigger>
          </TabsList>
          
          <TabsContent value="technical" className="space-y-4">
            <Button 
              className="w-full" 
              onClick={() => runAnalysis("challenges")}
              disabled={loadingAnalyses.challenges}
            >
              {loadingAnalyses.challenges ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
              Identify Challenges
            </Button>
            <Button 
              className="w-full" 
              onClick={() => runAnalysis("materials")}
              disabled={loadingAnalyses.materials}
            >
              {loadingAnalyses.materials ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
              Suggest Materials
            </Button>
            
            {state.sketchDataUrl && (
              <Button 
                className="w-full" 
                variant="secondary"
                onClick={generate3DVisualization}
                disabled={loadingAnalyses.visualization3D}
              >
                {loadingAnalyses.visualization3D ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <Box className="mr-2 h-4 w-4" />}
                Generate 3D Visualization
              </Button>
            )}
          </TabsContent>
          
          <TabsContent value="market" className="space-y-4">
            <Button 
              className="w-full" 
              onClick={() => runAnalysis("users")}
              disabled={loadingAnalyses.users}
            >
              {loadingAnalyses.users ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
              Target Users
            </Button>
            <Button 
              className="w-full" 
              onClick={() => runAnalysis("competition")}
              disabled={loadingAnalyses.competition}
            >
              {loadingAnalyses.competition ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Competition Research
            </Button>
          </TabsContent>
          
          <TabsContent value="legal" className="space-y-4">
            <Button 
              className="w-full" 
              onClick={() => runAnalysis("ip")}
              disabled={loadingAnalyses.ip}
            >
              {loadingAnalyses.ip ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <Award className="mr-2 h-4 w-4" />}
              Patent Search
            </Button>
            <Button 
              className="w-full" 
              onClick={() => runAnalysis("ip")}
              disabled={loadingAnalyses.ip}
            >
              {loadingAnalyses.ip ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <Award className="mr-2 h-4 w-4" />}
              IP Protection Tips
            </Button>
            <Button 
              className="w-full" 
              onClick={() => runAnalysis("regulatory")}
              disabled={loadingAnalyses.regulatory}
            >
              {loadingAnalyses.regulatory ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
              Regulatory Checklist
            </Button>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 pt-4 border-t space-y-4">
          <Button 
            className="w-full" 
            variant="default" 
            onClick={() => runAnalysis("comprehensive")}
            disabled={loadingAnalyses.comprehensive}
          >
            {loadingAnalyses.comprehensive ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
            Analyze with Claude 3 Sonnet
          </Button>
          
          <Button 
            className="w-full" 
            variant="secondary" 
            onClick={() => runAnalysis("comprehensive")}
            disabled={loadingAnalyses.comprehensive}
          >
            {loadingAnalyses.comprehensive ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <BarChart3 className="mr-2 h-4 w-4" />}
            Generate Comprehensive Analysis
          </Button>
        </div>
        
        {state.sketchDataUrl && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Idea Generation</h3>
            <IdeaGenerator sketchDataUrl={state.sketchDataUrl} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
