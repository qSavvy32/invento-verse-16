
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InventionState, InventionAsset, AssetType } from "@/contexts/InventionContext";
import { v4 as uuidv4 } from "uuid";

export class InventionService {
  /**
   * Save an invention to the database
   */
  static async saveInvention(invention: InventionState): Promise<string> {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error("You must be logged in to save an invention");
      }
      
      const userId = userData.user.id;
      
      const inventionId = invention.inventionId || uuidv4();
      
      // Prepare invention data
      const inventionData = {
        id: inventionId,
        user_id: userId,
        title: invention.title,
        description: invention.description,
        sketch_data_url: invention.sketchDataUrl,
        visualization_3d_url: invention.visualization3dUrl,
        visualization_prompts: JSON.stringify(invention.visualizationPrompts),
        threejs_visualization: JSON.stringify(invention.threejsVisualization),
        business_strategy_svg: invention.businessStrategySvg,
        analysis_results: JSON.stringify(invention.analysisResults),
        updated_at: new Date().toISOString()
      };
      
      // Check if this is a new invention or an update
      if (invention.inventionId) {
        // Update existing invention
        const { error: updateError } = await supabase
          .from('inventions')
          .update(inventionData)
          .eq('id', inventionId);
          
        if (updateError) {
          throw new Error(`Failed to update invention: ${updateError.message}`);
        }
      } else {
        // Create new invention
        const { error: insertError } = await supabase
          .from('inventions')
          .insert({
            ...inventionData,
            created_at: new Date().toISOString()
          });
          
        if (insertError) {
          throw new Error(`Failed to create invention: ${insertError.message}`);
        }
      }
      
      // Save assets
      if (invention.assets && invention.assets.length > 0) {
        // First, delete all existing assets for this invention
        await supabase
          .from('invention_assets')
          .delete()
          .eq('invention_id', inventionId);
        
        // Then, insert all current assets
        const assetsData = invention.assets.map(asset => ({
          id: asset.id || uuidv4(),
          invention_id: inventionId,
          user_id: userId,
          type: asset.type,
          url: asset.url,
          thumbnail_url: asset.thumbnailUrl,
          name: asset.name || '',
          created_at: new Date(asset.createdAt).toISOString()
        }));
        
        const { error: assetsError } = await supabase
          .from('invention_assets')
          .insert(assetsData);
          
        if (assetsError) {
          console.error("Error saving assets:", assetsError);
          // Don't throw error, just log it
        }
      }
      
      // Save audio transcriptions
      if (invention.audioTranscriptions && invention.audioTranscriptions.length > 0) {
        // First, delete all existing transcriptions for this invention
        await supabase
          .from('audio_transcriptions')
          .delete()
          .eq('invention_id', inventionId);
        
        // Then, insert all current transcriptions
        const transcriptionsData = invention.audioTranscriptions.map(transcript => ({
          id: uuidv4(),
          invention_id: inventionId,
          user_id: userId,
          text: transcript.text,
          language: transcript.language,
          audio_url: transcript.audioUrl || null,
          created_at: new Date(transcript.timestamp).toISOString()
        }));
        
        const { error: transcriptionsError } = await supabase
          .from('audio_transcriptions')
          .insert(transcriptionsData);
          
        if (transcriptionsError) {
          console.error("Error saving transcriptions:", transcriptionsError);
          // Don't throw error, just log it
        }
      }
      
