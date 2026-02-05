import { supabase } from '../supabase'

export const invokeAiProcessRcm = async (rawText: string) => {
    const { data, error } = await supabase.functions.invoke('process-rcm-entry', {
        body: { rawText }
    })
    if (error) throw error
    return data
}

export const invokeAiProcessAuditFinding = async (rawText: string) => {
    const { data, error } = await supabase.functions.invoke('process-audit-finding', {
        body: { rawText }
    })
    if (error) throw error
    return data
}
