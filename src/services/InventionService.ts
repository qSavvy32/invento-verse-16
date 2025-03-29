
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InventionState, InventionAsset, AssetType } from "@/contexts/InventionContext";
import { v4 as uuidv4 } from "uuid";

// Define an extended type for the invention data as it comes from the database
interface InventionDataFromDB {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  sketch_data_url: string | null;
  visualization_3d_url: string | null;
  threejs_html: string | null;
  business_strategy_svg: string | null;
  visualization_prompts_json: string | null;
  threejs_visualization_json: string | null;
  analysis_results_json: string | null;
  created_at: string;
  updated_at: string;
}

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
      
      // Prepare invention data (match database schema exactly)
      const inventionData = {
        id: inventionId,
        user_id: userId,
        title: invention.title,
        description: invention.description,
        sketch_data_url: invention.sketchDataUrl,
        visualization_3d_url: invention.visualization3dUrl,
        threejs_html: invention.threejsVisualization?.html || null,
        business_strategy_svg: invention.businessStrategySvg,
        updated_at: new Date().toISOString()
      };
      
      // Store additional data as JSON in metadata columns
      const metadataColumns = {
        // Add custom columns for storing JSON data
        visualization_prompts_json: JSON.stringify(invention.visualizationPrompts || {}),
        threejs_visualization_json: JSON.stringify(invention.threejsVisualization || { code: null, html: null }),
        analysis_results_json: JSON.stringify(invention.analysisResults || {
          technical: [],
          market: [],
          legal: [],
          business: []
        })
      };
      
      // Combine base data with metadata
      const fullInventionData = {
        ...inventionData,
        ...metadataColumns
      };
      
      // Check if this is a new invention or an update
      if (invention.inventionId) {
        // Update existing invention
        const { error: updateError } = await supabase
          .from('inventions')
          .update(fullInventionData)
          .eq('id', inventionId);
          
        if (updateError) {
          throw new Error(`Failed to update invention: ${updateError.message}`);
        }
      } else {
        // Create new invention
        const { error: insertError } = await supabase
          .from('inventions')
          .insert({
            ...fullInventionData,
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
      
      // Cast the invention to our extended type that includes JSON fields
      const inventionData = invention as unknown as InventionDataFromDB;
      
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
      
      // Parse JSON data from metadata columns or use defaults
      let visualizationPrompts = {};
      try {
        visualizationPrompts = inventionData.visualization_prompts_json ? 
          JSON.parse(inventionData.visualization_prompts_json) : {};
      } catch (e) {
        console.error("Error parsing visualization_prompts_json:", e);
      }
      
      let threejsVisualization = { code: null, html: inventionData.threejs_html };
      try {
        threejsVisualization = inventionData.threejs_visualization_json ? 
          JSON.parse(inventionData.threejs_visualization_json) : {
            code: null,
            html: inventionData.threejs_html
          };
      } catch (e) {
        console.error("Error parsing threejs_visualization_json:", e);
      }
      
      let analysisResults = {
        technical: [],
        market: [],
        legal: [],
        business: []
      };
      try {
        analysisResults = inventionData.analysis_results_json ? 
          JSON.parse(inventionData.analysis_results_json) : {
            technical: [],
            market: [],
            legal: [],
            business: []
          };
      } catch (e) {
        console.error("Error parsing analysis_results_json:", e);
      }
      
      // Convert database model to application model
      const inventionState: InventionState = {
        inventionId: inventionData.id,
        title: inventionData.title || '',
        description: inventionData.description || '',
        sketchDataUrl: inventionData.sketch_data_url || null,
        assets: (assets || []).map((asset): InventionAsset => ({
          id: asset.id,
          type: asset.type as AssetType,
          url: asset.url,
          thumbnailUrl: asset.thumbnail_url || asset.url,
          name: asset.name || '',
          createdAt: new Date(asset.created_at).getTime()
        })),
        visualization3dUrl: inventionData.visualization_3d_url || null,
        visualizationPrompts: visualizationPrompts,
        savedToDatabase: true,
        threejsVisualization: threejsVisualization,
        businessStrategySvg: inventionData.business_strategy_svg || null,
        mostRecentGeneration: null, // Set to null initially
        analysisResults: analysisResults,
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
        .in('invention_id', inventions.map(inv => inv.id));
        
      if (assetsError) {
        console.error("Error fetching assets:", assetsError);
        // Don't throw error, just log it
      }
      
      // Convert database models to application models
      const inventionStates: InventionState[] = inventions.map(invention => {
        // Cast the invention to our extended type that includes JSON fields
        const inventionData = invention as unknown as InventionDataFromDB;
        
        // Find assets for this invention
        const inventionAssets = (allAssets || [])
          .filter(asset => asset.invention_id === inventionData.id)
          .map((asset): InventionAsset => ({
            id: asset.id,
            type: asset.type as AssetType,
            url: asset.url,
            thumbnailUrl: asset.thumbnail_url || asset.url,
            name: asset.name || '',
            createdAt: new Date(asset.created_at).getTime()
          }));
        
        // Parse JSON data from metadata columns or use defaults
        let visualizationPrompts = {};
        try {
          visualizationPrompts = inventionData.visualization_prompts_json ? 
            JSON.parse(inventionData.visualization_prompts_json) : {};
        } catch (e) {
          console.error("Error parsing visualization_prompts_json:", e);
        }
        
        let threejsVisualization = { code: null, html: inventionData.threejs_html };
        try {
          threejsVisualization = inventionData.threejs_visualization_json ? 
            JSON.parse(inventionData.threejs_visualization_json) : {
              code: null,
              html: inventionData.threejs_html
            };
        } catch (e) {
          console.error("Error parsing threejs_visualization_json:", e);
        }
        
        let analysisResults = {
          technical: [],
          market: [],
          legal: [],
          business: []
        };
        try {
          analysisResults = inventionData.analysis_results_json ? 
            JSON.parse(inventionData.analysis_results_json) : {
              technical: [],
              market: [],
              legal: [],
              business: []
            };
        } catch (e) {
          console.error("Error parsing analysis_results_json:", e);
        }
          
        return {
          inventionId: inventionData.id,
          title: inventionData.title || '',
          description: inventionData.description || '',
          sketchDataUrl: inventionData.sketch_data_url || null,
          assets: inventionAssets,
          visualization3dUrl: inventionData.visualization_3d_url || null,
          visualizationPrompts: visualizationPrompts,
          savedToDatabase: true,
          threejsVisualization: threejsVisualization,
          businessStrategySvg: inventionData.business_strategy_svg || null,
          mostRecentGeneration: null, // Set to null initially
          analysisResults: analysisResults,
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
