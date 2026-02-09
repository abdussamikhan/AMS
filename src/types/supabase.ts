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
          audit_id: string | null
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
          audit_id?: string | null
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
          audit_id?: string | null
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
            foreignKeyName: "audit_observations_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["audit_id"]
          },
          {
            foreignKeyName: "audit_observations_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "audit_procedures"
            referencedColumns: ["procedure_id"]
          }
        ]
      }
      audit_plans: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          plan_id: string
          status: string | null
          title: string
          year: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          plan_id?: string
          status?: string | null
          title: string
          year: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          plan_id?: string
          status?: string | null
          title?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "audit_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      audit_procedures: {
        Row: {
          created_at: string
          mapping_id: string
          procedure_description: string | null
          procedure_id: string
          procedure_name: string
        }
        Insert: {
          created_at?: string
          mapping_id: string
          procedure_description?: string | null
          procedure_id?: string
          procedure_name: string
        }
        Update: {
          created_at?: string
          mapping_id?: string
          procedure_description?: string | null
          procedure_id?: string
          procedure_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_procedures_mapping_id_fkey"
            columns: ["mapping_id"]
            isOneToOne: false
            referencedRelation: "framework_mapping"
            referencedColumns: ["mapping_id"]
          }
        ]
      }
      audit_program_procedures: {
        Row: {
          created_at: string
          description: string | null
          evidence_requirements: string | null
          evidence_urls: string[] | null
          id: string
          procedure_name: string
          status: string
          test_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          evidence_requirements?: string | null
          evidence_urls?: string[] | null
          id?: string
          procedure_name: string
          status?: string
          test_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          evidence_requirements?: string | null
          evidence_urls?: string[] | null
          id?: string
          procedure_name?: string
          status?: string
          test_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_program_procedures_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "audit_program_tests"
            referencedColumns: ["id"]
          }
        ]
      }
      audit_program_tests: {
        Row: {
          control_status: string
          created_at: string
          id: string
          issue_observation: boolean
          program_id: string
          risk_register_id: string
          risk_status: string
          updated_at: string
        }
        Insert: {
          control_status?: string
          created_at?: string
          id?: string
          issue_observation?: boolean
          program_id: string
          risk_register_id: string
          risk_status?: string
          updated_at?: string
        }
        Update: {
          control_status?: string
          created_at?: string
          id?: string
          issue_observation?: boolean
          program_id?: string
          risk_register_id?: string
          risk_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_program_tests_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "audit_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_program_tests_risk_register_id_fkey"
            columns: ["risk_register_id"]
            isOneToOne: false
            referencedRelation: "risk_register"
            referencedColumns: ["id"]
          }
        ]
      }
      audit_programs: {
        Row: {
          audit_id: string
          created_at: string
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          audit_id: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          audit_id?: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_programs_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["audit_id"]
          }
        ]
      }
      audits: {
        Row: {
          assigned_auditor: string | null
          audit_id: string
          audit_title: string
          created_at: string | null
          department_id: string | null
          end_date: string | null
          function_id: string | null
          industry_id: string | null
          plan_id: string | null
          start_date: string | null
          status: string | null
        }
        Insert: {
          assigned_auditor?: string | null
          audit_id?: string
          audit_title: string
          created_at?: string | null
          department_id?: string | null
          end_date?: string | null
          function_id?: string | null
          industry_id?: string | null
          plan_id?: string | null
          start_date?: string | null
          status?: string | null
        }
        Update: {
          assigned_auditor?: string | null
          audit_id?: string
          audit_title?: string
          created_at?: string | null
          department_id?: string | null
          end_date?: string | null
          function_id?: string | null
          industry_id?: string | null
          plan_id?: string | null
          start_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audits_assigned_auditor_fkey"
            columns: ["assigned_auditor"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audits_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "audits_function_id_fkey"
            columns: ["function_id"]
            isOneToOne: false
            referencedRelation: "functions"
            referencedColumns: ["function_id"]
          },
          {
            foreignKeyName: "audits_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["industry_id"]
          },
          {
            foreignKeyName: "audits_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "audit_plans"
            referencedColumns: ["plan_id"]
          }
        ]
      }
      departments: {
        Row: {
          created_at: string
          department_id: string
          department_name: string
          function_id: string
          is_active?: boolean
        }
        Insert: {
          created_at?: string
          department_id?: string
          department_name: string
          function_id: string
          is_active?: boolean
        }
        Update: {
          created_at?: string
          department_id?: string
          department_name?: string
          function_id?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "departments_function_id_fkey"
            columns: ["function_id"]
            isOneToOne: false
            referencedRelation: "functions"
            referencedColumns: ["function_id"]
          }
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
          }
        ]
      }
      functions: {
        Row: {
          created_at: string
          function_id: string
          function_name: string
        }
        Insert: {
          created_at?: string
          function_id?: string
          function_name: string
        }
        Update: {
          created_at?: string
          function_id?: string
          function_name?: string
          is_active?: boolean
        }
        Relationships: []
      }
      industries: {
        Row: {
          created_at: string
          industry_id: string
          industry_name: string
          is_active: boolean | null
        }
        Insert: {
          created_at?: string
          industry_id?: string
          industry_name: string
          is_active?: boolean
        }
        Update: {
          created_at?: string
          industry_id?: string
          industry_name?: string
          is_active?: boolean
        }
        Relationships: []
      }
      management_responses: {
        Row: {
          action_plan: string | null
          created_at: string
          management_response: string | null
          observation_id: string
          response_id: string
          responsible_person: string | null
          status: string | null
          target_date: string | null
        }
        Insert: {
          action_plan?: string | null
          created_at?: string
          management_response?: string | null
          observation_id: string
          response_id?: string
          responsible_person?: string | null
          status?: string | null
          target_date?: string | null
        }
        Update: {
          action_plan?: string | null
          created_at?: string
          management_response?: string | null
          observation_id?: string
          response_id?: string
          responsible_person?: string | null
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
          }
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
      risk_control_matrix: {
        Row: {
          control_description: string
          control_frequency: Database["public"]["Enums"]["control_frequency"] | null
          control_type: Database["public"]["Enums"]["control_type"] | null
          created_at: string
          department_id: string | null
          function_id: string | null
          industry_id: string | null
          rcm_id: string
          reference_standard: string | null
          risk_category_id: string
          risk_description: string
          updated_at: string
        }
        Insert: {
          control_description: string
          control_frequency?: Database["public"]["Enums"]["control_frequency"] | null
          control_type?: Database["public"]["Enums"]["control_type"] | null
          created_at?: string
          department_id?: string | null
          function_id?: string | null
          industry_id?: string | null
          rcm_id?: string
          reference_standard?: string | null
          risk_category_id: string
          risk_description: string
          updated_at?: string
        }
        Update: {
          control_description?: string
          control_frequency?: Database["public"]["Enums"]["control_frequency"] | null
          control_type?: Database["public"]["Enums"]["control_type"] | null
          created_at?: string
          department_id?: string | null
          function_id?: string | null
          industry_id?: string | null
          rcm_id?: string
          reference_standard?: string | null
          risk_category_id?: string
          risk_description?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_control_matrix_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["department_id"]
          },
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
          }
        ]
      }
      risk_register: {
        Row: {
          id: string
          rcm_id: string | null
          risk_title: string
          risk_description: string
          risk_category_id: string
          inherent_likelihood: number
          inherent_impact: number
          inherent_score: number
          residual_likelihood: number
          residual_impact: number
          residual_score: number
          risk_owner: string | null
          audit_frequency: string | null
          target_residual_score: number | null
          remarks: string | null
          control_title: string | null
          control_description: string | null
          action_plan: string | null
          fiscal_year: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          rcm_id?: string | null
          risk_title: string
          risk_description: string
          risk_category_id: string
          inherent_likelihood: number
          inherent_impact: number
          inherent_score: number
          residual_likelihood: number
          residual_impact: number
          residual_score: number
          risk_owner?: string | null
          audit_frequency?: string | null
          target_residual_score?: number | null
          remarks?: string | null
          control_title?: string | null
          control_description?: string | null
          action_plan?: string | null
          fiscal_year: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          rcm_id?: string | null
          risk_title?: string
          risk_description?: string
          risk_category_id?: string
          inherent_likelihood?: number
          inherent_impact?: number
          inherent_score?: number
          residual_likelihood?: number
          residual_impact?: number
          residual_score?: number
          risk_owner?: string | null
          audit_frequency?: string | null
          target_residual_score?: number | null
          remarks?: string | null
          control_title?: string | null
          control_description?: string | null
          action_plan?: string | null
          fiscal_year?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_register_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
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
      user_role: "auditor" | "manager" | "client" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
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
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
    Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
    Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof Database["public"]["Tables"]
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
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof Database["public"]["Tables"]
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
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof Database["public"]["Enums"]
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
