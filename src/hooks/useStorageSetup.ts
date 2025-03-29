
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useStorageSetup() {
  const [isStorageSetup, setIsStorageSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const setupStorage = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.functions.invoke("setup-storage");
        
        if (error) {
          console.error("Storage setup error:", error);
          toast.error("Failed to setup storage. Some features may be limited.");
        } else {
          console.log("Storage setup success:", data);
          setIsStorageSetup(true);
        }
      } catch (err) {
        console.error("Error invoking setup-storage function:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    setupStorage();
  }, []);

  return { isStorageSetup, isLoading };
}
