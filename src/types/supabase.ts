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
      audit_observations: {
        Row: {
          cause: string | null
          condition: string
          created_at: string
          criteria: string
          effect: string | null
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
      management_responses: {
        Row: {
          action_plan: string
          created_at: string
          management_response: string
          observation_id: string
          responsible_person: string | null
          response_id: string
          status: string | null
          target_date: string | null
        }
        Insert: {
          action_plan: string
          created_at?: string
          management_response: string
          observation_id: string
          responsible_person?: string | null
          response_id?: string
          status?: string | null
          target_date?: string | null
        }
        Update: {
          action_plan?: string
          created_at?: string
          management_response?: string
          observation_id?: string
          responsible_person?: string | null
          response_id?: string
          status?: string | null
          target_date?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      risk_level: "Low" | "Medium" | "High" | "Critical"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
