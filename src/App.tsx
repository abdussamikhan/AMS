import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { Database } from './types/supabase'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  LayoutDashboard,
  ShieldAlert,
  CheckCircle2,
  BarChart3,
  Search,
  ChevronRight,
  ClipboardList,
  Plus,
  Download,
  Activity,
  Send,
  CheckCircle,
  LogOut,
  Mail,
  Lock,
  User as UserIcon,
  X,
  Target,
  Calendar,
  Upload,
  FileText,
  ExternalLink,
  Bell,
  Clock,
  Sparkles,
  Wand2,
  Grid
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

type Profile = Database['public']['Tables']['profiles']['Row']
type Notification = Database['public']['Tables']['notifications']['Row']

type Observation = Database['public']['Tables']['audit_observations']['Row'] & {
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

type RCMEntry = Database['public']['Tables']['risk_control_matrix']['Row'] & {
  industries?: { industry_name: string }
  sectors?: { sector_name: string }
  functions?: { function_name: string }
  risk_categories?: { category_name: string }
}

function App() {
  const [isAppLoading, setIsAppLoading] = useState(true)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authFullName, setAuthFullName] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedAttachments, setUploadedAttachments] = useState<{ url: string, title: string }[]>([])
  const [attachmentTitle, setAttachmentTitle] = useState('')
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [selectedRole, setSelectedRole] = useState<'auditor' | 'manager' | 'client'>('manager')
  const [observations, setObservations] = useState<Observation[]>([])
  const [activeView, setActiveView] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedObs, setSelectedObs] = useState<Observation | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [procedures, setProcedures] = useState<any[]>([])
  const [newObs, setNewObs] = useState({
    procedure_id: '',
    condition: '',
    criteria: '',
    cause: '',
    effect: '',
    recommendation: '',
    risk_rating: 'Low' as Database['public']['Enums']['risk_level'],
    title: ''
  })
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0
  })
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  const [aiInput, setAiInput] = useState('')
  const [rcmAiInput, setRcmAiInput] = useState('')
  const [isAIProcessing, setIsAIProcessing] = useState(false)
  const [isRcmAiProcessing, setIsRcmAiProcessing] = useState(false)

  // RCM State
  const [rcmEntries, setRcmEntries] = useState<RCMEntry[]>([])
  const [industries, setIndustries] = useState<any[]>([])
  const [allSectors, setAllSectors] = useState<any[]>([])
  const [allFunctions, setAllFunctions] = useState<any[]>([])
  const [riskCats, setRiskCats] = useState<any[]>([])
  const [rcmFilters, setRcmFilters] = useState({ industry: '', sector: '', function: '' })
  const [showNewRcmModal, setShowNewRcmModal] = useState(false)
  const [newRcm, setNewRcm] = useState({
    industry_id: '',
    sector_id: '',
    function_id: '',
    risk_category_id: '',
    risk_description: '',
    control_description: '',
    reference_standard: '',
    control_type: 'Preventive' as any,
    control_frequency: 'Continuous' as any
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      setIsAppLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        fetchProfile(session.user.id)
        fetchRcmData()
        fetchRcmContext()
      }
      else setProfile(null)
      setIsAppLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchRcmData() {
    const { data } = await supabase
      .from('risk_control_matrix')
      .select(`
        *,
        industries(industry_name),
        sectors(sector_name),
        functions(function_name),
        risk_categories(category_name)
      `)
      .order('created_at', { ascending: false })
    if (data) setRcmEntries(data as RCMEntry[])
  }

  async function fetchRcmContext() {
    try {
      const [ind, sec, func, cat] = await Promise.all([
        supabase.from('industries').select('*').order('industry_name'),
        supabase.from('sectors').select('*').order('sector_name'),
        supabase.from('functions').select('*').order('function_name'),
        supabase.from('risk_categories').select('*').order('category_name')
      ])

      let finalIndustries = ind.data || []
      let finalSectors = sec.data || []
      let finalFunctions = func.data || []
      let finalCategories = cat.data || []

      // Ensure "Generic" entries exist
      let genInd = finalIndustries.find(i => i.industry_name === 'Generic')
      if (!genInd) {
        const { data } = await supabase.from('industries').insert({ industry_name: 'Generic' }).select().single()
        if (data) { genInd = data; finalIndustries = [data, ...finalIndustries] }
      }

      let genSec = null
      if (genInd) {
        genSec = finalSectors.find(s => s.sector_name === 'Generic' && s.industry_id === genInd.industry_id)
        if (!genSec) {
          const { data } = await supabase.from('sectors').insert({ sector_name: 'Generic', industry_id: genInd.industry_id }).select().single()
          if (data) { genSec = data; finalSectors = [data, ...finalSectors] }
        }
      }

      let genFunc = null
      if (genSec) {
        genFunc = finalFunctions.find(f => f.function_name === 'Generic' && f.sector_id === genSec.sector_id)
        if (!genFunc) {
          const { data } = await supabase.from('functions').insert({ function_name: 'Generic', sector_id: genSec.sector_id }).select().single()
          if (data) { genFunc = data; finalFunctions = [data, ...finalFunctions] }
        }
      }

      // Ensure "Strategic" risk category exists
      let stratCat = finalCategories.find(c => c.category_name === 'Strategic')
      if (!stratCat) {
        const { data } = await supabase.from('risk_categories').insert({ category_name: 'Strategic' }).select().single()
        if (data) { stratCat = data; finalCategories = [data, ...finalCategories] }
      }

      setIndustries(finalIndustries)
      setAllSectors(finalSectors)
      setAllFunctions(finalFunctions)
      setRiskCats(finalCategories)

      // Set defaults for new entry and filters
      if (genInd && genSec && genFunc && stratCat) {
        setNewRcm(prev => ({
          ...prev,
          industry_id: genInd.industry_id,
          sector_id: genSec.sector_id,
          function_id: genFunc.function_id,
          risk_category_id: stratCat.risk_id
        }))
        setRcmFilters({
          industry: genInd.industry_id,
          sector: genSec.sector_id,
          function: genFunc.function_id
        })
      }
    } catch (err) {
      console.error('Error fetching RCM context:', err)
    }
  }

  const handleCreateRcm = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('risk_control_matrix').insert([newRcm])
    if (error) {
      alert('Error creating RCM entry: ' + error.message)
    } else {
      setShowNewRcmModal(false)
      fetchRcmData()
      setNewRcm({
        industry_id: industries.find(i => i.industry_name === 'Generic')?.industry_id || '',
        sector_id: allSectors.find(s => s.sector_name === 'Generic')?.sector_id || '',
        function_id: allFunctions.find(f => f.function_name === 'Generic')?.function_id || '',
        risk_category_id: riskCats.find(c => c.category_name === 'Strategic')?.risk_id || '',
        risk_description: '',
        control_description: '',
        reference_standard: '',
        control_type: 'Preventive',
        control_frequency: 'Continuous'
      })
    }
  }

  const handleRcmAiGenerate = async () => {
    if (!rcmAiInput.trim()) return
    setIsRcmAiProcessing(true)
    try {
      const { data, error } = await supabase.functions.invoke('process-rcm-entry', {
        body: { rawText: rcmAiInput }
      })
      if (error) throw error
      setNewRcm(prev => ({
        ...prev,
        risk_description: data.risk_description,
        control_description: data.control_description,
        reference_standard: data.reference_standard
      }))
      setRcmAiInput('')
    } catch (err: any) {
      alert('Failed to generate RCM entry: ' + err.message)
    } finally {
      setIsRcmAiProcessing(false)
    }
  }

  async function fetchProfile(uid: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single()
    if (data) setProfile(data)
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAuthLoading(true)
    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: {
              role: selectedRole,
              full_name: authFullName
            }
          }
        })
        if (error) throw error
        alert('Confirmation email sent! Please check your inbox (and spam).')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsAuthLoading(false)
    }
  }

  const processWithAI = async () => {
    if (!aiInput.trim()) return
    setIsAIProcessing(true)
    try {
      const { data, error } = await supabase.functions.invoke('process-audit-finding', {
        body: { rawText: aiInput }
      })

      if (error) throw error

      if (data) {
        setNewObs(prev => ({
          ...prev,
          title: data.title || prev.title,
          condition: data.condition || prev.condition,
          criteria: data.criteria || prev.criteria,
          cause: data.cause || prev.cause,
          effect: data.effect || prev.effect,
          recommendation: data.recommendation || prev.recommendation,
          risk_rating: (['Low', 'Medium', 'High', 'Critical'].includes(data.risk_rating) ? data.risk_rating : 'Low') as any
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setActiveView('overview')
    setRcmEntries([])
    setProfile(null)
  }

  // Management response form state
  const [mgmtResp, setMgmtResp] = useState({
    management_response: '',
    action_plan: '',
    responsible_person: '',
    target_date: '',
    status: 'Open'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (session) {
      fetchData()
      fetchProcedures()
      fetchNotifications()

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
  }, [session])

  async function fetchNotifications() {
    if (!session) return
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    if (data) setNotifications(data)
  }

  async function markAsRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)

    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    }
  }

  async function fetchProcedures() {
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
    if (data) setProcedures(data)
  }

  async function fetchData() {
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

      const formattedData = data as any[]
      setObservations(formattedData)

      const counts = formattedData.reduce((acc, curr) => {
        const rating = curr.risk_rating.toLowerCase()
        acc[rating] = (acc[rating] || 0) + 1
        return acc
      }, { critical: 0, high: 0, medium: 0, total: formattedData.length })

      setStats({
        total: formattedData.length,
        critical: counts.critical,
        high: counts.high,
        medium: counts.medium
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsDataLoading(false)
    }
  }


  const filteredObservations = observations.filter(obs => {
    const searchLower = searchQuery.toLowerCase()
    return (
      obs.condition.toLowerCase().includes(searchLower) ||
      obs.criteria.toLowerCase().includes(searchLower) ||
      obs.audit_procedures?.procedure_name.toLowerCase().includes(searchLower) ||
      obs.audit_procedures?.framework_mapping?.framework_name.toLowerCase().includes(searchLower) ||
      obs.audit_procedures?.framework_mapping?.reference_code.toLowerCase().includes(searchLower) ||
      obs.audit_procedures?.framework_mapping?.risk_categories?.category_name.toLowerCase().includes(searchLower)
    )
  })

  const downloadCSV = () => {
    const headers = ["Condition", "Criteria", "Cause", "Effect", "Recommendation", "Rating", "Framework", "Reference", "Category"]
    const rows = filteredObservations.map(obs => [
      `"${obs.condition.replace(/"/g, '""')}"`,
      `"${obs.criteria.replace(/"/g, '""')}"`,
      `"${(obs.cause || "").replace(/"/g, '""')}"`,
      `"${(obs.effect || "").replace(/"/g, '""')}"`,
      `"${(obs.recommendation || "").replace(/"/g, '""')}"`,
      obs.risk_rating,
      obs.audit_procedures?.framework_mapping?.framework_name,
      obs.audit_procedures?.framework_mapping?.reference_code,
      obs.audit_procedures?.framework_mapping?.risk_categories?.category_name
    ])

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `AMS_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const generatePDF = () => {
    const doc = new jsPDF('landscape') // Landscape orientation
    const timestamp = new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0]

    // Title & Header
    doc.setFontSize(22)
    doc.setTextColor(41, 128, 185) // Professional Blue
    doc.text('Audit Management System', 14, 22)
    doc.setFontSize(14)
    doc.setTextColor(100)
    doc.text('Internal Audit Findings Report', 14, 30)

    // Meta Info
    doc.setFontSize(10)
    doc.text(`Generated: ${timestamp}`, 14, 38)
    doc.text(`User: ${profile?.full_name || session.user.email}`, 14, 43)

    // Summary Box
    doc.setDrawColor(200)
    doc.setFillColor(245, 247, 250)
    doc.rect(14, 50, 260, 25, 'F') // Wider for landscape
    doc.setTextColor(0)
    doc.setFontSize(11)
    doc.text('SUMMARY STATISTICS', 20, 58)
    doc.setFontSize(10)
    doc.text(`Total Findings: ${stats.total}  |  Critical: ${stats.critical}  |  High: ${stats.high}  |  Medium: ${stats.medium}`, 20, 68)

    // Findings Table
    const tableRows = filteredObservations.map((obs, index) => [
      index + 1,
      `${obs.audit_procedures?.framework_mapping?.framework_name} / ${obs.audit_procedures?.framework_mapping?.reference_code}`,
      obs.title || obs.condition.substring(0, 40) + '...',
      obs.condition.substring(0, 80) + (obs.condition.length > 80 ? '...' : ''),
      obs.risk_rating,
      obs.management_responses?.[0]?.status || 'Open',
      new Date(obs.created_at).toISOString().split('T')[0]
    ])

    autoTable(doc, {
      startY: 85,
      head: [['#', 'Reference', 'Title', 'Finding (Condition)', 'Risk', 'Status', 'Created']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 38 },
        2: { cellWidth: 50 },
        3: { cellWidth: 90 },
        4: { cellWidth: 18 },
        5: { cellWidth: 18 },
        6: { cellWidth: 22 }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
          const rating = data.cell.raw as string
          if (rating === 'Critical') data.cell.styles.textColor = [239, 68, 68]
          if (rating === 'High') data.cell.styles.textColor = [248, 113, 113]
        }
      }
    })

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(`Page ${i} of ${pageCount} - Confidential AMS Internal Report`, 14, 200) // Adjusted for landscape
    }

    doc.save(`AMS_Audit_Report_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const generateDetailedPDF = (obs: Observation) => {
    const doc = new jsPDF()
    const timestamp = new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0]

    // Title & Header
    doc.setFontSize(22)
    doc.setTextColor(41, 128, 185)
    doc.text('AMS: Detailed Finding Report', 14, 22)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generated: ${timestamp}`, 14, 30)
    doc.text(`User: ${profile?.full_name || session.user.email}`, 14, 35)

    // Finding Overview Box
    doc.setDrawColor(41, 128, 185)
    doc.setLineWidth(0.5)
    doc.line(14, 40, 196, 40)

    // Section 1: Overview
    doc.setFontSize(14)
    doc.setTextColor(0)
    doc.setFont('helvetica', 'bold')
    doc.text('1. OVERVIEW', 14, 50)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Reference: ${obs.audit_procedures?.framework_mapping?.framework_name} / ${obs.audit_procedures?.framework_mapping?.reference_code}`, 14, 58)
    doc.text(`Procedure: ${obs.audit_procedures?.procedure_name}`, 14, 63)
    doc.text(`Category: ${obs.audit_procedures?.framework_mapping?.risk_categories?.category_name}`, 14, 68)

    // Title (Summary)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0)
    doc.text('Title:', 14, 76)
    doc.setFont('helvetica', 'normal')
    const titleText = obs.title || obs.condition.substring(0, 80)
    doc.text(titleText, 14, 82, { maxWidth: 180 })

    // Risk Badge
    const rating = obs.risk_rating
    doc.setFillColor(rating === 'Critical' ? 239 : rating === 'High' ? 248 : 251, rating === 'Critical' ? 68 : rating === 'High' ? 113 : 191, rating === 'Critical' ? 68 : rating === 'High' ? 113 : 36)
    doc.rect(150, 50, 45, 10, 'F')
    doc.setTextColor(255)
    doc.setFont('helvetica', 'bold')
    doc.text(`RISK: ${rating.toUpperCase()}`, 154, 56)

    // Section 2: Finding Details
    doc.setTextColor(41, 128, 185)
    doc.setFontSize(14)
    doc.text('2. FINDING DETAILS (5C MODEL)', 14, 95)

    autoTable(doc, {
      startY: 100,
      body: [
        ['CONDITION', obs.condition],
        ['CRITERIA', obs.criteria],
        ['CAUSE', obs.cause || 'Not specified'],
        ['EFFECT', obs.effect || 'Not specified'],
        ['RECOMMENDATION', obs.recommendation || 'Not specified']
      ],
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold', fillColor: [245, 247, 250] },
        1: { cellWidth: 142 }
      }
    })

    // Section 3: Management Action Plan
    const finalY = (doc as any).lastAutoTable.finalY + 15
    doc.setFontSize(14)
    doc.setTextColor(41, 128, 185)
    doc.text('3. MANAGEMENT ACTION PLAN', 14, finalY)

    if (obs.management_responses && obs.management_responses.length > 0) {
      const resp = obs.management_responses[0]
      autoTable(doc, {
        startY: finalY + 5,
        body: [
          ['RESPONSE', resp.management_response],
          ['ACTION PLAN', resp.action_plan],
          ['RESPONSIBLE', resp.responsible_person],
          ['TARGET DATE', resp.target_date],
          ['STATUS', resp.status]
        ],
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: {
          0: { cellWidth: 40, fontStyle: 'bold', textColor: [100, 100, 100] },
          1: { cellWidth: 142 }
        }
      })
    } else {
      doc.setFontSize(10)
      doc.setTextColor(150)
      doc.setFont('helvetica', 'italic')
      doc.text('Pending management response...', 14, finalY + 10)
    }

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(`Page ${i} of ${pageCount} - AMS Detailed Audit Report - ${obs.observation_id}`, 14, 285)
    }

    doc.save(`AMS_Detailed_Finding_${obs.observation_id.slice(0, 8)}.pdf`)
  }

  const handleMgmtSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedObs) return

    try {
      setIsSubmitting(true)
      const { error } = await supabase
        .from('management_responses')
        .insert([{
          ...mgmtResp,
          observation_id: selectedObs.observation_id
        }])

      if (error) throw error

      setMgmtResp({
        management_response: '',
        action_plan: '',
        responsible_person: '',
        target_date: '',
        status: 'Open'
      })
      await fetchData()
      // Refresh selected observation state to show the new response
      const updatedObs = (await supabase
        .from('audit_observations')
        .select('*, audit_procedures(*, framework_mapping(*, risk_categories(*))), management_responses(*)')
        .eq('observation_id', selectedObs.observation_id)
        .single()).data
      setSelectedObs(updatedObs as any)

    } catch (err: any) {
      alert('Error submitting response: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const chartData = observations.reduce((acc: any[], obs) => {
    const categoryName = obs.audit_procedures?.framework_mapping?.risk_categories?.category_name || 'Uncategorized'
    let cat = acc.find(c => c.name === categoryName)
    if (!cat) {
      cat = { name: categoryName, Critical: 0, High: 0, Medium: 0, Low: 0 }
      acc.push(cat)
    }
    cat[obs.risk_rating] = (cat[obs.risk_rating] || 0) + 1
    return acc
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    if (!attachmentTitle.trim()) {
      alert('Please enter a title for the attachment first.')
      return
    }

    setIsUploading(true)
    const newAttachments = [...uploadedAttachments]

    for (const file of Array.from(files)) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${session.user.id}/${fileName}`

      const { error } = await supabase.storage
        .from('audit-evidence')
        .upload(filePath, file)

      if (error) {
        alert('Error uploading file: ' + error.message)
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('audit-evidence')
          .getPublicUrl(filePath)
        newAttachments.push({ url: publicUrl, title: attachmentTitle })
      }
    }

    setUploadedAttachments(newAttachments)
    setAttachmentTitle('') // Clear title after upload
    setIsUploading(false)
  }

  const getRatingBadge = (rating: string) => {
    const r = rating.toLowerCase()
    return <span className={`badge badge-${r}`}>{rating}</span>
  }

  if (isAppLoading) {
    return (
      <div className="auth-container">
        <div style={{ textAlign: 'center' }}>
          <div className="logo" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>AMS Dashboard</div>
          <div style={{ color: 'var(--text-secondary)' }}>Initializing Secure Session...</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="auth-container">
        <div className="auth-card fade-in">
          <div className="auth-header">
            <div className="logo" style={{ marginBottom: '0.5rem' }}>AMS Dashboard</div>
            <h2>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              {authMode === 'login' ? 'Enter your credentials to access the system' : 'Sign up to start managing audit findings'}
            </p>
          </div>
          <form className="auth-form" onSubmit={handleAuth}>
            {authMode === 'signup' && (
              <>
                <div className="detail-item">
                  <label className="detail-label">Full Name / Display Name</label>
                  <div style={{ position: 'relative' }}>
                    <UserIcon size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                      type="text"
                      className="form-control"
                      style={{ paddingLeft: '40px' }}
                      placeholder="John Doe"
                      value={authFullName}
                      onChange={e => setAuthFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="detail-item">
                  <label className="detail-label">I am an:</label>
                  <div className="role-selector">
                    <button
                      type="button"
                      className={`role-btn ${selectedRole === 'manager' ? 'active' : ''}`}
                      onClick={() => setSelectedRole('manager')}
                    >
                      Manager
                    </button>
                    <button
                      type="button"
                      className={`role-btn ${selectedRole === 'auditor' ? 'active' : ''}`}
                      onClick={() => setSelectedRole('auditor')}
                    >
                      Auditor
                    </button>
                    <button
                      type="button"
                      className={`role-btn ${selectedRole === 'client' ? 'active' : ''}`}
                      onClick={() => setSelectedRole('client')}
                    >
                      Client
                    </button>
                  </div>
                </div>
              </>
            )}
            <div className="detail-item">
              <label className="detail-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                  placeholder="name@company.com"
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="detail-item">
              <label className="detail-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="auth-button" disabled={isAuthLoading}>
              {isAuthLoading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Sign Up')}
            </button>
          </form>
          <div className="auth-footer">
            {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
            <span className="auth-link" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>
              {authMode === 'login' ? 'Sign Up' : 'Sign In'}
            </span>
          </div>
        </div>
      </div >
    )
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">AMS Dashboard</div>
        <nav className="nav-links">
          <div
            className={`nav-link ${activeView === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveView('overview')}
          >
            <LayoutDashboard />
            Overview
          </div>
          <div
            className={`nav-link ${activeView === 'findings' ? 'active' : ''}`}
            onClick={() => setActiveView('findings')}
          >
            <CheckCircle2 />
            Control Findings
          </div>
          <div
            className={`nav-link ${activeView === 'rcm' ? 'active' : ''}`}
            onClick={() => setActiveView('rcm')}
          >
            <Grid />
            Risk Control Matrix
          </div>
          <div className="nav-link">
            <ShieldAlert />
            Risk Register
          </div>
          <div className="nav-link">
            <ClipboardList />
            Audit Plans
          </div>
          <div className="nav-link">
            <BarChart3 />
            Reporting
          </div>
        </nav>

        <div className="logout-container">
          <div className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '0 1rem' }}>
            <div style={{ fontWeight: '600', color: '#fff' }}>{profile?.full_name || session.user.email}</div>
            <div style={{ textTransform: 'capitalize' }}>{profile?.role || 'User'}</div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="header" style={{ marginBottom: activeView === 'findings' ? '2rem' : '3rem' }}>
          <div>
            <h1>{activeView === 'overview' ? 'Audit Overview' : activeView === 'rcm' ? 'Risk Control Matrix' : 'Control Findings'}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {activeView === 'overview'
                ? 'High-level risk distribution and analytics'
                : activeView === 'rcm'
                  ? 'Map risks to internal controls across the organization'
                  : 'Detailed list of organizational audit observations'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={24} color={showNotifications ? 'var(--accent-blue)' : 'var(--text-secondary)'} />
              {notifications.filter(n => !n.is_read).length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: 'var(--error)',
                  color: '#fff',
                  fontSize: '0.65rem',
                  padding: '2px 5px',
                  borderRadius: '10px',
                  fontWeight: '700',
                  border: '2px solid #1a1f26'
                }}>
                  {notifications.filter(n => !n.is_read).length}
                </span>
              )}

              {/* Notification Drawer */}
              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  top: '40px',
                  right: '0',
                  width: '320px',
                  maxHeight: '450px',
                  background: '#1a1f26',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.75rem',
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
                  zIndex: 1000,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }} onClick={e => e.stopPropagation()}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700' }}>Notifications</span>
                    <span
                      style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', cursor: 'pointer' }}
                      onClick={async () => {
                        const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', session.user.id);
                        if (!error) setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                      }}
                    >
                      Mark all as read
                    </span>
                  </div>
                  <div style={{ overflowY: 'auto', flex: 1 }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          style={{
                            padding: '1rem',
                            borderBottom: '1px solid var(--border-color)',
                            background: n.is_read ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                            cursor: 'pointer',
                            display: 'flex',
                            gap: '0.75rem'
                          }}>
                          <div style={{
                            width: '8px', height: '8px', borderRadius: '50%', background: n.is_read ? 'transparent' : 'var(--accent-blue)', marginTop: '6px'
                          }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', fontSize: '0.875rem', color: n.is_read ? 'var(--text-secondary)' : '#fff' }}>{n.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{n.message}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Clock size={10} /> {new Date(n.created_at).toISOString().split('T')[1].substring(0, 5)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {activeView === 'findings' && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{
                  background: 'var(--glass-bg)',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  border: '1px solid var(--border-color)'
                }}>
                  <Search size={18} color="var(--text-secondary)" />
                  <input
                    type="text"
                    placeholder="Search findings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ background: 'none', border: 'none', color: '#fff', outline: 'none', width: '200px' }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0 4px' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                {(profile?.role === 'auditor' || profile?.role === 'manager') && (
                  <button
                    onClick={() => setShowNewModal(true)}
                    style={{
                      background: 'var(--accent-blue)',
                      color: '#fff',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    <Plus size={18} />
                    New Finding
                  </button>
                )}
                <button
                  onClick={downloadCSV}
                  style={{
                    background: 'var(--glass-bg)',
                    color: '#fff',
                    border: '1px solid var(--border-color)',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  <Download size={18} />
                  Export CSV
                </button>
                <button
                  onClick={generatePDF}
                  style={{
                    background: 'var(--accent-blue)',
                    color: '#fff',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  <FileText size={18} />
                  Export PDF
                </button>
              </div>
            )}
          </div>
        </header>

        {activeView === 'overview' ? (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Findings</div>
                <div className="stat-value">{stats.total}</div>
              </div>
              <div className="stat-card" style={{ borderLeft: '4px solid var(--critical)' }}>
                <div className="stat-label">Critical Risks</div>
                <div className="stat-value" style={{ color: 'var(--error)' }}>{stats.critical}</div>
              </div>
              <div className="stat-card" style={{ borderLeft: '4px solid var(--error)' }}>
                <div className="stat-label">High Risks</div>
                <div className="stat-value" style={{ color: '#fca5a5' }}>{stats.high}</div>
              </div>
              <div className="stat-card" style={{ borderLeft: '4px solid var(--warning)' }}>
                <div className="stat-label">Medium Risks</div>
                <div className="stat-value" style={{ color: 'var(--warning)' }}>{stats.medium}</div>
              </div>
            </div>

            <section style={{ marginBottom: '3rem' }}>
              <div className="section-title">
                <Activity size={24} color="var(--accent-cyan)" />
                <h2>Risk Heatmap & Distribution</h2>
              </div>
              <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '1.25rem', border: '1px solid var(--border-color)', height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#1a1f26', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend iconType="circle" />
                    <Bar dataKey="Critical" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="High" stackId="a" fill="#f87171" />
                    <Bar dataKey="Medium" stackId="a" fill="#fbbf24" />
                    <Bar dataKey="Low" stackId="a" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </>
        ) : activeView === 'rcm' ? (
          <div className="rcm-view">
            {/* RCM Filters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: '1rem', marginBottom: '2rem', background: 'var(--card-bg)', padding: '1.25rem', borderRadius: '1rem', border: '1px solid var(--border-color)', alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Industry</label>
                <select
                  className="form-control"
                  value={rcmFilters.industry}
                  onChange={e => setRcmFilters(prev => ({ ...prev, industry: e.target.value, sector: '', function: '' }))}
                >
                  <option value="">All Industries</option>
                  {industries.map(i => <option key={i.industry_id} value={i.industry_id}>{i.industry_name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Sector</label>
                <select
                  className="form-control"
                  value={rcmFilters.sector}
                  onChange={e => setRcmFilters(prev => ({ ...prev, sector: e.target.value, function: '' }))}
                >
                  <option value="">All Sectors</option>
                  {allSectors.filter(s => !rcmFilters.industry || s.industry_id === rcmFilters.industry).map(s => (
                    <option key={s.sector_id} value={s.sector_id}>{s.sector_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Function</label>
                <select
                  className="form-control"
                  value={rcmFilters.function}
                  onChange={e => setRcmFilters(prev => ({ ...prev, function: e.target.value }))}
                >
                  <option value="">All Functions</option>
                  {allFunctions.filter(f => !rcmFilters.sector || f.sector_id === rcmFilters.sector).map(f => (
                    <option key={f.function_id} value={f.function_id}>{f.function_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Search Matrix</label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input
                    className="form-control"
                    style={{ paddingLeft: '35px' }}
                    placeholder="Search descriptions..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <button
                className="btn btn-primary"
                style={{ alignSelf: 'end', height: '42px', padding: '0 1.5rem', background: 'var(--accent-blue)', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => setShowNewRcmModal(true)}
              >
                <Plus size={18} />
                New Control
              </button>
            </div>

            {/* RCM Table */}
            <div style={{ background: 'var(--card-bg)', borderRadius: '1.25rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>INDUSTRY / SECTOR</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>FUNCTION</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>RISK DESCRIPTION</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>CONTROL DESCRIPTION</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>TYPE</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>FREQ</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>REF</th>
                  </tr>
                </thead>
                <tbody>
                  {rcmEntries
                    .filter(entry => !rcmFilters.industry || entry.industry_id === rcmFilters.industry)
                    .filter(entry => !rcmFilters.sector || entry.sector_id === rcmFilters.sector)
                    .filter(entry => !rcmFilters.function || entry.function_id === rcmFilters.function)
                    .filter(entry => !searchQuery ||
                      entry.risk_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      entry.control_description.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(entry => (
                      <tr key={entry.rcm_id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{entry.industries?.industry_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{entry.sectors?.sector_name}</div>
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{entry.functions?.function_name}</td>
                        <td style={{ padding: '1rem', fontSize: '0.875rem', maxWidth: '300px' }}>{entry.risk_description}</td>
                        <td style={{ padding: '1rem', fontSize: '0.875rem', maxWidth: '300px' }}>{entry.control_description}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.6rem',
                            borderRadius: '1rem',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            background: entry.control_type === 'Preventive' ? 'rgba(16, 185, 129, 0.1)' : entry.control_type === 'Detective' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            color: entry.control_type === 'Preventive' ? '#10b981' : entry.control_type === 'Detective' ? '#3b82f6' : '#f59e0b'
                          }}>
                            {entry.control_type}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{entry.control_frequency}</td>
                        <td style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: '600' }}>{entry.reference_standard}</td>
                      </tr>
                    ))}
                  {rcmEntries.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No Risk Control Matrix entries found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <section className="observations-section">
            <div className="section-title">
              <CheckCircle size={24} color="var(--accent-blue)" />
              <h2>Active Findings List</h2>
            </div>

            {isDataLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                Loading audit data from Supabase...
              </div>
            ) : (
              <div className="observations-list">
                {filteredObservations.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', background: 'var(--glass-bg)', borderRadius: '1rem' }}>
                    No observations match your search query.
                  </div>
                ) : (
                  filteredObservations.map((obs) => (
                    <div key={obs.observation_id} className="observation-card fade-in">
                      <div className="rating-indicator">
                        {getRatingBadge(obs.risk_rating)}
                      </div>
                      <div className="obs-info">
                        <h3>{obs.title || obs.condition}</h3>
                        <div className="obs-meta">
                          <span>{obs.audit_procedures?.framework_mapping?.framework_name} / {obs.audit_procedures?.framework_mapping?.reference_code}</span>
                          <span>•</span>
                          <span>{obs.audit_procedures?.framework_mapping?.risk_categories?.category_name}</span>
                          <span>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={12} />
                            {new Date(obs.created_at).toISOString().split('T')[0]}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                          onClick={() => setSelectedObs(obs)}
                          style={{
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--border-color)',
                            color: '#fff',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            cursor: 'pointer'
                          }}>
                          View Details
                        </button>
                        <ChevronRight color="var(--text-secondary)" size={20} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Details Modal */}
      {selectedObs && (
        <div className="modal-overlay" onClick={() => setSelectedObs(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  {getRatingBadge(selectedObs.risk_rating)}
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {selectedObs.audit_procedures?.framework_mapping?.framework_name} • {selectedObs.audit_procedures?.framework_mapping?.reference_code} • {selectedObs.audit_procedures?.framework_mapping?.risk_categories?.category_name}
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={12} />
                      {new Date(selectedObs.created_at).toISOString().split('T')[0]}
                    </span>
                  </span>
                </div>
                <h2 style={{ fontSize: '1.5rem', lineHeight: '1.3' }}>{selectedObs.title || selectedObs.condition}</h2>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  onClick={() => generateDetailedPDF(selectedObs)}
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: 'var(--accent-blue)',
                    border: '1px solid var(--accent-blue)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '0.4rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <FileText size={14} />
                  Export Details PDF
                </button>
                <button className="close-btn" onClick={() => setSelectedObs(null)}>
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                  <div className="detail-label">Condition (Finding Detail)</div>
                  <div className="detail-value" style={{ fontSize: '1.1rem' }}>{selectedObs.condition}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Criteria</div>
                  <div className="detail-value">{selectedObs.criteria}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Cause</div>
                  <div className="detail-value">{selectedObs.cause || 'Not specified'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Effect / Impact</div>
                  <div className="detail-value">{selectedObs.effect || 'Not specified'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Recommendation</div>
                  <div className="detail-value">{selectedObs.recommendation || 'Not specified'}</div>
                </div>
              </div>

              {/* Evidence Section */}
              {selectedObs.evidence_urls && selectedObs.evidence_urls.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                  <div className="detail-label" style={{ marginBottom: '1rem' }}>Supporting Evidence</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
                    {selectedObs.evidence_urls.map((url, i) => {
                      const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)/i)
                      return (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '0.75rem',
                            padding: '0.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            textDecoration: 'none',
                            color: 'inherit',
                            transition: 'transform 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          {isImage ? (
                            <img src={url} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '0.4rem' }} alt="Evidence" />
                          ) : (
                            <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FileText size={32} color="var(--accent-blue)" />
                            </div>
                          )}
                          <span style={{
                            fontSize: '0.7rem',
                            color: '#fff',
                            maxWidth: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            textAlign: 'center'
                          }}>
                            {decodeURIComponent(url.split('/').pop()?.split('?')[0] || 'Unknown File')}
                          </span>
                          <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>View File <ExternalLink size={10} /></span>
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Evidence with Titles (evidence_json) */}
              {selectedObs.evidence_json && selectedObs.evidence_json.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                  <div className="detail-label" style={{ marginBottom: '1rem' }}>Supporting Evidence</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                    {selectedObs.evidence_json.map((item: any, i: number) => {
                      const isImage = item.url.match(/\.(jpg|jpeg|png|gif|webp)/i)
                      return (
                        <a
                          key={i}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '0.75rem',
                            padding: '0.75rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            textDecoration: 'none',
                            color: 'inherit',
                            transition: 'transform 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          {isImage ? (
                            <img src={item.url} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '0.4rem' }} alt={item.title} />
                          ) : (
                            <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FileText size={32} color="var(--accent-blue)" />
                            </div>
                          )}
                          <span style={{
                            fontSize: '0.75rem',
                            color: '#fff',
                            maxWidth: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            textAlign: 'center',
                            fontWeight: '600'
                          }}>
                            {item.title}
                          </span>
                          <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>View Document <ExternalLink size={10} /></span>
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}

              {selectedObs.management_responses && selectedObs.management_responses.length > 0 ? (
                <div className="management-section">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#10b981' }}>
                    <Target size={20} />
                    <h3 style={{ textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: '700' }}>Management Action Plan</h3>
                  </div>
                  <p style={{ marginBottom: '1rem', fontSize: '1rem' }}>{selectedObs.management_responses[0].management_response}</p>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                    <div className="detail-label" style={{ marginBottom: '0.5rem' }}>Action Plan</div>
                    <div className="detail-value">
                      {selectedObs.management_responses[0].action_plan}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <UserIcon size={16} color="var(--text-secondary)" />
                      <span style={{ fontSize: '0.875rem' }}>{selectedObs.management_responses[0].responsible_person}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={16} color="var(--text-secondary)" />
                      <span style={{ fontSize: '0.875rem' }}>Target: {selectedObs.management_responses[0].target_date}</span>
                    </div>
                    <div className={`badge badge-low`} style={{ marginLeft: 'auto', textTransform: 'none' }}>
                      Status: {selectedObs.management_responses[0].status}
                    </div>
                  </div>
                </div>
              ) : (
                profile?.role === 'client' ? (
                  <div className="management-section" style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--accent-blue)' }}>
                      <Plus size={20} />
                      <h3 style={{ textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: '700' }}>Management Action Plan (Client Response)</h3>
                    </div>
                    <form onSubmit={handleMgmtSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className="detail-item">
                        <label className="detail-label">Management Response</label>
                        <textarea
                          className="form-control"
                          required
                          placeholder="Acknowledge the finding..."
                          value={mgmtResp.management_response}
                          onChange={e => setMgmtResp({ ...mgmtResp, management_response: e.target.value })}
                        />
                      </div>
                      <div className="detail-item">
                        <label className="detail-label">Action Plan</label>
                        <textarea
                          className="form-control"
                          required
                          placeholder="Detail the steps for remediation..."
                          value={mgmtResp.action_plan}
                          onChange={e => setMgmtResp({ ...mgmtResp, action_plan: e.target.value })}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="detail-item">
                          <label className="detail-label">Responsible Person</label>
                          <input
                            className="form-control"
                            required
                            placeholder="Name..."
                            value={mgmtResp.responsible_person}
                            onChange={e => setMgmtResp({ ...mgmtResp, responsible_person: e.target.value })}
                          />
                        </div>
                        <div className="detail-item">
                          <label className="detail-label">Target Date</label>
                          <input
                            type="date"
                            className="form-control"
                            required
                            value={mgmtResp.target_date}
                            onChange={e => setMgmtResp({ ...mgmtResp, target_date: e.target.value })}
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                          background: 'var(--accent-blue)',
                          color: '#fff',
                          border: 'none',
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        {isSubmitting ? 'Submitting...' : <><Send size={18} /> Submit Plan</>}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="management-section" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>Pending Management Response</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
      {/* New Observation Modal */}
      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>New Audit Finding</h2>
              <button className="close-btn" onClick={() => setShowNewModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* AI Assistant Section */}
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid var(--accent-blue)',
                borderRadius: '0.75rem',
                padding: '1rem',
                marginBottom: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--accent-blue)' }}>
                  <Wand2 size={18} />
                  <span style={{ fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase' }}>AI Audit Assistant</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Paste your raw audit notes or observation text below, and let AI structure the finding for you.
                </p>
                <textarea
                  className="form-control"
                  style={{ minHeight: '80px', marginBottom: '1rem', background: 'rgba(0,0,0,0.2)' }}
                  placeholder="e.g., During the review of backup logs for Q3, we noticed that 5 servers didn't have backup records. This violates the IT Policy SEC-04. The admin forgot to include them in the new schedule..."
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={processWithAI}
                  disabled={isAIProcessing || !aiInput.trim()}
                  style={{
                    width: '100%',
                    background: 'var(--accent-blue)',
                    color: '#fff',
                    border: 'none',
                    padding: '0.6rem',
                    borderRadius: '0.5rem',
                    cursor: (isAIProcessing || !aiInput.trim()) ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                >
                  {isAIProcessing ? 'AI is processing...' : <><Sparkles size={16} /> Structure with AI</>}
                </button>
              </div>

              <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={async (e) => {
                e.preventDefault()
                const { error } = await supabase.from('audit_observations').insert([{
                  ...newObs,
                  evidence_json: uploadedAttachments
                }])
                if (!error) {
                  setShowNewModal(false)
                  setUploadedAttachments([])
                  setNewObs({
                    procedure_id: '',
                    condition: '',
                    criteria: '',
                    cause: '',
                    effect: '',
                    recommendation: '',
                    risk_rating: 'Low' as any,
                    title: ''
                  })
                  fetchData()
                } else {
                  alert('Error saving observation: ' + error.message)
                }
              }}>
                <div className="detail-item">
                  <label className="detail-label">Audit Procedure</label>
                  <select
                    required
                    className="form-control"
                    value={newObs.procedure_id}
                    onChange={e => setNewObs({ ...newObs, procedure_id: e.target.value })}
                  >
                    <option value="">Select a procedure...</option>
                    {procedures.map(p => (
                      <option key={p.procedure_id} value={p.procedure_id}>
                        {p.framework_mapping?.framework_name} {p.framework_mapping?.reference_code} - {p.procedure_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="detail-item">
                  <label className="detail-label">Title (Summary)</label>
                  <input
                    required
                    className="form-control"
                    placeholder="Summarized finding title..."
                    value={newObs.title}
                    onChange={e => setNewObs({ ...newObs, title: e.target.value })}
                  />
                </div>

                <div className="detail-item">
                  <label className="detail-label">Condition (Finding)</label>
                  <textarea
                    required
                    className="form-control"
                    placeholder="What was found?"
                    value={newObs.condition}
                    onChange={e => setNewObs({ ...newObs, condition: e.target.value })}
                  />
                </div>

                <div className="detail-item">
                  <label className="detail-label">Criteria (Standard)</label>
                  <textarea
                    required
                    className="form-control"
                    style={{ minHeight: '80px' }}
                    placeholder="What is the required standard?"
                    value={newObs.criteria}
                    onChange={e => setNewObs({ ...newObs, criteria: e.target.value })}
                  />
                </div>

                <div className="detail-item">
                  <label className="detail-label">Cause (Root Cause)</label>
                  <textarea
                    required
                    className="form-control"
                    style={{ minHeight: '80px' }}
                    placeholder="Root cause..."
                    value={newObs.cause}
                    onChange={e => setNewObs({ ...newObs, cause: e.target.value })}
                  />
                </div>

                <div className="detail-item">
                  <label className="detail-label">Risk Rating</label>
                  <select
                    className="form-control"
                    value={newObs.risk_rating}
                    onChange={e => setNewObs({ ...newObs, risk_rating: e.target.value as any })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div className="detail-item">
                  <label className="detail-label">Recommendation</label>
                  <textarea
                    className="form-control"
                    placeholder="Suggested action plan..."
                    value={newObs.recommendation}
                    onChange={e => setNewObs({ ...newObs, recommendation: e.target.value })}
                  />
                </div>

                <div className="detail-item">
                  <label className="detail-label">Attachments (Evidence)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <input
                      className="form-control"
                      placeholder="Enter file title (e.g. Audit Policy)..."
                      value={attachmentTitle}
                      onChange={e => setAttachmentTitle(e.target.value)}
                    />
                    <div style={{
                      border: '2px dashed var(--border-color)',
                      borderRadius: '0.5rem',
                      padding: '0.5rem',
                      textAlign: 'center',
                      background: 'var(--glass-bg)',
                      cursor: 'pointer',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                    >
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                      />
                      <Upload color="var(--text-secondary)" size={16} />
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {isUploading ? 'Uploading...' : 'Choose File'}
                      </span>
                    </div>
                  </div>
                  {uploadedAttachments.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                      {uploadedAttachments.map((att, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem' }}>
                          <CheckCircle size={14} color="var(--success)" />
                          <span style={{ fontSize: '0.75rem', color: '#fff' }}>{att.title}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>File attached</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isUploading}
                  style={{
                    background: isUploading ? 'var(--border-color)' : 'var(--accent-blue)',
                    color: '#fff',
                    border: 'none',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    fontWeight: '700',
                    marginTop: '1rem',
                    transition: 'opacity 0.2s'
                  }}
                >
                  {isUploading ? 'Finalizing Uploads...' : 'Save Observation'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* New RCM Modal */}
      {showNewRcmModal && (
        <div className="modal-overlay" onClick={() => setShowNewRcmModal(false)}>
          <div className="modal-content" style={{ width: '800px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem' }}>
                  <Grid size={20} color="var(--accent-blue)" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>New Risk Control</h2>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Define a new risk scenario and its mitigating control</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowNewRcmModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.05)', borderBottom: '1px solid var(--border-color)' }}>
              <label className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={14} color="var(--accent-blue)" />
                AI Risk Draft (Optional)
              </label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <input
                  className="form-control"
                  placeholder="e.g. unauthorized change to database table..."
                  value={rcmAiInput}
                  onChange={e => setRcmAiInput(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleRcmAiGenerate}
                  disabled={isRcmAiProcessing}
                  style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Wand2 size={16} />
                  {isRcmAiProcessing ? 'Thinking...' : 'Generate with AI'}
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateRcm}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', padding: '1.5rem' }}>
                <div className="detail-item">
                  <label className="detail-label">Industry</label>
                  <select
                    className="form-control"
                    required
                    value={newRcm.industry_id}
                    onChange={e => setNewRcm({ ...newRcm, industry_id: e.target.value, sector_id: '', function_id: '' })}
                  >
                    <option value="">Select Industry...</option>
                    {industries.map(i => <option key={i.industry_id} value={i.industry_id}>{i.industry_name}</option>)}
                  </select>
                </div>

                <div className="detail-item">
                  <label className="detail-label">Sector</label>
                  <select
                    className="form-control"
                    required
                    value={newRcm.sector_id}
                    disabled={!newRcm.industry_id}
                    onChange={e => setNewRcm({ ...newRcm, sector_id: e.target.value, function_id: '' })}
                  >
                    <option value="">Select Sector...</option>
                    {allSectors.filter(s => s.industry_id === newRcm.industry_id).map(s => (
                      <option key={s.sector_id} value={s.sector_id}>{s.sector_name}</option>
                    ))}
                  </select>
                </div>

                <div className="detail-item">
                  <label className="detail-label">Function</label>
                  <select
                    className="form-control"
                    required
                    value={newRcm.function_id}
                    disabled={!newRcm.sector_id}
                    onChange={e => setNewRcm({ ...newRcm, function_id: e.target.value })}
                  >
                    <option value="">Select Function...</option>
                    {allFunctions.filter(f => f.sector_id === newRcm.sector_id).map(f => (
                      <option key={f.function_id} value={f.function_id}>{f.function_name}</option>
                    ))}
                  </select>
                </div>

                <div className="detail-item">
                  <label className="detail-label">Risk Category</label>
                  <select
                    className="form-control"
                    required
                    value={newRcm.risk_category_id}
                    onChange={e => setNewRcm({ ...newRcm, risk_category_id: e.target.value })}
                  >
                    <option value="">Select Risk Category...</option>
                    {riskCats.map(c => <option key={c.risk_id} value={c.risk_id}>{c.category_name}</option>)}
                  </select>
                </div>

                <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                  <label className="detail-label">Risk Description</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    required
                    placeholder="Enter the risk scenario..."
                    value={newRcm.risk_description}
                    onChange={e => setNewRcm({ ...newRcm, risk_description: e.target.value })}
                  />
                </div>

                <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                  <label className="detail-label">Control Description</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    required
                    placeholder="Enter the mitigating control..."
                    value={newRcm.control_description}
                    onChange={e => setNewRcm({ ...newRcm, control_description: e.target.value })}
                  />
                </div>

                <div className="detail-item">
                  <label className="detail-label">Reference Standard</label>
                  <input
                    className="form-control"
                    placeholder="e.g. ISO 27001, COBIT..."
                    value={newRcm.reference_standard}
                    onChange={e => setNewRcm({ ...newRcm, reference_standard: e.target.value })}
                  />
                </div>

                <div className="detail-item">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label className="detail-label">Control Type</label>
                      <select
                        className="form-control"
                        value={newRcm.control_type}
                        onChange={e => setNewRcm({ ...newRcm, control_type: e.target.value as any })}
                      >
                        <option value="Preventive">Preventive</option>
                        <option value="Detective">Detective</option>
                        <option value="Corrective">Corrective</option>
                      </select>
                    </div>
                    <div>
                      <label className="detail-label">Frequency</label>
                      <select
                        className="form-control"
                        value={newRcm.control_frequency}
                        onChange={e => setNewRcm({ ...newRcm, control_frequency: e.target.value as any })}
                      >
                        <option value="Continuous">Continuous</option>
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Annual">Annual</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', padding: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewRcmModal(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: '#fff', padding: '0.6rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--accent-blue)', color: '#fff', border: 'none', padding: '0.6rem 2rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
                  Create Control Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