      return inventionId;
    } catch (error: any) {
      console.error("Error saving invention:", error);
      throw new Error(error.message || "Failed to save invention");
    }
  }

  /**
   * Get an invention by ID
   */
  static async getInventionById(id: string): Promise<InventionState | null> {
    try {
      // Get the invention data
      const { data: invention, error: inventionError } = await supabase
        .from('inventions')
        .select('*')
        .eq('id', id)
        .single();
        
      if (inventionError) {
        throw new Error(`Failed to fetch invention: ${inventionError.message}`);
      }
      
      if (!invention) {
        throw new Error("Invention not found");
      }
      
      // Get the invention assets
      const { data: assets, error: assetsError } = await supabase
        .from('invention_assets')
        .select('*')
        .eq('invention_id', id);
        
      if (assetsError) {
        console.error("Error fetching assets:", assetsError);
        // Don't throw error, just log it
      }
      
      // Get the invention transcriptions
      const { data: transcriptions, error: transcriptionsError } = await supabase
        .from('audio_transcriptions')
        .select('*')
        .eq('invention_id', id);
        
      if (transcriptionsError) {
        console.error("Error fetching transcriptions:", transcriptionsError);
        // Don't throw error, just log it
      }
      
      // Convert database model to application model
      const inventionState: InventionState = {
        inventionId: invention.id,
        title: invention.title || '',
        description: invention.description || '',
        sketchDataUrl: invention.sketch_data_url || null,
        assets: (assets || []).map((asset): InventionAsset => ({
          id: asset.id,
          type: asset.type as AssetType,
          url: asset.url,
          thumbnailUrl: asset.thumbnail_url || asset.url,
          name: asset.name || '',
          createdAt: new Date(asset.created_at).getTime()
        })),
        visualization3dUrl: invention.visualization_3d_url || null,
        visualizationPrompts: invention.visualization_prompts ? 
          JSON.parse(invention.visualization_prompts) : {},
        savedToDatabase: true,
        threejsVisualization: invention.threejs_visualization ? 
          JSON.parse(invention.threejs_visualization) : {
            code: null,
            html: null
          },
        businessStrategySvg: invention.business_strategy_svg || null,
        mostRecentGeneration: null, // Set to null initially
        analysisResults: invention.analysis_results ? 
          JSON.parse(invention.analysis_results) : {
            technical: [],
            market: [],
            legal: [],
            business: []
          },
        audioTranscriptions: (transcriptions || []).map(t => ({
          text: t.text,
          language: t.language,
          audioUrl: t.audio_url || undefined,
          timestamp: new Date(t.created_at).getTime()
        }))
      };
      
      return inventionState;
    } catch (error: any) {
      console.error("Error fetching invention:", error);
      toast.error(error.message || "Failed to fetch invention");
      return null;
    }
  }

  /**
   * Get all inventions for the current user
   */
  static async getUserInventions(): Promise<InventionState[]> {
    try {
      const { data: user, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error("You must be logged in to view your inventions");
      }
      
      const userId = user.user.id;
      
      // Get all inventions for this user
      const { data: inventions, error: inventionsError } = await supabase
        .from('inventions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
        
      if (inventionsError) {
        throw new Error(`Failed to fetch inventions: ${inventionsError.message}`);
      }
      
      // Get all assets for this user's inventions
      const { data: allAssets, error: assetsError } = await supabase
        .from('invention_assets')
        .select('*')
        .eq('user_id', userId);
        
      if (assetsError) {
        console.error("Error fetching assets:", assetsError);
        // Don't throw error, just log it
      }
      
      // Convert database models to application models
      const inventionStates: InventionState[] = inventions.map(invention => {
        // Find assets for this invention
        const inventionAssets = (allAssets || [])
          .filter(asset => asset.invention_id === invention.id)
          .map((asset): InventionAsset => ({
            id: asset.id,
            type: asset.type as AssetType,
            url: asset.url,
            thumbnailUrl: asset.thumbnail_url || asset.url,
            name: asset.name || '',
            createdAt: new Date(asset.created_at).getTime()
          }));
          
        return {
          inventionId: invention.id,
          title: invention.title || '',
          description: invention.description || '',
          sketchDataUrl: invention.sketch_data_url || null,
          assets: inventionAssets,
          visualization3dUrl: invention.visualization_3d_url || null,
          visualizationPrompts: invention.visualization_prompts ? 
            JSON.parse(invention.visualization_prompts) : {},
          savedToDatabase: true,
          threejsVisualization: invention.threejs_visualization ? 
            JSON.parse(invention.threejs_visualization) : {
              code: null,
              html: null
            },
          businessStrategySvg: invention.business_strategy_svg || null,
          mostRecentGeneration: null, // Set to null initially
          analysisResults: invention.analysis_results ? 
            JSON.parse(invention.analysis_results) : {
              technical: [],
              market: [],
              legal: [],
              business: []
            },
          audioTranscriptions: []
        };
      });
      
      return inventionStates;
    } catch (error: any) {
      console.error("Error fetching user inventions:", error);
      toast.error(error.message || "Failed to fetch inventions");
      return [];
    }
  }

  /**
   * Delete an invention by ID
   */
  static async deleteInvention(id: string): Promise<boolean> {
    try {
      // Delete the invention
      const { error } = await supabase
        .from('inventions')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw new Error(`Failed to delete invention: ${error.message}`);
      }
      
      return true;
    } catch (error: any) {
      console.error("Error deleting invention:", error);
      toast.error(error.message || "Failed to delete invention");
      return false;
    }
  }
}
