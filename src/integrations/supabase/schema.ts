
// Extend the Database type to include our custom tables
export interface InventionTables {
  inventions: {
    id: string;
    user_id: string;
    title: string;
    description: string;
    sketch_data_url: string | null;
    visualization_3d_url: string | null;
    threejs_html: string | null;
    business_strategy_svg: string | null;
    created_at: string;
    updated_at: string;
  };
  invention_assets: {
    id: string;
    invention_id: string;
    type: 'sketch' | 'image' | 'document' | '3d';
    url: string;
    thumbnail_url: string | null;
    name: string | null;
    created_at: string;
  };
  audio_transcriptions: {
    id: string;
    invention_id: string;
    text: string;
    language: string;
    audio_url: string | null;
    created_at: string;
  };
  analysis_results: {
    id: string;
    invention_id: string;
    analysis_type: 'technical' | 'market' | 'legal' | 'business';
    result: string;
    created_at: string;
  };
}

// Update the client.ts file to include our custom Database interface
export type DatabaseWithTables = {
  public: {
    Tables: InventionTables;
  };
};
