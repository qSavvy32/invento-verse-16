
import { useEffect, useState } from "react";
import { useInvention } from "@/contexts/InventionContext";
import { useAuth } from "@/contexts/AuthContext";
import { Save } from "lucide-react";
import { useInterval } from "@/hooks/useInterval";

export const AutoSave = () => {
  const { user } = useAuth();
  const { state, saveToDatabase } = useInvention();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Save invention data every 30 seconds if there are changes
  useInterval(async () => {
    if (!user) return;
    
    const hasContent = 
      state.title.trim() !== '' || 
      state.description.trim() !== '' || 
      state.assets.length > 0 || 
      state.sketchDataUrl !== null;
      
    if (hasContent) {
      await performSave();
    }
  }, 30000);
  
  // Save when content changes (debounced to prevent too many saves)
  useEffect(() => {
    if (!user) return;
    
    const hasContent = 
      state.title.trim() !== '' || 
      state.description.trim() !== '' || 
      state.assets.length > 0 || 
      state.sketchDataUrl !== null;
      
    if (hasContent) {
      const debounceTimer = setTimeout(async () => {
        await performSave();
      }, 5000);
      
      return () => clearTimeout(debounceTimer);
    }
  }, [state.title, state.description, state.assets.length, state.sketchDataUrl, user]);
  
  const performSave = async () => {
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      await saveToDatabase();
      setLastSaved(new Date());
    } catch (error) {
      console.error("AutoSave error:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="text-xs text-muted-foreground flex items-center gap-1">
      <Save size={12} className={isSaving ? "animate-pulse text-invention-accent" : ""} />
      {lastSaved ? (
        <span>
          {isSaving ? "Saving..." : `Last saved: ${lastSaved.toLocaleTimeString()}`}
        </span>
      ) : (
        <span>
          {isSaving ? "Saving..." : "Not saved yet"}
        </span>
      )}
    </div>
  );
};
