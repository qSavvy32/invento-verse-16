
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SketchCanvas } from "@/components/SketchCanvas";
import { IdeaGenerator } from "@/components/IdeaGenerator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { PencilIcon, LightbulbIcon } from "lucide-react";

export const Workspace = () => {
  const [sketchDataUrl, setSketchDataUrl] = useState<string | undefined>(undefined);
  
  const handleSketchSave = (dataUrl: string) => {
    setSketchDataUrl(dataUrl);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-invention-paper">
      <Header />
      
      <main className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-leonardo font-semibold text-invention-ink">
              Invention Workspace
            </h1>
            <p className="text-invention-ink/70">
              Sketch your ideas and get AI-powered insights and suggestions
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <Tabs defaultValue="sketch" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="sketch" className="flex items-center gap-2">
                    <PencilIcon className="h-4 w-4" />
                    Sketch Canvas
                  </TabsTrigger>
                  <TabsTrigger value="ideas" className="flex items-center gap-2">
                    <LightbulbIcon className="h-4 w-4" />
                    Idea Generator
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="sketch">
                  <Card>
                    <CardContent className="pt-6">
                      <SketchCanvas onSketchSave={handleSketchSave} />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="ideas">
                  <Card>
                    <CardContent className="pt-6">
                      <IdeaGenerator sketchDataUrl={sketchDataUrl} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="lg:col-span-2">
              <Card className="da-vinci-note h-full">
                <CardContent className="pt-6">
                  <h2 className="text-xl font-leonardo font-semibold text-invention-ink mb-4">
                    Leonardo's Notes
                  </h2>
                  
                  <div className="prose prose-stone font-leonardo">
                    <p className="italic text-invention-ink/80 mb-4">
                      "The noblest pleasure is the joy of understanding."
                    </p>
                    
                    <h3 className="text-lg font-semibold text-invention-ink">For the Inventor:</h3>
                    
                    <ul className="list-disc pl-5 space-y-3 text-invention-ink">
                      <li>
                        Begin with simple sketches. Complexity can be added later, but the essence must be clear from the start.
                      </li>
                      <li>
                        Consider how your invention interacts with its environment. No creation exists in isolation.
                      </li>
                      <li>
                        Study nature for inspiration — the most efficient solutions often mimic natural designs.
                      </li>
                      <li>
                        Test your assumptions. What seems obvious may not be true. Experimentation reveals truth.
                      </li>
                      <li>
                        Document everything. The journey of creation is as valuable as the creation itself.
                      </li>
                    </ul>
                    
                    <div className="mt-6 mb-6">
                      <img 
                        src="https://images.unsplash.com/photo-1689480278797-d6595fd77bef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                        alt="Da Vinci-style sketch" 
                        className="rounded-md shadow-sm"
                      />
                    </div>
                    
                    <p className="text-invention-ink/80">
                      Use the sketch canvas to visualize your ideas. The AI will analyze your drawings and provide insights to help refine your invention.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Workspace;
