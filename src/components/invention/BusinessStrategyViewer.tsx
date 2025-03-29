
import { useInvention } from "@/contexts/InventionContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart4 } from "lucide-react";

export const BusinessStrategyViewer = () => {
  const { state } = useInvention();

  if (!state.businessStrategySvg) {
    return null;
  }

  return (
    <Card className="overflow-hidden border-invention-accent/20">
      <CardHeader className="bg-gradient-to-r from-invention-paper to-white">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <BarChart4 className="h-5 w-5 text-invention-accent" />
          Business & Go-to-Market Strategy
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="bg-white rounded-lg overflow-auto max-h-[500px]">
          <div 
            dangerouslySetInnerHTML={{ __html: state.businessStrategySvg }} 
            className="flex justify-center p-4"
          />
        </div>
      </CardContent>
    </Card>
  );
};
