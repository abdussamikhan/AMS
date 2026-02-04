export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_observations: {
        Row: {
          cause: string | null
          condition: string
          created_at: string
          criteria: string
          effect: string | null
          evidence_urls: string[] | null
          observation_id: string
          procedure_id: string
          recommendation: string | null
          risk_rating: Database["public"]["Enums"]["risk_level"]
        }
        Insert: {
          cause?: string | null
          condition: string
          created_at?: string
          criteria: string
          effect?: string | null
          evidence_urls?: string[] | null
          observation_id?: string
          procedure_id: string
          recommendation?: string | null
          risk_rating: Database["public"]["Enums"]["risk_level"]
        }
        Update: {
          cause?: string | null
          condition?: string
          created_at?: string
          criteria?: string
          effect?: string | null
          evidence_urls?: string[] | null
          observation_id?: string
          procedure_id?: string
          recommendation?: string | null
          risk_rating?: Database["public"]["Enums"]["risk_level"]
        }
        Relationships: [
          {
            foreignKeyName: "audit_observations_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "audit_procedures"
            referencedColumns: ["procedure_id"]
          },
        ]
      }
      audit_procedures: {
        Row: {
          created_at: string
          mapping_id: string
          procedure_id: string
          procedure_name: string
          steps_to_perform: string
        }
        Insert: {
          created_at?: string
          mapping_id: string
          procedure_id?: string
          procedure_name: string
          steps_to_perform: string
        }
        Update: {
          created_at?: string
          mapping_id?: string
          procedure_id?: string
          procedure_name?: string
          steps_to_perform?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_procedures_mapping_id_fkey"
            columns: ["mapping_id"]
            isOneToOne: false
            referencedRelation: "framework_mapping"
            referencedColumns: ["mapping_id"]
          },
        ]
      }
      framework_mapping: {
        Row: {
          category_id: string
          created_at: string
          framework_name: string
          mapping_id: string
          reference_code: string
        }
        Insert: {
          category_id: string
          created_at?: string
          framework_name: string
          mapping_id?: string
          reference_code: string
        }
        Update: {
          category_id?: string
          created_at?: string
          framework_name?: string
          mapping_id?: string
          reference_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "framework_mapping_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "risk_categories"
            referencedColumns: ["category_id"]
          },
        ]
      }
      management_responses: {
        Row: {
          action_plan: string
          created_at: string
          management_response: string
          observation_id: string
          response_id: string
          responsible_person: string
          status: string
          target_date: string
        }
        Insert: {
          action_plan: string
          created_at?: string
          management_response: string
          observation_id: string
          response_id?: string
          responsible_person: string
          status?: string
          target_date: string
        }
        Update: {
          action_plan?: string
          created_at?: string
          management_response?: string
          observation_id?: string
          response_id?: string
          responsible_person?: string
          status?: string
          target_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "management_responses_observation_id_fkey"
            columns: ["observation_id"]
            isOneToOne: false
            referencedRelation: "audit_observations"
            referencedColumns: ["observation_id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      risk_categories: {
        Row: {
          category_id: string
          category_name: string
          created_at: string
          description: string | null
        }
        Insert: {
          category_id?: string
          category_name: string
          created_at?: string
          description?: string | null
        }
        Update: {
          category_id?: string
          category_name?: string
          created_at?: string
          description?: string | null
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
      risk_level: "Low" | "Medium" | "High" | "Critical"
      user_role: "auditor" | "manager" | "client"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (DatabaseWithoutInternals["public"]["Tables"] & DatabaseWithoutInternals["public"]["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends PublicTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? keyof (DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (DatabaseWithoutInternals["public"]["Tables"] &
    DatabaseWithoutInternals["public"]["Views"])
  ? (DatabaseWithoutInternals["public"]["Tables"] &
    DatabaseWithoutInternals["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof DatabaseWithoutInternals["public"]["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends PublicTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? keyof DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : PublicTableNameOrOptions extends keyof DatabaseWithoutInternals["public"]["Tables"]
  ? DatabaseWithoutInternals["public"]["Tables"][PublicTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof DatabaseWithoutInternals["public"]["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends PublicTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? keyof DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : PublicTableNameOrOptions extends keyof DatabaseWithoutInternals["public"]["Tables"]
  ? DatabaseWithoutInternals["public"]["Tables"][PublicTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof DatabaseWithoutInternals["public"]["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? keyof DatabaseWithoutInternals[PublicEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof DatabaseWithoutInternals["public"]["Enums"]
  ? DatabaseWithoutInternals["public"]["Enums"][PublicEnumNameOrOptions]
  : never
