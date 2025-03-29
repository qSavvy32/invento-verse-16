export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analysis_results: {
        Row: {
          analysis_type: string
          created_at: string
          id: string
          invention_id: string
          result: string
        }
        Insert: {
          analysis_type: string
          created_at?: string
          id?: string
          invention_id: string
          result: string
        }
        Update: {
          analysis_type?: string
          created_at?: string
          id?: string
          invention_id?: string
          result?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_results_invention_id_fkey"
            columns: ["invention_id"]
            isOneToOne: false
            referencedRelation: "inventions"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_transcriptions: {
        Row: {
          audio_url: string | null
          created_at: string
          id: string
          invention_id: string
          language: string
          text: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          id?: string
          invention_id: string
          language?: string
          text: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          id?: string
          invention_id?: string
          language?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "audio_transcriptions_invention_id_fkey"
            columns: ["invention_id"]
            isOneToOne: false
            referencedRelation: "inventions"
            referencedColumns: ["id"]
          },
        ]
      }
      invention_assets: {
        Row: {
          created_at: string
          id: string
          invention_id: string
          name: string | null
          thumbnail_url: string | null
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          invention_id: string
          name?: string | null
          thumbnail_url?: string | null
          type: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          invention_id?: string
          name?: string | null
          thumbnail_url?: string | null
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "invention_assets_invention_id_fkey"
            columns: ["invention_id"]
            isOneToOne: false
            referencedRelation: "inventions"
            referencedColumns: ["id"]
          },
        ]
      }
      inventions: {
        Row: {
          business_strategy_svg: string | null
          created_at: string
          description: string | null
          id: string
          sketch_data_url: string | null
          threejs_html: string | null
          title: string
          updated_at: string
          user_id: string
          visualization_3d_url: string | null
        }
        Insert: {
          business_strategy_svg?: string | null
          created_at?: string
          description?: string | null
          id?: string
          sketch_data_url?: string | null
          threejs_html?: string | null
          title: string
          updated_at?: string
          user_id: string
          visualization_3d_url?: string | null
        }
        Update: {
          business_strategy_svg?: string | null
          created_at?: string
          description?: string | null
          id?: string
          sketch_data_url?: string | null
          threejs_html?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          visualization_3d_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
