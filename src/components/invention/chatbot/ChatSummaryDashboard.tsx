
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatSummaryData } from "@/services/ChatDataService";
import { AlertCircle, Check, FileText } from "lucide-react";

interface ChatSummaryDashboardProps {
  inventionId: string | null;
}

export const ChatSummaryDashboard = ({ inventionId }: ChatSummaryDashboardProps) => {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSummary, setSelectedSummary] = useState<ChatSummaryData | null>(null);
  const [activeTab, setActiveTab] = useState("technical");
  
  useEffect(() => {
    if (inventionId) {
      loadSummaries(inventionId);
    }
  }, [inventionId]);
  
  const loadSummaries = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { ChatDataService } = await import("@/services/ChatDataService");
      const data = await ChatDataService.getChatSummaries(id);
      
      setSummaries(data);
      
      // If summaries exist, select the most recent one and parse its data
      if (data.length > 0) {
        try {
          const parsedData = JSON.parse(data[0].data);
          setSelectedSummary(parsedData);
        } catch (e) {
          console.error("Error parsing summary data:", e);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load chat summaries");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectSummary = (summary: any) => {
    try {
      const parsedData = JSON.parse(summary.data);
      setSelectedSummary(parsedData);
    } catch (e) {
      console.error("Error parsing summary data:", e);
      setError("Could not parse this summary data");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  if (!inventionId) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Please save your invention first to view chat summaries.</AlertDescription>
      </Alert>
    );
  }
  
  if (summaries.length === 0) {
    return (
      <div className="text-center py-6">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-3" />
        <h3 className="text-lg font-medium mb-2">No Chat Summaries Yet</h3>
        <p className="text-muted-foreground">
          Finish a chat session and refine your data to see insights here.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Chat Summaries</CardTitle>
              <CardDescription>
                Select a summary to view detailed insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {summaries.map(summary => (
                  <Button 
                    key={summary.id}
                    variant={selectedSummary && summary.id === summaries[0].id ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => handleSelectSummary(summary)}
                  >
                    <div>
                      <p className="font-medium">{summary.title || "Untitled Summary"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(summary.created_at).toLocaleString()}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          {selectedSummary ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedSummary.title}</CardTitle>
                <CardDescription>
                  Analysis summary from chat conversation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="technical">Technical</TabsTrigger>
                    <TabsTrigger value="market">Market</TabsTrigger>
                    <TabsTrigger value="legal">Legal</TabsTrigger>
                    <TabsTrigger value="business">Business</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="technical" className="space-y-4">
                    {selectedSummary.technical && selectedSummary.technical.length > 0 ? (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold">Key Technical Insights</h3>
                        <ul className="space-y-2">
                          {selectedSummary.technical.map((item: string, idx: number) => (
                            <li key={idx} className="bg-muted p-2 rounded text-sm">
                              {item}
                            </li>
                          ))}
                        </ul>
                        
                        {selectedSummary.engineeringChallenges && selectedSummary.engineeringChallenges.length > 0 && (
                          <>
                            <h3 className="text-sm font-semibold mt-4">Engineering Challenges</h3>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Challenge</TableHead>
                                  <TableHead>Description</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedSummary.engineeringChallenges.map((challenge: any, idx: number) => (
                                  <TableRow key={idx}>
                                    <TableCell className="font-medium">{challenge.challenge}</TableCell>
                                    <TableCell>{challenge.description}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        No technical insights available
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="market" className="space-y-4">
                    {selectedSummary.market && selectedSummary.market.length > 0 ? (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold">Market Insights</h3>
                        <ul className="space-y-2">
                          {selectedSummary.market.map((item: string, idx: number) => (
                            <li key={idx} className="bg-muted p-2 rounded text-sm">
                              {item}
                            </li>
                          ))}
                        </ul>
                        
                        {selectedSummary.userAnalysis?.primaryUserGroup && (
                          <div className="mt-4">
                            <h3 className="text-sm font-semibold">Primary User Group</h3>
                            <div className="bg-muted p-4 rounded-md mt-2">
                              <p className="font-medium">{selectedSummary.userAnalysis.primaryUserGroup.groupName}</p>
                              <div className="mt-2">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Needs Addressed:</p>
                                <div className="flex flex-wrap gap-1">
                                  {selectedSummary.userAnalysis.primaryUserGroup.needsAddressed.map((need: string, i: number) => (
                                    <Badge key={i} variant="outline" className="flex items-center gap-1">
                                      <Check className="h-3 w-3" />
                                      {need}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        No market insights available
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="legal" className="space-y-4">
                    {selectedSummary.legal && selectedSummary.legal.length > 0 ? (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold">Legal Considerations</h3>
                        <ul className="space-y-2">
                          {selectedSummary.legal.map((item: string, idx: number) => (
                            <li key={idx} className="bg-muted p-2 rounded text-sm">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        No legal insights available
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="business" className="space-y-4">
                    {selectedSummary.business && selectedSummary.business.length > 0 ? (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold">Business Strategy</h3>
                        <ul className="space-y-2">
                          {selectedSummary.business.map((item: string, idx: number) => (
                            <li key={idx} className="bg-muted p-2 rounded text-sm">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        No business insights available
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-10">
                <p>Select a chat summary to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
