import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import type { Database } from '../types/supabase'
import type {
    Observation, Notification, RCMEntry, RiskRegisterEntry, Profile, AuditProgram,
    Industry, Func, Dept, RiskCategory, System, AuditPlan, AuditEngagement, AuditProcedure, ReferenceDocument
} from '../types'
import { invokeAiProcessRcm, invokeAiProcessAuditFinding } from '../services/aiService'
import { downloadCSV, generatePDF, generateDetailedPDF, generateRiskRegisterPDF, downloadRiskRegisterCSV } from '../services/exportService'
import type { Session } from '@supabase/supabase-js'

export const useAuditData = (session: Session | null) => {
    const [isDataLoading, setIsDataLoading] = useState(false)
    const [observations, setObservations] = useState<Observation[]>([])
    const [procedures, setProcedures] = useState<AuditProcedure[]>([])
    const [stats, setStats] = useState({
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        totalRisks: 0
    })
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [showNotifications, setShowNotifications] = useState(false)

    // RCM State
    const [rcmEntries, setRcmEntries] = useState<RCMEntry[]>([])
    const [industries, setIndustries] = useState<Industry[]>([])
    const [allFunctions, setAllFunctions] = useState<Func[]>([])
    const [allDepartments, setAllDepartments] = useState<Dept[]>([])
    const [riskCats, setRiskCats] = useState<RiskCategory[]>([])
    const [allSystems, setAllSystems] = useState<System[]>([])
    const [rcmFilters, setRcmFilters] = useState({ industry: 'all', function: 'all', department: 'all', system: 'all', category: 'all', frequency: 'all', search: '' })
    const [showNewRcmModal, setShowNewRcmModal] = useState(false)
    const [refDocs, setRefDocs] = useState<ReferenceDocument[]>([])
    const [refFilters, setRefFilters] = useState({ category: 'all', search: '' })
    const [riskRegisterEntries, setRiskRegisterEntries] = useState<RiskRegisterEntry[]>([])
    const [riskRegisterFilters, setRiskRegisterFilters] = useState({ category: 'all', owner: 'all', year: new Date().getFullYear().toString(), search: '' })
    const [showNewRiskModal, setShowNewRiskModal] = useState(false)
    const [isEditingRisk, setIsEditingRisk] = useState(false)
    const [currentRiskId, setCurrentRiskId] = useState<string | null>(null)
    const [newRiskEntry, setNewRiskEntry] = useState<Partial<RiskRegisterEntry>>({
        risk_title: '',
        risk_description: '',
        risk_category_id: '',
        inherent_likelihood: 3,
        inherent_impact: 3,
        residual_likelihood: 2,
        residual_impact: 2,
        risk_owner: '',
        audit_frequency: '12 months',
        action_plan: '',
        fiscal_year: new Date().getFullYear(),
        rcm_id: null
    })
    const [isRefUploading, setIsRefUploading] = useState(false)
    const [showRefUploadModal, setShowRefUploadModal] = useState(false)
    const [newRefDoc, setNewRefDoc] = useState({ title: '', category: 'Standard' })
    const [newRcm, setNewRcm] = useState({
        industry_id: '',
        function_id: '',
        department_id: '',
        risk_category_id: '',
        risk_title: '',
        risk_description: '',
        control_title: '',
        control_description: '',
        reference_standard: '',
        control_type: 'Preventive' as Database['public']['Enums']['control_type'],
        control_frequency: 'Continuous' as Database['public']['Enums']['control_frequency'],
        system_id: ''
    })

    // Audit Program State
    const [auditPrograms, setAuditPrograms] = useState<AuditProgram[]>([])
    const [selectedProgram, setSelectedProgram] = useState<AuditProgram | null>(null)
    const [isProgramLoading, setIsProgramLoading] = useState(false)

    // Audit Planning & Scheduling State
    const [auditPlans, setAuditPlans] = useState<AuditPlan[]>([])
    const [audits, setAudits] = useState<AuditEngagement[]>([])
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
    const [isTemplateUploading, setIsTemplateUploading] = useState(false)
    const [showNewPlanModal, setShowNewPlanModal] = useState(false)
    const [showNewAuditModal, setShowNewAuditModal] = useState(false)
    const [newPlan, setNewPlan] = useState({ title: '', year: new Date().getFullYear(), description: '', status: 'Draft' })
    const [newAudit, setNewAudit] = useState({
        plan_id: '',
        audit_title: '',
        start_date: '',
        end_date: '',
        assigned_auditor: '',
        industry_id: '',
        function_id: '',
        department_id: '',
        status: 'Scheduled'
    })
    const [auditors, setAuditors] = useState<Profile[]>([])

    // Management response form state
    const [mgmtResp, setMgmtResp] = useState({
        management_response: '',
        action_plan: '',
        responsible_person: '',
        target_date: '',
        status: 'Open'
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Supporting states for custom fields
    const [isCustomFunctionRcm, setIsCustomFunctionRcm] = useState(false)
    const [isCustomDepartmentRcm, setIsCustomDepartmentRcm] = useState(false)
    const [customFunctionRcm, setCustomFunctionRcm] = useState('')
    const [customDepartmentRcm, setCustomDepartmentRcm] = useState('')

    const [isCustomFunctionAudit, setIsCustomFunctionAudit] = useState(false)
    const [isCustomDepartmentAudit, setIsCustomDepartmentAudit] = useState(false)
    const [customFunctionAudit, setCustomFunctionAudit] = useState('')
    const [customDepartmentAudit, setCustomDepartmentAudit] = useState('')

    // File upload state
    const [isUploading, setIsUploading] = useState(false)
    const [uploadedAttachments, setUploadedAttachments] = useState<{ url: string, title: string }[]>([])
    const [attachmentTitle, setAttachmentTitle] = useState('')

    // Edit states
    const [isEditingRcm, setIsEditingRcm] = useState(false)
    const [currentRcmId, setCurrentRcmId] = useState<string | null>(null)
    const [isEditingObs, setIsEditingObs] = useState(false)
    const [currentObsId, setCurrentObsId] = useState<string | null>(null)

    // Findings form state
    const [newObs, setNewObs] = useState<Partial<Observation>>({
        procedure_id: '',
        condition: '',
        criteria: '',
        cause: '',
        effect: '',
        recommendation: '',
        risk_rating: 'Low' as Database['public']['Enums']['risk_level'],
        title: '',
        audit_id: ''
    })
    const [aiInput, setAiInput] = useState('')
    const [rcmAiInput, setRcmAiInput] = useState('')
    const [isAIProcessing, setIsAIProcessing] = useState(false)
    const [isRcmAiProcessing, setIsRcmAiProcessing] = useState(false)

    // Fetch functions
    const fetchRefDocs = useCallback(async () => {
        try {
            const { data, error } = await (supabase as any)
                .from('reference_documents')
                .select('*')
                .order('created_at', { ascending: false })
            if (error) throw error
            setRefDocs(data as ReferenceDocument[] || [])
        } catch (err) {
            console.error('Error fetching reference docs:', err)
        }
    }, [])

    const fetchAuditPlanningData = useCallback(async () => {
        try {
            const { data: plans, error: planError } = await supabase.from('audit_plans').select('*').order('year', { ascending: false })
            if (planError) throw planError
            if (plans) setAuditPlans(plans as AuditPlan[])

            const { data: engs, error: engError } = await supabase
                .from('audits')
                .select(`
          *,
          industries(industry_name),
          functions(function_name),
          departments(department_name),
          profiles:assigned_auditor(full_name)
        `)
                .order('start_date', { ascending: false })

            if (engError) throw engError
            if (engs) setAudits(engs as unknown as AuditEngagement[])
        } catch (err) {
            console.error('Error fetching planning data:', err)
        }
    }, [])

    const fetchAuditors = useCallback(async () => {
        const { data } = await supabase.from('profiles').select('*').eq('role', 'auditor')
        if (data) setAuditors(data)
    }, [])

    const fetchRcmData = useCallback(async () => {
        const { data } = await (supabase as any)
            .from('risk_control_matrix')
            .select(`
        *,
        industries(industry_name),
        functions(function_name),
        departments(department_name),
        risk_categories(category_name),
        systems(system_name)
      `)
            .order('created_at', { ascending: false })
        if (data) setRcmEntries(data as RCMEntry[])
    }, [])

    const fetchSystems = useCallback(async () => {
        const { data } = await (supabase as any).from('systems').select('*').eq('is_active', true).order('system_name')
        if (data) setAllSystems(data)
    }, [])

    const fetchRcmContext = useCallback(async () => {
        try {
            const [ind, func, dept, cat] = await Promise.all([
                supabase.from('industries').select('*').order('industry_name'),
                supabase.from('functions').select('*').order('function_name'),
                supabase.from('departments').select('*').order('department_name'),
                supabase.from('risk_categories').select('*').order('category_name')
            ])

            let finalIndustries = ind.data || []
            let finalFunctions = func.data || []
            let finalDepartments = dept.data || []
            let finalCategories = cat.data || []

            // Ensure "Generic" entries exist
            let genInd = finalIndustries.find(i => i.industry_name === 'Generic')
            if (!genInd) {
                const { data } = await supabase.from('industries').insert({ industry_name: 'Generic' }).select().single()
                if (data) { genInd = data; finalIndustries = [data, ...finalIndustries] }
            }

            let genFunc = finalFunctions.find(f => f.function_name === 'Generic')
            if (!genFunc) {
                const { data } = await supabase.from('functions').insert({ function_name: 'Generic' }).select().single()
                if (data) { genFunc = data; finalFunctions = [data, ...finalFunctions] }
            }

            let genDept = null
            if (genFunc) {
                genDept = finalDepartments.find(d => d.department_name === 'Generic' && d.function_id === genFunc.function_id)
                if (!genDept) {
                    const { data } = await supabase.from('departments').insert({ department_name: 'Generic', function_id: genFunc.function_id }).select().single()
                    if (data) { genDept = data; finalDepartments = [data, ...finalDepartments] }
                }
            }

            let stratCat = finalCategories.find(c => c.category_name === 'Strategic')
            if (!stratCat) {
                const { data } = await supabase.from('risk_categories').insert({ category_name: 'Strategic' }).select().single()
                if (data) { stratCat = data; finalCategories = [data, ...finalCategories] }
            }

            setIndustries(finalIndustries)
            setAllFunctions(finalFunctions)
            setAllDepartments(finalDepartments)
            setRiskCats(finalCategories)

            // Also fetch systems
            fetchSystems()
        } catch (err) {
            console.error('Error fetching RCM context:', err)
        }
    }, [fetchSystems])

    const fetchNotifications = useCallback(async () => {
        if (!session) return
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
        if (data) setNotifications(data as Notification[])
    }, [session])

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)
        if (!error) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        }
    }

    const fetchProcedures = useCallback(async () => {
        const { data } = await supabase
            .from('audit_procedures')
            .select(`
        procedure_id,
        procedure_name,
        framework_mapping (
          framework_name,
          reference_code
        )
      `)
        if (data) setProcedures(data as unknown as AuditProcedure[])
    }, [])

    const fetchRiskRegister = useCallback(async () => {
        const { data } = await supabase
            .from('risk_register')
            .select(`
        *,
        risk_control_matrix (
          control_description,
          control_frequency
        ),
        risk_categories (
          category_name
        )
      `)
            .order('created_at', { ascending: false })
        if (data) setRiskRegisterEntries(data as unknown as RiskRegisterEntry[])
    }, [])

    const fetchAuditPrograms = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('audit_programs')
                .select(`
                    *,
                    audits (audit_title)
                `)
                .order('created_at', { ascending: false })
            if (error) throw error
            setAuditPrograms(data as unknown as AuditProgram[])
        } catch (err) {
            console.error('Error fetching audit programs:', err)
        }
    }, [])

    const fetchProgramDetails = async (programId: string) => {
        setIsProgramLoading(true)
        try {
            const { data, error } = await supabase
                .from('audit_programs')
                .select(`
                    *,
                    audits (audit_title),
                    tests:audit_program_tests (
                        *,
                        risk_register (*),
                        procedures:audit_program_procedures (*)
                    )
                `)
                .eq('id', programId)
                .single()
            if (error) throw error
            setSelectedProgram(data as unknown as AuditProgram)
        } catch (err) {
            console.error('Error fetching program details:', err)
        } finally {
            setIsProgramLoading(false)
        }
    }

    const createAuditProgram = async (auditId: string) => {
        try {
            const { data, error } = await supabase
                .from('audit_programs')
                .insert([{ audit_id: auditId, status: 'Draft' }])
                .select()
                .single()
            if (error) throw error
            fetchAuditPrograms()
            return data
        } catch (err: unknown) {
            alert('Error creating audit program: ' + (err as Error).message)
        }
    }

    const addTestToProgram = async (programId: string, riskId: string) => {
        try {
            const { error } = await supabase
                .from('audit_program_tests')
                .insert([{ program_id: programId, risk_register_id: riskId }])
            if (error) throw error

            // Trigger Rule 9 rollup for this risk
            const { data: newTest } = await supabase
                .from('audit_program_tests')
                .select('id')
                .eq('program_id', programId)
                .eq('risk_register_id', riskId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (newTest) {
                await updateProcedureStatus('', 'Pending', newTest.id); // Hack to trigger rollups
            } else {
                fetchProgramDetails(programId);
            }
        } catch (err: unknown) {
            alert('Error adding test: ' + (err as Error).message)
        }
    }

    const addProcedureToTest = async (testId: string, procedureName: string, description: string, evidenceRequirements: string) => {
        try {
            const { error } = await supabase
                .from('audit_program_procedures')
                .insert([{ test_id: testId, procedure_name: procedureName, description, evidence_requirements: evidenceRequirements }])
            if (error) throw error

            // Trigger Rule 8 rollup
            await updateProcedureStatus('', 'Pending', testId); // Pass empty ID to just trigger rollup
        } catch (err: unknown) {
            alert('Error adding procedure: ' + (err as Error).message)
        }
    }

    const updateProcedureStatus = async (procedureId: string, status: 'Pending' | 'Passed' | 'Failed', testId: string) => {
        try {
            // 1. Update Procedure (if ID provided)
            if (procedureId) {
                const { error: pError } = await supabase
                    .from('audit_program_procedures')
                    .update({ status })
                    .eq('id', procedureId)
                if (pError) throw pError
            }

            // 2. Fetch all procedures for this test to rollup Rule 8
            const { data: procedures, error: fetchError } = await supabase
                .from('audit_program_procedures')
                .select('status')
                .eq('test_id', testId)
            if (fetchError) throw fetchError

            // 3. Calculate Rule 8 rollup status
            let controlStatus: 'Implemented' | 'Partially Implemented' | 'Not Implemented' = 'Not Implemented'
            if (procedures && procedures.length > 0) {
                const passed = procedures.filter(p => p.status === 'Passed').length
                const failed = procedures.filter(p => p.status === 'Failed').length
                const total = procedures.length

                if (passed === total) {
                    controlStatus = 'Implemented'
                } else if (passed > 0 && failed > 0) {
                    controlStatus = 'Partially Implemented'
                } else if (failed === total) {
                    controlStatus = 'Not Implemented'
                } else if (passed > 0) {
                    controlStatus = 'Partially Implemented'
                } else {
                    controlStatus = 'Not Implemented'
                }
            }

            // 4. Update Test with new control status
            const { error: tError } = await supabase
                .from('audit_program_tests')
                .update({ control_status: controlStatus })
                .eq('id', testId)
            if (tError) throw tError

            // 5. Rule 9 Rollup: All tests in this program for the same risk title
            const { data: currentTest, error: ctError } = await supabase
                .from('audit_program_tests')
                .select(`
                    program_id,
                    risk_register (risk_title)
                `)
                .eq('id', testId)
                .single()
            if (ctError) throw ctError

            const riskTitle = (currentTest.risk_register as unknown as { risk_title: string })?.risk_title
            const programId = currentTest.program_id

            if (riskTitle && programId) {
                const { data: allProgramTests, error: aptError } = await supabase
                    .from('audit_program_tests')
                    .select(`
                        id,
                        control_status,
                        risk_register (risk_title)
                    `)
                    .eq('program_id', programId)
                if (aptError) throw aptError

                const riskSiblings = allProgramTests.filter((t: any) => (t as any).risk_register?.risk_title === riskTitle)

                // Rule 9 Calculation
                let riskStatus: 'Mitigated' | 'Partially Mitigated' | 'Not Mitigated' = 'Not Mitigated'
                const imp = riskSiblings.filter(t => t.control_status === 'Implemented').length
                const totalSiblings = riskSiblings.length

                if (imp === totalSiblings && totalSiblings > 0) {
                    riskStatus = 'Mitigated'
                } else if (imp > 0) {
                    riskStatus = 'Partially Mitigated'
                } else {
                    riskStatus = 'Not Mitigated'
                }

                // Update all sibling tests within THIS program that share the same risk title
                const siblingIds = riskSiblings.map(t => t.id)
                if (siblingIds.length > 0) {
                    const { error: updateRiskError } = await supabase
                        .from('audit_program_tests')
                        .update({ risk_status: riskStatus })
                        .in('id', siblingIds)
                    if (updateRiskError) throw updateRiskError
                }
            }

            if (selectedProgram) fetchProgramDetails(selectedProgram.id)
        } catch (err: unknown) {
            alert('Error updating status: ' + (err as Error).message)
        }
    }

    const fetchData = useCallback(async () => {
        try {
            setIsDataLoading(true)
            const { data, error } = await supabase
                .from('audit_observations')
                .select(`
          *,
          audit_procedures (
            procedure_name,
            framework_mapping (
              framework_name,
              reference_code,
              risk_categories (
                category_name
              )
            )
          ),
          management_responses (*)
        `)
                .order('created_at', { ascending: false })
            if (error) throw error
            if (data) {
                setObservations(data as unknown as Observation[])
                const summary = {
                    total: data.length,
                    critical: data.filter(o => (o as any).risk_rating === 'Critical').length,
                    high: data.filter(o => (o as any).risk_rating === 'High').length,
                    medium: data.filter(o => (o as any).risk_rating === 'Medium').length,
                    totalRisks: stats.totalRisks
                }
                setStats(summary)
            }
        } catch (err) {
            console.error('Error fetching data:', err)
        } finally {
            setIsDataLoading(false)
        }
    }, [stats.totalRisks])

    // AI Handlers
    const handleRcmAiGenerate = async () => {
        if (!rcmAiInput.trim()) return
        setIsRcmAiProcessing(true)
        try {
            const data = await invokeAiProcessRcm(rcmAiInput)
            setNewRcm(prev => ({
                ...prev,
                risk_title: data.risk_title || '',
                risk_description: data.risk_description,
                control_title: data.control_title || '',
                control_description: data.control_description,
                reference_standard: data.reference_standard
            }))
            setRcmAiInput('')
        } catch (err: unknown) {
            alert('Failed to generate RCM entry: ' + (err as Error).message)
        } finally {
            setIsRcmAiProcessing(false)
        }
    }

    const processWithAI = async () => {
        if (!aiInput.trim()) return
        setIsAIProcessing(true)
        try {
            const data = await invokeAiProcessAuditFinding(aiInput)
            if (data) {
                setNewObs(prev => ({
                    ...prev,
                    title: data.title || prev.title,
                    condition: data.condition || prev.condition,
                    criteria: data.criteria || prev.criteria,
                    cause: data.cause || prev.cause,
                    effect: data.effect || prev.effect,
                    recommendation: data.recommendation || prev.recommendation,
                    risk_rating: (['Low', 'Medium', 'High', 'Critical'].includes(data.risk_rating) ? data.risk_rating : 'Low') as Database['public']['Enums']['risk_level']
                }))
                setAiInput('')
                alert('AI has successfully structured your finding!')
            }
        } catch (err: any) {
            console.error('AI Error:', err)
            alert('AI Assistant is currently unavailable. Please fill in the details manually.')
        } finally {
            setIsAIProcessing(false)
        }
    }

    // Mutation Handlers
    const openEditRcmModal = (entry: RCMEntry) => {
        setNewRcm({
            industry_id: entry.industry_id || '',
            function_id: entry.function_id || '',
            department_id: entry.department_id || '',
            risk_category_id: entry.risk_category_id || '',
            risk_title: entry.risk_title || '',
            risk_description: entry.risk_description || '',
            control_title: entry.control_title || '',
            control_description: entry.control_description || '',
            reference_standard: entry.reference_standard || '',
            control_type: entry.control_type || 'Preventive',
            control_frequency: entry.control_frequency || 'Continuous',
            system_id: entry.system_id || ''
        })
        setIsEditingRcm(true)
        setCurrentRcmId(entry.rcm_id)
        setShowNewRcmModal(true)
    }

    const handleDeleteRcm = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this RCM entry?')) {
            const { error } = await supabase.from('risk_control_matrix').delete().eq('rcm_id', id)
            if (error) alert(error.message)
            else fetchRcmData()
        }
    }

    const openEditObsModal = (obs: Observation) => {
        setMgmtResp({
            management_response: obs.management_responses?.[0]?.management_response || '',
            action_plan: obs.management_responses?.[0]?.action_plan || '',
            responsible_person: obs.management_responses?.[0]?.responsible_person || '',
            target_date: obs.management_responses?.[0]?.target_date || '',
            status: obs.management_responses?.[0]?.status || 'Open'
        })
        setIsEditingObs(true)
        setCurrentObsId(obs.observation_id)
    }

    const handleDeleteObs = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this finding?')) {
            const { error } = await supabase.from('audit_observations').delete().eq('observation_id', id)
            if (error) alert(error.message)
            else fetchData()
        }
    }

    const handleCreateRcm = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            let finalFunctionId = newRcm.function_id
            let finalDepartmentId = newRcm.department_id

            if (isCustomFunctionRcm && customFunctionRcm) {
                const { data: fData, error: fError } = await supabase.from('functions').insert({ function_name: customFunctionRcm }).select().single()
                if (fError) throw fError
                finalFunctionId = fData.function_id
            }

            if (isCustomDepartmentRcm && customDepartmentRcm) {
                const { data: dData, error: dError } = await supabase.from('departments').insert({ department_name: customDepartmentRcm, function_id: finalFunctionId }).select().single()
                if (dError) throw dError
                finalDepartmentId = dData.department_id
            }

            const rcmPayload = {
                ...newRcm,
                function_id: finalFunctionId,
                department_id: finalDepartmentId,
                system_id: newRcm.system_id || null
            }

            if (isEditingRcm && currentRcmId) {
                const { error } = await supabase.from('risk_control_matrix').update(rcmPayload).eq('rcm_id', currentRcmId)
                if (error) throw error
            } else {
                const { error } = await supabase.from('risk_control_matrix').insert([rcmPayload])
                if (error) throw error
            }

            setShowNewRcmModal(false)
            setIsEditingRcm(false)
            setCurrentRcmId(null)
            setNewRcm({
                industry_id: '',
                function_id: '',
                department_id: '',
                risk_category_id: '',
                risk_title: '',
                risk_description: '',
                control_title: '',
                control_description: '',
                reference_standard: '',
                control_type: 'Preventive' as Database['public']['Enums']['control_type'],
                control_frequency: 'Continuous' as Database['public']['Enums']['control_frequency'],
                system_id: ''
            })
            fetchRcmData()
            fetchRcmContext()
        } catch (err: unknown) {
            alert((err as Error).message)
        }
    }

    const handleSaveRisk = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (isEditingRisk && currentRiskId) {
                const { error } = await supabase.from('risk_register' as any).update(newRiskEntry).eq('id', currentRiskId)
                if (error) throw error
            } else {
                const { error } = await supabase.from('risk_register' as any).insert([newRiskEntry])
                if (error) throw error
            }
            setShowNewRiskModal(false)
            setIsEditingRisk(false)
            setCurrentRiskId(null)
            fetchRiskRegister()
        } catch (err: unknown) {
            alert((err as Error).message)
        }
    }

    const handleDeleteRisk = async (id: string) => {
        if (window.confirm('Delete this risk assessment?')) {
            const { error } = await supabase.from('risk_register' as any).delete().eq('id', id)
            if (error) alert(error.message)
            else fetchRiskRegister()
        }
    }

    const handleMgmtSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentObsId) return
        setIsSubmitting(true)
        try {
            const { data: existing } = await supabase.from('management_responses').select('response_id').eq('observation_id', currentObsId).single()
            if (existing) {
                const { error } = await supabase.from('management_responses').update(mgmtResp).eq('response_id', existing.response_id)
                if (error) throw error
            } else {
                const { error } = await supabase.from('management_responses').insert([{ ...mgmtResp, observation_id: currentObsId }])
                if (error) throw error
            }
            setIsEditingObs(false)
            setCurrentObsId(null)
            fetchData()
        } catch (err: any) {
            alert(err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleRefUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setIsRefUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const { error: uploadError } = await supabase.storage.from('reference-docs').upload(fileName, file)
            if (uploadError) throw uploadError

            const { data: urlData } = supabase.storage.from('reference-docs').getPublicUrl(fileName)
            const { error: dbError } = await (supabase as any).from('reference_documents').insert({
                title: newRefDoc.title || file.name,
                category: newRefDoc.category,
                file_url: urlData.publicUrl
            })
            if (dbError) throw dbError
            fetchRefDocs()
            setShowRefUploadModal(false)
            setNewRefDoc({ title: '', category: 'Standard' })
        } catch (err: any) {
            alert(err.message)
        } finally {
            setIsRefUploading(false)
        }
    }

    const handleDeleteRef = async (doc: ReferenceDocument) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                const fileName = doc.file_url.split('/').pop()
                if (fileName) await supabase.storage.from('reference-docs').remove([fileName])
                const { error } = await (supabase as any).from('reference_documents').delete().eq('doc_id', doc.doc_id)
                if (error) throw error
                fetchRefDocs()
            } catch (err: any) {
                alert(err.message)
            }
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return
        setIsUploading(true)
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                const fileExt = file.name.split('.').pop()
                const fileName = `${Math.random()}.${fileExt}`
                const { error: uploadError } = await supabase.storage.from('audit-evidence').upload(fileName, file)
                if (uploadError) throw uploadError
                const { data: { publicUrl } } = supabase.storage.from('audit-evidence').getPublicUrl(fileName)
                setUploadedAttachments(prev => [...prev, { url: publicUrl, title: attachmentTitle || file.name }])
            }
            setAttachmentTitle('')
        } catch (err: any) {
            alert('Error uploading file: ' + err.message)
        } finally {
            setIsUploading(false)
        }
    }

    const handleDownloadCSV = (filteredObservations: Observation[]) => {
        downloadCSV(filteredObservations)
    }

    const handleDownloadRiskRegisterCSV = (entries: RiskRegisterEntry[]) => {
        downloadRiskRegisterCSV(entries)
    }

    const handleGeneratePDF = (filteredObservations: Observation[], stats: { total: number; critical: number; high: number; medium: number }, profile: Profile | null, email?: string) => {
        generatePDF(filteredObservations, profile, stats, email)
    }

    const handleGenerateDetailedPDF = (obs: Observation, profile: Profile | null, email?: string) => {
        generateDetailedPDF(obs, profile, email)
    }

    const handleGenerateRiskRegisterPDF = (entries: RiskRegisterEntry[], profile: Profile | null, fiscalYear: string, email?: string) => {
        generateRiskRegisterPDF(entries, profile, fiscalYear, email)
    }

    const toggleDepartmentStatus = async (dept: Dept) => {
        const newStatus = dept.is_active === false ? true : false
        const { error } = await supabase
            .from('departments')
            .update({ is_active: newStatus })
            .eq('department_id', dept.department_id)

        if (error) {
            alert('Error updating status')
        } else {
            setAllDepartments(prev => prev.map(d => d.department_id === dept.department_id ? { ...d, is_active: newStatus } : d))
        }
    }

    useEffect(() => {
        setStats(prev => ({ ...prev, totalRisks: riskRegisterEntries.length }))
    }, [riskRegisterEntries])

    useEffect(() => {
        if (session) {
            fetchData()
            fetchProcedures()
            fetchNotifications()
            fetchRcmData()
            fetchRcmContext()
            fetchAuditPlanningData()
            fetchAuditors()
            fetchRefDocs()
            fetchRiskRegister()
            fetchAuditPrograms()

            const channel = supabase
                .channel('realtime_notifications')
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${session.user.id}` },
                    (payload) => {
                        setNotifications(prev => [payload.new as Notification, ...prev])
                    }
                )
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }
    }, [
        session, fetchData, fetchProcedures, fetchNotifications, fetchRcmData,
        fetchRcmContext, fetchAuditPlanningData, fetchAuditors, fetchRefDocs,
        fetchRiskRegister, fetchAuditPrograms
    ])

    const toggleIssueObservation = async (testId: string, issue: boolean) => {
        try {
            const { error } = await supabase
                .from('audit_program_tests')
                .update({ issue_observation: issue })
                .eq('id', testId)
            if (error) throw error

            if (selectedProgram) fetchProgramDetails(selectedProgram.id)
            return true
        } catch (err: unknown) {
            alert('Error updating observation toggle: ' + (err as Error).message)
            return false
        }
    }

    return {
        isDataLoading,
        observations,
        procedures,
        stats,
        notifications,
        showNotifications,
        setShowNotifications,
        rcmEntries,
        industries,
        allFunctions,
        allDepartments,
        riskCats,
        allSystems,
        rcmFilters,
        setRcmFilters,
        showNewRcmModal,
        setShowNewRcmModal,
        refDocs,
        refFilters,
        setRefFilters,
        riskRegisterEntries,
        riskRegisterFilters,
        setRiskRegisterFilters,
        showNewRiskModal,
        setShowNewRiskModal,
        isEditingRisk,
        setIsEditingRisk,
        currentRiskId,
        setCurrentRiskId,
        newRiskEntry,
        setNewRiskEntry,
        isRefUploading,
        setIsRefUploading,
        showRefUploadModal,
        setShowRefUploadModal,
        newRefDoc,
        setNewRefDoc,
        newRcm,
        setNewRcm,
        auditPlans,
        audits,
        selectedPlanId,
        setSelectedPlanId,
        isTemplateUploading,
        setIsTemplateUploading,
        showNewPlanModal,
        setShowNewPlanModal,
        showNewAuditModal,
        setShowNewAuditModal,
        newPlan,
        setNewPlan,
        newAudit,
        setNewAudit,
        auditors,
        mgmtResp,
        setMgmtResp,
        isSubmitting,
        setIsSubmitting,
        isCustomFunctionRcm,
        setIsCustomFunctionRcm,
        isCustomDepartmentRcm,
        setIsCustomDepartmentRcm,
        customFunctionRcm,
        setCustomFunctionRcm,
        customDepartmentRcm,
        setCustomDepartmentRcm,
        isCustomFunctionAudit,
        setIsCustomFunctionAudit,
        isCustomDepartmentAudit,
        setIsCustomDepartmentAudit,
        customFunctionAudit,
        setCustomFunctionAudit,
        customDepartmentAudit,
        setCustomDepartmentAudit,
        isUploading,
        uploadedAttachments,
        setUploadedAttachments,
        attachmentTitle,
        setAttachmentTitle,
        isEditingRcm,
        isEditingObs,
        currentRcmId,
        currentObsId,
        newObs,
        setNewObs,
        aiInput,
        setAiInput,
        rcmAiInput,
        setRcmAiInput,
        isAIProcessing,
        isRcmAiProcessing,
        auditPrograms,
        selectedProgram,
        setSelectedProgram,
        isProgramLoading,
        fetchData,
        fetchProcedures,
        fetchNotifications,
        markAsRead,
        fetchRcmData,
        fetchRcmContext,
        fetchAuditPlanningData,
        fetchAuditors,
        fetchRefDocs,
        fetchRiskRegister,
        fetchAuditPrograms,
        fetchProgramDetails,
        createAuditProgram,
        addTestToProgram,
        addProcedureToTest,
        updateProcedureStatus,
        toggleIssueObservation,
        handleRcmAiGenerate,
        processWithAI,
        openEditRcmModal,
        handleDeleteRcm,
        openEditObsModal,
        handleDeleteObs,
        handleCreateRcm,
        handleSaveRisk,
        handleDeleteRisk,
        handleMgmtSubmit,
        handleRefUpload,
        handleDeleteRef,
        handleFileUpload,
        handleDownloadCSV,
        handleDownloadRiskRegisterCSV,
        handleGeneratePDF,
        handleGenerateDetailedPDF,
        handleGenerateRiskRegisterPDF,
        toggleDepartmentStatus,
        setAllDepartments,
        setAllFunctions,
        setIndustries,
        setAllSystems,
        setObservations,
        setNotifications,
        setAuditPlans,
        setAudits,
        setIsEditingObs,
        setCurrentObsId,
        setIsEditingRcm,
        setCurrentRcmId
    }
}
