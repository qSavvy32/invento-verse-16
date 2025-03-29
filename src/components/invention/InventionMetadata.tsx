
import { useInvention } from "@/contexts/InventionContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const InventionMetadata = () => {
  const { state, updateTitle, updateDescription } = useInvention();
  
  return (
    <div className="space-y-4">
      <div>
        <Input
          placeholder="Give your invention a name"
          value={state.title}
          onChange={(e) => updateTitle(e.target.value)}
          className="text-lg font-semibold"
        />
      </div>
      
      <div>
        <Textarea
          placeholder="Describe your invention..."
          value={state.description}
          onChange={(e) => updateDescription(e.target.value)}
          className="min-h-[120px]"
        />
      </div>
    </div>
  );
};
