import type { Database } from './supabase'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type Industry = Database['public']['Tables']['industries']['Row'] & { is_active?: boolean | null }
export type Func = Database['public']['Tables']['functions']['Row'] & { is_active?: boolean | null }
export type Dept = Database['public']['Tables']['departments']['Row'] & { is_active?: boolean | null }
export type RiskCategory = Database['public']['Tables']['risk_categories']['Row']
export type AuditPlan = Database['public']['Tables']['audit_plans']['Row']

export interface System {
    system_id: string
    system_name: string
    is_active: boolean
    created_at: string
}

export interface ReferenceDocument {
    doc_id: string
    title: string
    category: string
    file_url: string
    file_size?: string
    created_at: string
}

export type Observation = Database['public']['Tables']['audit_observations']['Row'] & {
    audit_procedures: {
        procedure_name: string
        framework_mapping: {
            framework_name: string
            reference_code: string
            risk_categories: {
                category_name: string
            }
        }
    }
    management_responses: Database['public']['Tables']['management_responses']['Row'][]
    evidence_urls?: string[]
}

export type RCMEntry = Database['public']['Tables']['risk_control_matrix']['Row'] & {
    industries?: { industry_name: string }
    functions?: { function_name: string }
    departments?: { department_name: string }
    risk_categories?: { category_name: string }
    systems?: { system_name: string }
    system_id?: string | null
    risk_title?: string | null
    control_title?: string | null
}

export type RiskRegisterEntry = {
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
    risk_owner: string
    audit_frequency: string
    target_residual_score?: number
    remarks?: string
    control_title?: string
    control_description?: string
    action_plan: string
    fiscal_year: number
    created_by: string
    created_at: string
    updated_at: string
    risk_control_matrix?: {
        control_description: string
        control_frequency: string
    }
    risk_categories?: {
        category_name: string
    }
}

export type AuditProgram = Database['public']['Tables']['audit_programs']['Row'] & {
    audits?: { audit_title: string }
    tests?: AuditProgramTest[]
}

export type AuditProgramTest = Database['public']['Tables']['audit_program_tests']['Row'] & {
    risk_register?: RiskRegisterEntry
    procedures?: AuditProgramProcedure[]
}

export type AuditProgramProcedure = Database['public']['Tables']['audit_program_procedures']['Row']

export type AuditEngagement = Database['public']['Tables']['audits']['Row'] & {
    industries?: { industry_name: string } | null
    functions?: { function_name: string } | null
    departments?: { department_name: string } | null
    risk_categories?: { category_name: string } | null
    profiles?: { full_name: string | null } | null
}

export type AuditProcedure = Database['public']['Tables']['audit_procedures']['Row'] & {
    framework_mapping: {
        framework_name: string
        reference_code: string
        risk_categories?: {
            category_name: string
        } | null
    }
}

export interface NewRiskRegisterEntry {
    risk_title: string;
    risk_description: string;
    risk_category_id: string;
    inherent_likelihood: number;
    inherent_impact: number;
    residual_likelihood: number;
    residual_impact: number;
    risk_owner: string;
    audit_frequency: string;
    action_plan: string;
    status: string;
    fiscal_year: number;
    rcm_id: string | null;
    control_title?: string;
    control_description?: string;
    target_residual_score?: number;
    remarks?: string;
}

export interface NewRcmEntry {
    industry_id: string;
    function_id: string;
    department_id: string;
    risk_category_id: string;
    risk_title: string;
    risk_description: string;
    control_title: string;
    control_description: string;
    reference_standard: string;
    control_type: Database['public']['Enums']['control_type'];
    control_frequency: Database['public']['Enums']['control_frequency'];
    system_id: string | null;
}

export interface NewObservation {
    procedure_id: string;
    condition: string;
    criteria: string;
    cause: string;
    effect: string;
    recommendation: string;
    risk_rating: Database['public']['Enums']['risk_level'];
    title: string;
    audit_id: string;
}
