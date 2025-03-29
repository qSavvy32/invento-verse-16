
import { AuthHeader } from "@/components/AuthHeader";
import { Footer } from "@/components/Footer";
import { SketchCanvas } from "@/components/SketchCanvas";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";

const Workspace = () => {
  const [inventionTitle, setInventionTitle] = useState("");
  const [inventionDescription, setInventionDescription] = useState("");
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <AuthHeader />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-leonardo mb-2">
            Create Your Invention
          </h1>
          <p className="text-muted-foreground">
            Bring your ideas to life with the power of AI and your creativity
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Give your invention a name"
                  value={inventionTitle}
                  onChange={(e) => setInventionTitle(e.target.value)}
                  className="text-lg font-semibold"
                />
              </div>
              <div>
                <Textarea
                  placeholder="Describe your invention..."
                  value={inventionDescription}
                  onChange={(e) => setInventionDescription(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Sketch Your Concept</h2>
              <SketchCanvas />
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">AI Assistant</h2>
              <Tabs defaultValue="technical">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="technical">Technical</TabsTrigger>
                  <TabsTrigger value="market">Market</TabsTrigger>
                  <TabsTrigger value="legal">Legal</TabsTrigger>
                </TabsList>
                
                <TabsContent value="technical" className="space-y-4">
                  <Button className="w-full">Analyze Feasibility</Button>
                  <Button className="w-full">Suggest Materials</Button>
                  <Button className="w-full">Identify Challenges</Button>
                </TabsContent>
                
                <TabsContent value="market" className="space-y-4">
                  <Button className="w-full">Market Analysis</Button>
                  <Button className="w-full">Target Users</Button>
                  <Button className="w-full">Competition Research</Button>
                </TabsContent>
                
                <TabsContent value="legal" className="space-y-4">
                  <Button className="w-full">Patent Search</Button>
                  <Button className="w-full">IP Protection Tips</Button>
                  <Button className="w-full">Regulatory Checklist</Button>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Save Your Work</h2>
              <div className="space-y-4">
                <Button className="w-full">Save Draft</Button>
                <Button variant="outline" className="w-full">Export</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Workspace;
