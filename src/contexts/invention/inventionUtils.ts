
import { InventionState } from './types';
import { toast } from 'sonner';

export const saveInventionToDatabase = async (state: InventionState, showToast: boolean = true): Promise<string | null> => {
  try {
    // Load the InventionService dynamically
    const { InventionService } = await import("@/services/InventionService");
    
    // Save the invention data
    const inventionId = await InventionService.saveInvention(state);

    if (inventionId) {
      if (showToast) {
        toast.success("Invention saved successfully!");
      }
      return inventionId;
    } else {
      if (showToast) {
        toast.error("Failed to save invention.");
      }
      return null;
    }
  } catch (error: any) {
    console.error("Error saving invention:", error);
    toast.error(error.message || "Failed to save invention.");
    return null;
  }
};

export const loadInventionFromDatabase = async (id: string): Promise<InventionState | null> => {
  try {
    // Load the InventionService dynamically
    const { InventionService } = await import("@/services/InventionService");
    
    // Load the invention data
    const loadedState = await InventionService.getInventionById(id);
    
    if (!loadedState) {
      toast.error("Failed to load invention.");
      return null;
    }
    
    return loadedState;
  } catch (error) {
    console.error("Error loading invention:", error);
    toast.error("Failed to load invention.");
    return null;
  }
};
