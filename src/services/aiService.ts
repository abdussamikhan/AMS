import { supabase } from '../supabase'
import type { NewRcmEntry, NewObservation } from '../types'

export const invokeAiProcessRcm = async (rawText: string): Promise<Partial<NewRcmEntry>> => {
    const { data, error } = await supabase.functions.invoke('process-rcm-entry', {
        body: { rawText }
    })
    if (error) throw error
    return data as Partial<NewRcmEntry>
}

export const invokeAiProcessAuditFinding = async (rawText: string): Promise<Partial<NewObservation>> => {
    const { data, error } = await supabase.functions.invoke('process-audit-finding', {
        body: { rawText }
    })
    if (error) throw error
    return data as Partial<NewObservation>
}
