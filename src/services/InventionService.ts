
import { supabase } from "@/integrations/supabase/client";
import { 
  InventionState, 
  InventionAsset, 
  AudioTranscription 
} from "@/contexts/InventionContext";
import { toast } from "sonner";
import { DatabaseWithTables } from "@/integrations/supabase/schema";

export interface SavedInvention {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  assets: InventionAsset[];
  transcriptions: AudioTranscription[];
}

// Create a typed supabase client
const typedSupabase = supabase as unknown as ReturnType<typeof supabase<DatabaseWithTables>>;

export const InventionService = {
  // Save an invention and all related data to Supabase
  async saveInvention(state: InventionState): Promise<string | null> {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("You must be logged in to save an invention");
      }

      // First, save or update the main invention record
      let inventionId = state.inventionId;
      
      if (inventionId) {
        // Update existing invention
        const { error } = await supabase
          .from('inventions')
          .update({
            title: state.title,
            description: state.description,
            sketch_data_url: state.sketchDataUrl,
            visualization_3d_url: state.visualization3dUrl,
            threejs_html: state.threejsVisualization.html,
            business_strategy_svg: state.businessStrategySvg,
            updated_at: new Date().toISOString()
          })
          .eq('id', inventionId);
          
        if (error) throw error;
      } else {
        // Create new invention
        const { data, error } = await supabase
          .from('inventions')
          .insert({
            user_id: session.user.id,
            title: state.title,
            description: state.description,
            sketch_data_url: state.sketchDataUrl,
            visualization_3d_url: state.visualization3dUrl,
            threejs_html: state.threejsVisualization.html,
            business_strategy_svg: state.businessStrategySvg
          })
          .select('id')
          .single();
          
        if (error) throw error;
        inventionId = data?.id;
        if (!inventionId) throw new Error("Failed to get invention ID");
      }
      
      // Now that we have the invention ID, we can save related data
      
      // 1. Save assets
      if (state.assets.length > 0) {
        // Delete existing assets for this invention to avoid duplicates
        await supabase
          .from('invention_assets')
          .delete()
          .eq('invention_id', inventionId);
          
        // Insert new assets
        const assetsToInsert = state.assets.map(asset => ({
          invention_id: inventionId,
          type: asset.type,
          url: asset.url,
          thumbnail_url: asset.thumbnailUrl,
          name: asset.name || `${asset.type} ${new Date(asset.createdAt).toLocaleString()}`
        }));
        
        const { error: assetsError } = await supabase
          .from('invention_assets')
          .insert(assetsToInsert);
          
        if (assetsError) throw assetsError;
      }
      
      // 2. Save audio transcriptions
      if (state.audioTranscriptions.length > 0) {
        // Delete existing transcriptions for this invention
        await supabase
          .from('audio_transcriptions')
          .delete()
          .eq('invention_id', inventionId);
          
        // Insert new transcriptions
        const transcriptionsToInsert = state.audioTranscriptions.map(transcription => ({
          invention_id: inventionId,
          text: transcription.text,
          language: transcription.language || 'en',
          audio_url: transcription.audioUrl
        }));
        
        const { error: transcriptionsError } = await supabase
          .from('audio_transcriptions')
          .insert(transcriptionsToInsert);
          
        if (transcriptionsError) throw transcriptionsError;
      }
      
      // 3. Save analysis results
      const analysisToInsert = [];
      
      // Technical analysis
      if (state.analysisResults.technical.length > 0) {
        state.analysisResults.technical.forEach(result => {
          analysisToInsert.push({
            invention_id: inventionId,
            analysis_type: 'technical' as const,
            result
          });
        });
      }
      
      // Market analysis
      if (state.analysisResults.market.length > 0) {
        state.analysisResults.market.forEach(result => {
          analysisToInsert.push({
            invention_id: inventionId,
            analysis_type: 'market' as const,
            result
          });
        });
      }
      
      // Legal analysis
      if (state.analysisResults.legal.length > 0) {
        state.analysisResults.legal.forEach(result => {
          analysisToInsert.push({
            invention_id: inventionId,
            analysis_type: 'legal' as const,
            result
          });
        });
      }
      
      // Business analysis
      if (state.analysisResults.business.length > 0) {
        state.analysisResults.business.forEach(result => {
          analysisToInsert.push({
            invention_id: inventionId,
            analysis_type: 'business' as const,
            result
          });
        });
      }
      
      if (analysisToInsert.length > 0) {
        // Delete existing analysis results
        await supabase
          .from('analysis_results')
          .delete()
          .eq('invention_id', inventionId);
          
        // Insert new analysis results
        const { error: analysisError } = await supabase
          .from('analysis_results')
          .insert(analysisToInsert);
          
        if (analysisError) throw analysisError;
      }
      
      return inventionId;
    } catch (error) {
      console.error("Error saving invention:", error);
      throw error;
    }
  },
  
  // Load an invention and all related data from Supabase
  async getInventionById(id: string): Promise<InventionState | null> {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("You must be logged in to load an invention");
      }
      
      // Get the main invention record
      const { data: invention, error } = await supabase
        .from('inventions')
        .select('*')
        .eq('id', id)
        .eq('user_id', session.user.id)
        .single();
        
      if (error) throw error;
      if (!invention) return null;
      
      // Get assets for this invention
      const { data: assets, error: assetsError } = await supabase
        .from('invention_assets')
        .select('*')
        .eq('invention_id', id);
        
      if (assetsError) throw assetsError;
      
      // Get audio transcriptions
      const { data: transcriptions, error: transcriptionsError } = await supabase
        .from('audio_transcriptions')
        .select('*')
        .eq('invention_id', id);
        
      if (transcriptionsError) throw transcriptionsError;
      
      // Get analysis results
      const { data: analysisResults, error: analysisError } = await supabase
        .from('analysis_results')
        .select('*')
        .eq('invention_id', id);
        
      if (analysisError) throw analysisError;
      
      // Build the analysis results object
      const technical = analysisResults
        .filter(result => result.analysis_type === 'technical')
        .map(result => result.result);
        
      const market = analysisResults
        .filter(result => result.analysis_type === 'market')
        .map(result => result.result);
        
      const legal = analysisResults
        .filter(result => result.analysis_type === 'legal')
        .map(result => result.result);
        
      const business = analysisResults
        .filter(result => result.analysis_type === 'business')
        .map(result => result.result);
      
      // Convert Supabase data to InventionState format
      const inventionState: InventionState = {
        inventionId: invention.id,
        title: invention.title || '',
        description: invention.description || '',
        sketchDataUrl: invention.sketch_data_url,
        assets: assets ? assets.map(asset => ({
          id: asset.id,
          type: asset.type as any,
          url: asset.url,
          thumbnailUrl: asset.thumbnail_url,
          name: asset.name,
          createdAt: new Date(asset.created_at).getTime()
        })) : [],
        visualization3dUrl: invention.visualization_3d_url,
        visualizationPrompts: {},
        savedToDatabase: true,
        threejsVisualization: {
          code: null,
          html: invention.threejs_html
        },
        businessStrategySvg: invention.business_strategy_svg,
        analysisResults: {
          technical,
          market,
          legal,
          business
        },
        audioTranscriptions: transcriptions ? transcriptions.map(t => ({
          text: t.text,
          language: t.language,
          audioUrl: t.audio_url,
          timestamp: new Date(t.created_at).getTime()
        })) : []
      };
      
      return inventionState;
    } catch (error) {
      console.error("Error loading invention:", error);
      return null;
    }
  },
  
  // Get a list of the user's inventions
  async getUserInventions(): Promise<SavedInvention[]> {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("You must be logged in to load your inventions");
      }
      
      // Get the user's inventions
      const { data: inventions, error } = await supabase
        .from('inventions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      if (!inventions) return [];
      
      // For each invention, get its assets and transcriptions
      const result: SavedInvention[] = [];
      
      for (const invention of inventions) {
        // Get assets for this invention
        const { data: assets } = await supabase
          .from('invention_assets')
          .select('*')
          .eq('invention_id', invention.id);
          
        // Get transcriptions for this invention
        const { data: transcriptions } = await supabase
          .from('audio_transcriptions')
          .select('*')
          .eq('invention_id', invention.id);
          
        result.push({
          id: invention.id,
          title: invention.title || 'Untitled Invention',
          description: invention.description || '',
          created_at: invention.created_at,
          updated_at: invention.updated_at,
          assets: (assets || []).map(asset => ({
            id: asset.id,
            type: asset.type as any,
            url: asset.url,
            thumbnailUrl: asset.thumbnail_url,
            name: asset.name,
            createdAt: new Date(asset.created_at).getTime()
          })),
          transcriptions: (transcriptions || []).map(t => ({
            text: t.text,
            language: t.language,
            audioUrl: t.audio_url,
            timestamp: new Date(t.created_at).getTime()
          }))
        });
      }
      
      return result;
    } catch (error) {
      console.error("Error loading inventions:", error);
      return [];
    }
  },
  
  // Delete an invention
  async deleteInvention(id: string): Promise<boolean> {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("You must be logged in to delete an invention");
      }
      
      // Delete the invention (cascading will delete related records)
      const { error } = await supabase
        .from('inventions')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error("Error deleting invention:", error);
      return false;
    }
  }
};
