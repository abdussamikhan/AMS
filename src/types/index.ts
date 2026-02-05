import type { Database } from './supabase'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']

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
    mitigation_strategy: 'Accept' | 'Mitigate' | 'Transfer' | 'Avoid'
    action_plan: string
    status: 'Open' | 'In Progress' | 'Mitigated' | 'Closed'
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
