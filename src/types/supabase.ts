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
          evidence_json: Json | null
          evidence_urls: string[] | null
          observation_id: string
          procedure_id: string
          recommendation: string | null
          risk_rating: Database["public"]["Enums"]["risk_level"]
          title: string
        }
        Insert: {
          cause?: string | null
          condition: string
          created_at?: string
          criteria: string
          effect?: string | null
          evidence_json?: Json | null
          evidence_urls?: string[] | null
          observation_id?: string
          procedure_id: string
          recommendation?: string | null
          risk_rating: Database["public"]["Enums"]["risk_level"]
          title: string
        }
        Update: {
          cause?: string | null
          condition?: string
          created_at?: string
          criteria?: string
          effect?: string | null
          evidence_json?: Json | null
          evidence_urls?: string[] | null
          observation_id?: string
          procedure_id?: string
          recommendation?: string | null
          risk_rating?: Database["public"]["Enums"]["risk_level"]
          title?: string
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
          created_at: string
          framework_name: string
          mapping_id: string
          reference_code: string
          reference_description: string | null
          risk_id: string
        }
        Insert: {
          created_at?: string
          framework_name: string
          mapping_id?: string
          reference_code: string
          reference_description?: string | null
          risk_id: string
        }
        Update: {
          created_at?: string
          framework_name?: string
          mapping_id?: string
          reference_code?: string
          reference_description?: string | null
          risk_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "framework_mapping_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "risk_categories"
            referencedColumns: ["risk_id"]
          },
        ]
      }
      functions: {
        Row: {
          created_at: string | null
          description: string | null
          function_id: string
          function_name: string
          sector_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          function_id?: string
          function_name: string
          sector_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          function_id?: string
          function_name?: string
          sector_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "functions_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["sector_id"]
          },
        ]
      }
      industries: {
        Row: {
          created_at: string | null
          description: string | null
          industry_id: string
          industry_name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          industry_id?: string
          industry_name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          industry_id?: string
          industry_name?: string
        }
        Relationships: []
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
          category_name: string
          created_at: string
          description: string | null
          risk_id: string
        }
        Insert: {
          category_name: string
          created_at?: string
          description?: string | null
          risk_id?: string
        }
        Update: {
          category_name?: string
          created_at?: string
          description?: string | null
          risk_id?: string
        }
        Relationships: []
      }
      risk_control_matrix: {
        Row: {
          control_description: string
          control_frequency:
          | Database["public"]["Enums"]["control_frequency"]
          | null
          control_type: Database["public"]["Enums"]["control_type"] | null
          created_at: string | null
          function_id: string | null
          industry_id: string | null
          rcm_id: string
          reference_standard: string | null
          risk_category_id: string | null
          risk_description: string
          sector_id: string | null
          updated_at: string | null
        }
        Insert: {
          control_description: string
          control_frequency?:
          | Database["public"]["Enums"]["control_frequency"]
          | null
          control_type?: Database["public"]["Enums"]["control_type"] | null
          created_at?: string | null
          function_id?: string | null
          industry_id?: string | null
          rcm_id?: string
          reference_standard?: string | null
          risk_category_id?: string | null
          risk_description: string
          sector_id?: string | null
          updated_at?: string | null
        }
        Update: {
          control_description?: string
          control_frequency?:
          | Database["public"]["Enums"]["control_frequency"]
          | null
          control_type?: Database["public"]["Enums"]["control_type"] | null
          created_at?: string | null
          function_id?: string | null
          industry_id?: string | null
          rcm_id?: string
          reference_standard?: string | null
          risk_category_id?: string | null
          risk_description?: string
          sector_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_control_matrix_function_id_fkey"
            columns: ["function_id"]
            isOneToOne: false
            referencedRelation: "functions"
            referencedColumns: ["function_id"]
          },
          {
            foreignKeyName: "risk_control_matrix_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["industry_id"]
          },
          {
            foreignKeyName: "risk_control_matrix_risk_category_id_fkey"
            columns: ["risk_category_id"]
            isOneToOne: false
            referencedRelation: "risk_categories"
            referencedColumns: ["risk_id"]
          },
          {
            foreignKeyName: "risk_control_matrix_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["sector_id"]
          },
        ]
      }
      sectors: {
        Row: {
          created_at: string | null
          description: string | null
          industry_id: string | null
          sector_id: string
          sector_name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          industry_id?: string | null
          sector_id?: string
          sector_name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          industry_id?: string | null
          sector_id?: string
          sector_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "sectors_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["industry_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      control_frequency:
      | "Continuous"
      | "Daily"
      | "Weekly"
      | "Monthly"
      | "Quarterly"
      | "Annual"
      control_type: "Preventive" | "Detective" | "Corrective"
      risk_level: "Low" | "Medium" | "High" | "Critical"
      user_role: "auditor" | "manager" | "client"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals["public"]

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends PublicTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
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
  : PublicTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends PublicTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : PublicTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][PublicTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends PublicTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : PublicTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][PublicTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {
      control_frequency: [
        "Continuous",
        "Daily",
        "Weekly",
        "Monthly",
        "Quarterly",
        "Annual",
      ],
      control_type: ["Preventive", "Detective", "Corrective"],
      risk_level: ["Low", "Medium", "High", "Critical"],
      user_role: ["auditor", "manager", "client"],
    },
  },
} as const
