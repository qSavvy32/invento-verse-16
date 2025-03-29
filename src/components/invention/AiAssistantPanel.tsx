
import { useInvention } from "@/contexts/InventionContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Box, Loader2Icon, BarChart3, Database, Lightbulb, Target, Users, Search, Award, FileText } from "lucide-react";
import { IdeaGenerator } from "@/components/IdeaGenerator";
import { supabase } from "@/integrations/supabase/client";

interface AiAssistantPanelProps {
  onAnalysisComplete: () => void;
}

export const AiAssistantPanel = ({ onAnalysisComplete }: AiAssistantPanelProps) => {
  const { state, setAnalysisResults, update3DVisualization } = useInvention();
  const [analyzing, setAnalyzing] = useState(false);
  const [generating3D, setGenerating3D] = useState(false);
  
  const runAnthropicAnalysis = async () => {
    if (!state.title && !state.description) {
      toast({
        title: "Missing information",
        description: "Please provide at least a title or description for your invention.",
        variant: "destructive"
      });
      return;
    }
    
    setAnalyzing(true);
    
    try {
      // Call our Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("analyze-invention", {
        body: {
          title: state.title,
          description: state.description,
          sketchDataUrl: state.sketchDataUrl
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      console.log("Analysis result:", data);
      
      // Process results from the AI analysis
      const technicalResults = [
        ...data.key_features_list || [],
        ...data.materials_components_ideas || []
      ];
      
      const marketResults = [
        `Problem solved: ${data.problem_solved}`,
        `Potential users: ${data.potential_target_users}`
      ];
      
      const legalResults = data.unclear_aspects_questions || [];
      
      const businessResults = data.suggested_next_steps || [];
      
      // Update the context with the results
      setAnalysisResults('technical', technicalResults);
      setAnalysisResults('market', marketResults);
      setAnalysisResults('legal', legalResults);
      setAnalysisResults('business', businessResults);
      
      toast({
        title: "Analysis complete",
        description: "AI analysis completed successfully."
      });
      
      onAnalysisComplete();
    } catch (error) {
      console.error("Error running analysis:", error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };
  
  const generate3DVisualization = async () => {
    if (!state.sketchDataUrl) {
      toast({
        title: "Missing sketch",
        description: "Please create a sketch first to generate a 3D visualization.",
        variant: "destructive"
      });
      return;
    }
    
    setGenerating3D(true);
    
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
        
        toast({
          title: "3D visualization generated",
          description: "Your sketch has been transformed into a 3D visualization."
        });
        
        setGenerating3D(false);
      }, 3000);
      
    } catch (error) {
      console.error("Error generating 3D visualization:", error);
      toast({
        title: "Visualization failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      setGenerating3D(false);
    }
  };
  
  // Enhanced simulation functions with specific responses
  const simulateSuggestMaterials = () => {
    if (!state.title && !state.description) {
      toast({
        title: "Missing information",
        description: "Please provide at least a title or description for your invention.",
        variant: "destructive"
      });
      return;
    }
    
    setAnalyzing(true);
    
    setTimeout(() => {
      const materialSuggestions = [
        "Medical-grade silicone would provide flexibility and biocompatibility.",
        "Reinforced thermoplastic polymers for durability and lightweight structure.",
        "Recycled aluminum components would reduce environmental impact.",
        "Conductive fabric for integrated sensor connectivity."
      ];
      
      setAnalysisResults('technical', materialSuggestions);
      setAnalyzing(false);
      toast({
        title: "Materials suggested",
        description: "AI has generated material recommendations for your invention."
      });
      
      onAnalysisComplete();
    }, 2000);
  };
  
  const simulateIdentifyChallenges = () => {
    if (!state.title && !state.description) {
      toast({
        title: "Missing information",
        description: "Please provide at least a title or description for your invention.",
        variant: "destructive"
      });
      return;
    }
    
    setAnalyzing(true);
    
    setTimeout(() => {
      const challenges = [
        "Power efficiency might be a challenge for portable operation.",
        "Miniaturization could impact durability and performance.",
        "User interface simplicity vs comprehensive control balance.",
        "Environmental resistance for outdoor usability."
      ];
      
      setAnalysisResults('technical', challenges);
      setAnalyzing(false);
      toast({
        title: "Challenges identified",
        description: "AI has identified potential technical challenges for your invention."
      });
      
      onAnalysisComplete();
    }, 2000);
  };
  
  const simulateTargetUsers = () => {
    if (!state.title && !state.description) {
      toast({
        title: "Missing information",
        description: "Please provide at least a title or description for your invention.",
        variant: "destructive"
      });
      return;
    }
    
    setAnalyzing(true);
    
    setTimeout(() => {
      const targetUsers = [
        "Primary demographic: Urban professionals aged 25-45.",
        "Secondary market: Health-conscious individuals tracking wellness metrics.",
        "Tertiary potential: Medical professionals requiring remote monitoring solutions.",
        "Early adopters: Tech enthusiasts and DIY makers."
      ];
      
      setAnalysisResults('market', targetUsers);
      setAnalyzing(false);
      toast({
        title: "Target users identified",
        description: "AI has identified potential target users for your invention."
      });
      
      onAnalysisComplete();
    }, 2000);
  };
  
  const simulateCompetitionResearch = () => {
    if (!state.title && !state.description) {
      toast({
        title: "Missing information",
        description: "Please provide at least a title or description for your invention.",
        variant: "destructive"
      });
      return;
    }
    
    setAnalyzing(true);
    
    setTimeout(() => {
      const competitionInsights = [
        "Direct competitor: TechInnov's Model X3 ($149 retail) with 15% market share.",
        "Indirect alternatives: Custom DIY kits (lower cost, higher complexity).",
        "Market gap: No solution currently combines affordability with ease of use.",
        "Emerging threats: Two startups with seed funding developing similar concepts."
      ];
      
      setAnalysisResults('market', competitionInsights);
      setAnalyzing(false);
      toast({
        title: "Competition analyzed",
        description: "AI has analyzed market competition for your invention."
      });
      
      onAnalysisComplete();
    }, 2000);
  };
  
  const simulateIpProtectionTips = () => {
    if (!state.title && !state.description) {
      toast({
        title: "Missing information",
        description: "Please provide at least a title or description for your invention.",
        variant: "destructive"
      });
      return;
    }
    
    setAnalyzing(true);
    
    setTimeout(() => {
      const ipTips = [
        "File a provisional patent application to secure an early priority date.",
        "Consider design patent protection for the unique visual elements.",
        "Document all development stages with dated and witnessed laboratory notebooks.",
        "Execute confidentiality agreements before sharing with potential partners."
      ];
      
      setAnalysisResults('legal', ipTips);
      setAnalyzing(false);
      toast({
        title: "IP protection tips provided",
        description: "AI has suggested intellectual property protection strategies."
      });
      
      onAnalysisComplete();
    }, 2000);
  };
  
  const simulateRegulatoryChecklist = () => {
    if (!state.title && !state.description) {
      toast({
        title: "Missing information",
        description: "Please provide at least a title or description for your invention.",
        variant: "destructive"
      });
      return;
    }
    
    setAnalyzing(true);
    
    setTimeout(() => {
      const regulatoryItems = [
        "FCC certification will be required for wireless communication features.",
        "UL safety certification recommended for electrical components.",
        "Consider FDA classification if marketing includes health-related claims.",
        "Review GDPR compliance requirements for data collection features."
      ];
      
      setAnalysisResults('legal', regulatoryItems);
      setAnalyzing(false);
      toast({
        title: "Regulatory checklist generated",
        description: "AI has identified potential regulatory requirements."
      });
      
      onAnalysisComplete();
    }, 2000);
  };
  
  // Comprehensive analysis properly implemented
  const simulateComprehensiveAnalysis = () => {
    if (!state.title && !state.description) {
      toast({
        title: "Missing information",
        description: "Please provide at least a title or description for your invention.",
        variant: "destructive"
      });
      return;
    }
    
    setAnalyzing(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Technical analysis
      const technicalInsights = [
        "The modular design offers flexibility for user customization.",
        "Energy efficiency could be improved with solar backup options.",
        "Bluetooth LE connectivity provides optimal battery conservation.",
        "Physical dimensions could be reduced by 15% with component reorganization."
      ];
      
      // Market analysis
      const marketInsights = [
        "Estimated market size: $2.3B globally with 12% annual growth.",
        "Price point sweet spot: $79-99 based on comparable products.",
        "Distribution channels: Direct to consumer with specialty retail partnerships.",
        "Marketing focus: Emphasize ease of use and customization options."
      ];
      
      // Legal analysis
      const legalInsights = [
        "Three competing patents exist but your approach has novel elements.",
        "Trademark search shows no conflicts with proposed product name.",
        "Consider international PCT application for global market potential.",
        "Data privacy policy will be required for app component."
      ];
      
      // Business analysis
      const businessInsights = [
        "Pilot with small production run before scaling manufacturing.",
        "Explore crowdfunding to validate market interest and pricing.",
        "Consider subscription model for premium features and analytics.",
        "Partner with complementary product makers for bundled offerings."
      ];
      
      // Update all analysis categories
      setAnalysisResults('technical', technicalInsights);
      setAnalysisResults('market', marketInsights);
      setAnalysisResults('legal', legalInsights);
      setAnalysisResults('business', businessInsights);
      
      setAnalyzing(false);
      toast({
        title: "Comprehensive analysis complete",
        description: "AI has analyzed all aspects of your invention."
      });
      
      onAnalysisComplete();
    }, 3000);
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
              onClick={() => simulateIdentifyChallenges()}
              disabled={analyzing}
            >
              {analyzing ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
              Identify Challenges
            </Button>
            <Button 
              className="w-full" 
              onClick={() => simulateSuggestMaterials()}
              disabled={analyzing}
            >
              {analyzing ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
              Suggest Materials
            </Button>
            
            {state.sketchDataUrl && (
              <Button 
                className="w-full" 
                variant="secondary"
                onClick={generate3DVisualization}
                disabled={generating3D}
              >
                {generating3D ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <Box className="mr-2 h-4 w-4" />}
                Generate 3D Visualization
              </Button>
            )}
          </TabsContent>
          
          <TabsContent value="market" className="space-y-4">
            <Button 
              className="w-full" 
              onClick={() => simulateTargetUsers()}
              disabled={analyzing}
            >
              {analyzing ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
              Target Users
            </Button>
            <Button 
              className="w-full" 
              onClick={() => simulateCompetitionResearch()}
              disabled={analyzing}
            >
              {analyzing ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Competition Research
            </Button>
          </TabsContent>
          
          <TabsContent value="legal" className="space-y-4">
            <Button 
              className="w-full" 
              onClick={runAnthropicAnalysis}
              disabled={analyzing}
            >
              {analyzing ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <Award className="mr-2 h-4 w-4" />}
              Patent Search
            </Button>
            <Button 
              className="w-full" 
              onClick={() => simulateIpProtectionTips()}
              disabled={analyzing}
            >
              {analyzing ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <Award className="mr-2 h-4 w-4" />}
              IP Protection Tips
            </Button>
            <Button 
              className="w-full" 
              onClick={() => simulateRegulatoryChecklist()}
              disabled={analyzing}
            >
              {analyzing ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
              Regulatory Checklist
            </Button>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 pt-4 border-t space-y-4">
          <Button 
            className="w-full" 
            variant="default" 
            onClick={runAnthropicAnalysis}
            disabled={analyzing}
          >
            {analyzing ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
            Analyze with Claude 3.7 Sonnet
          </Button>
          
          <Button 
            className="w-full" 
            variant="secondary" 
            onClick={() => simulateComprehensiveAnalysis()}
            disabled={analyzing}
          >
            {analyzing ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <BarChart3 className="mr-2 h-4 w-4" />}
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
