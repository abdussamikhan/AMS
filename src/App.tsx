import { useEffect, useState, useMemo } from 'react'
import type { Observation } from './types'
import { useAuth } from './hooks/useAuth'
import { useAuditData } from './hooks/useAuditData'
import { useTheme } from './hooks/useTheme'


import {
  Search,
  Plus,
  Download,
  X,
  Calendar,
  FileText
} from 'lucide-react'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { StatsCards } from './components/StatsCards'
import { RiskHeatmap } from './components/RiskHeatmap'
import { RcmAnalytics } from './components/RcmAnalytics'
import { ManagementAnalytics } from './components/ManagementAnalytics'
import { GeneralAnalytics } from './components/GeneralAnalytics'
import { FindingsView } from './components/views/FindingsView'
import { RcmView } from './components/views/RcmView'
import { RiskRegisterView } from './components/views/RiskRegisterView'
import { AuditPlanningView } from './components/views/AuditPlanningView'
import { AuditProgramView } from './components/views/AuditProgramView'
import { AdminSetupView } from './components/views/AdminSetupView'
import { AdminReferencesView } from './components/views/AdminReferencesView'
import { AdminTemplatesView } from './components/views/AdminTemplatesView'

import { AuthView } from './components/modals/AuthView'
import { ObservationModal } from './components/modals/ObservationModal'
import { AnnualPlanModal } from './components/modals/AnnualPlanModal'
import { AuditEngagementModal } from './components/modals/AuditEngagementModal'
import { RiskAssessmentModal } from './components/modals/RiskAssessmentModal'
import { RcmModal } from './components/modals/RcmModal'
import { ReferenceUploadModal } from './components/modals/ReferenceUploadModal'



function App() {
  const { theme, toggleTheme } = useTheme()
  const {
    session,
    profile,
    isAuthLoading,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    authFullName,
    setAuthFullName,
    authMode,
    setAuthMode,
    selectedRole,
    setSelectedRole,
    handleAuth,
    handleLogout: handleSignOut
  } = useAuth()

  const {
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
    newRiskEntry,
    setNewRiskEntry,
    isRefUploading,
    showRefUploadModal,
    setShowRefUploadModal,
    newRefDoc,
    setNewRefDoc,
    newRcm,
    setNewRcm,
    auditPlans,
    audits,
    selectedPlanId,
    isTemplateUploading,
    setIsTemplateUploading,
    showNewPlanModal,
    setShowNewPlanModal,
    showNewAuditModal,
    setShowNewAuditModal,
    newAudit,
    setNewAudit,
    auditors,
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
    setCurrentRcmId,
    setCurrentRiskId,
    currentObsId,
    newObs,
    setNewObs,
    aiInput,
    setAiInput,
    rcmAiInput,
    setRcmAiInput,
    isAIProcessing,
    isRcmAiProcessing,
    handleRefUpload,
    handleDeleteRef,
    handleFileUpload,
    handleDownloadCSV,
    handleGeneratePDF,
    handleGenerateDetailedPDF,
    markAsRead,
    openEditObsModal,
    handleDeleteObs,
    openEditRcmModal,
    handleDeleteRcm,
    handleCreateRcm,
    handleSaveRisk,
    handleDeleteRisk,
    processWithAI,
    setIsEditingObs,
    setCurrentObsId,
    setIsEditingRcm,
    setNotifications,
    toggleDepartmentStatus,
    setSelectedPlanId,
    fetchData,
    fetchRcmContext,
    fetchAuditPlanningData,
    handleRcmAiGenerate,
    setIndustries,
    setAllFunctions,
    handleGenerateRiskRegisterPDF,
    handleDownloadRiskRegisterCSV,
    auditPrograms,
    selectedProgram,
    setSelectedProgram,
    isProgramLoading,
    fetchProgramDetails,
    createAuditProgram,
    updateProcedureStatus,
    addProcedureToTest,
    addTestToProgram,
    toggleIssueObservation
  } = useAuditData(session)

  const [activeView, setActiveView] = useState<string>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedObs, setSelectedObs] = useState<Observation | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [isAppLoading, setIsAppLoading] = useState(true)

  const handleToggleObservation = async (testId: string, issue: boolean) => {
    const success = await toggleIssueObservation(testId, issue);
    if (success && issue) {
      // Find the test data in selectedProgram
      const test = selectedProgram?.tests?.find(t => t.id === testId);
      if (test) {
        const failedProcs = test.procedures?.filter(p => p.status === 'Failed') || [];
        const conditionText = failedProcs.length > 0
          ? "The following test procedures failed:\n" + failedProcs.map(p => `- ${p.procedure_name}: ${p.description}`).join('\n')
          : "Failed procedures identified during testing.";

        setNewObs({
          procedure_id: '',
          condition: conditionText,
          criteria: test.risk_register?.control_description || '',
          cause: '',
          effect: '',
          recommendation: '',
          risk_rating: 'Medium',
          title: `Observation: ${test.risk_register?.risk_title || 'New Finding'}`,
          audit_id: selectedProgram?.audit_id || ''
        });
        setShowNewModal(true);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsAppLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Auto-select first plan when data loads
  useEffect(() => {
    if (auditPlans.length > 0 && !selectedPlanId) {
      setSelectedPlanId(auditPlans[0].plan_id)
    }
  }, [auditPlans, selectedPlanId])

  const [analyticsView, setAnalyticsView] = useState<'audits' | 'rcm' | 'management'>('audits')
  const [adminView, setAdminView] = useState<'setup' | 'references' | 'templates'>('setup')
  const [riskAssessmentView, setRiskAssessmentView] = useState<'library' | 'register'>('library')

  const chartData = useMemo(() => {
    const categories = Array.from(new Set(observations.map(o => o.audit_procedures?.framework_mapping?.risk_categories?.category_name || 'Uncategorized')))
    return categories.map(cat => ({
      name: cat,
      Critical: observations.filter(o => o.risk_rating === 'Critical' && (o.audit_procedures?.framework_mapping?.risk_categories?.category_name || 'Uncategorized') === cat).length,
      High: observations.filter(o => o.risk_rating === 'High' && (o.audit_procedures?.framework_mapping?.risk_categories?.category_name || 'Uncategorized') === cat).length,
      Medium: observations.filter(o => o.risk_rating === 'Medium' && (o.audit_procedures?.framework_mapping?.risk_categories?.category_name || 'Uncategorized') === cat).length,
      Low: observations.filter(o => o.risk_rating === 'Low' && (o.audit_procedures?.framework_mapping?.risk_categories?.category_name || 'Uncategorized') === cat).length,
    }))
  }, [observations])

  const rcmCategoryData = useMemo(() => {
    const cats = riskCats.map(c => c.category_name)
    return cats.map(cat => ({
      name: cat,
      count: rcmEntries.filter(r => r.risk_categories?.category_name === cat).length
    }))
  }, [rcmEntries, riskCats])

  const rcmControlTypeData = useMemo(() => {
    const types = ['Preventive', 'Detective', 'Corrective']
    return types.map(t => ({
      name: t,
      value: rcmEntries.filter(r => r.control_type === t).length
    }))
  }, [rcmEntries])

  const rcmFunctionData = useMemo(() => {
    const funcs = Array.from(new Set(rcmEntries.map(r => r.functions?.function_name || 'Generic')))
    return funcs.map(f => ({
      name: f,
      count: rcmEntries.filter(r => (r.functions?.function_name || 'Generic') === f).length
    }))
  }, [rcmEntries])

  const planStatusData = useMemo(() => {
    const statuses = ['Draft', 'Approved', 'In Progress', 'Completed']
    return statuses.map(s => ({
      name: s,
      value: auditPlans.filter(p => p.status === s).length
    }))
  }, [auditPlans])

  const engagementStatusData = useMemo(() => {
    const statuses = ['Scheduled', 'In Progress', 'Fieldwork', 'Reporting', 'Completed']
    return statuses.map(s => ({
      name: s,
      value: audits.filter(a => a.status === s).length
    }))
  }, [audits])

  const resourceWorkloadData = useMemo(() => {
    const auditorsList = Array.from(new Set(audits.map(a => a.profiles?.full_name || 'Unassigned')))
    return auditorsList.map(name => ({
      name,
      count: audits.filter(a => (a.profiles?.full_name || 'Unassigned') === name).length
    }))
  }, [audits])

  const auditByFunctionData = useMemo(() => {
    const funcs = Array.from(new Set(audits.map(a => a.functions?.function_name || 'Generic')))
    return funcs.map(f => ({
      name: f,
      count: audits.filter(a => (a.functions?.function_name || 'Generic') === f).length
    }))
  }, [audits])


  const filteredObservations = useMemo(() => {
    if (!searchQuery) return observations
    return observations.filter(obs =>
      obs.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obs.condition?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obs.audit_procedures?.procedure_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [observations, searchQuery])

  const filteredRiskRegisterEntries = useMemo(() => {
    return riskRegisterEntries.filter(entry => {
      const matchesSearch = !riskRegisterFilters.search ||
        (entry.risk_title?.toLowerCase().includes(riskRegisterFilters.search.toLowerCase()) ||
          entry.risk_description?.toLowerCase().includes(riskRegisterFilters.search.toLowerCase()) ||
          entry.control_title?.toLowerCase().includes(riskRegisterFilters.search.toLowerCase()) ||
          entry.control_description?.toLowerCase().includes(riskRegisterFilters.search.toLowerCase()));

      const matchesCategory = riskRegisterFilters.category === 'all' || entry.risk_category_id === riskRegisterFilters.category;
      const matchesOwner = riskRegisterFilters.owner === 'all' || entry.risk_owner === riskRegisterFilters.owner;
      const matchesYear = riskRegisterFilters.year === 'all' || entry.fiscal_year.toString() === riskRegisterFilters.year;

      return matchesSearch && matchesCategory && matchesOwner && matchesYear;
    })
  }, [riskRegisterEntries, riskRegisterFilters])

  const handleLogout = async () => {
    await handleSignOut()
    setActiveView('overview')
  }


  if (isAppLoading) {
    return (
      <div className="auth-container">
        <div style={{ textAlign: 'center' }}>
          <div className="logo" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>AuditAce</div>
          <div style={{ color: 'var(--text-secondary)' }}>Initializing Secure Session...</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <AuthView
        authMode={authMode}
        setAuthMode={setAuthMode}
        authEmail={authEmail}
        setAuthEmail={setAuthEmail}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        authFullName={authFullName}
        setAuthFullName={setAuthFullName}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        handleAuth={handleAuth}
        isAuthLoading={isAuthLoading}
      />
    )
  }

  return (
    <div className="app-container">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        profile={profile}
        session={session}
        handleLogout={handleLogout}
      />

      <main className="main-content">
        <Header
          activeView={activeView}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          notifications={notifications}
          setNotifications={setNotifications}
          markAsRead={markAsRead}
          session={session}
          theme={theme}
          toggleTheme={toggleTheme}
        >
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
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
                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '200px' }}
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
                    onClick={() => {
                      setIsEditingObs(false);
                      setCurrentObsId(null);
                      setNewObs({
                        procedure_id: '',
                        title: '',
                        condition: '',
                        criteria: '',
                        cause: '',
                        effect: '',
                        recommendation: '',
                        risk_rating: 'Low',
                        audit_id: ''
                      });
                      setShowNewModal(true);
                    }}
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
              </div>
            )}

            {activeView === 'risk-register' && (profile?.role === 'auditor' || profile?.role === 'manager') && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => {
                    setIsEditingRisk(false);
                    setCurrentRiskId(null);
                    setNewRiskEntry({
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
                      status: 'Open',
                      fiscal_year: new Date().getFullYear(),
                      rcm_id: null
                    });
                    setShowNewRiskModal(true);
                  }}
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
                  New Risk
                </button>
              </div>
            )}

            {(activeView === 'findings' || activeView === 'risk-register') && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => {
                    if (activeView === 'findings') {
                      handleDownloadCSV(observations)
                    } else {
                      handleDownloadRiskRegisterCSV(filteredRiskRegisterEntries)
                    }
                  }}
                  style={{
                    background: 'var(--glass-bg)',
                    color: 'var(--text-primary)',
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
                  Download CSV
                </button>
                <button
                  onClick={() => {
                    if (activeView === 'findings') {
                      handleGeneratePDF(observations, stats, profile, session?.user?.email || '')
                    } else {
                      handleGenerateRiskRegisterPDF(filteredRiskRegisterEntries, profile, riskRegisterFilters.year, session?.user?.email || '')
                    }
                  }}
                  style={{
                    background: 'var(--glass-bg)',
                    color: 'var(--text-primary)',
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
                  <FileText size={18} />
                  Export PDF
                </button>
              </div>
            )}

            {activeView === 'audit-planning' && (
              <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 10 }}>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowNewPlanModal(true); }}
                  className="auth-button"
                  style={{ width: 'auto', padding: '0.5rem 1.5rem', cursor: 'pointer' }}
                >
                  <Plus size={18} /> New Annual Plan
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowNewAuditModal(true); }}
                  className="auth-button"
                  style={{ width: 'auto', padding: '0.5rem 1.5rem', background: 'var(--glass-bg)', border: '1px solid var(--accent-blue)', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  <Calendar size={18} /> Schedule Engagement
                </button>
              </div>
            )}
          </div>
        </Header>

        {activeView === 'overview' ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <StatsCards stats={stats} />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1px' }}>
              <button
                onClick={() => setAnalyticsView('audits')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'none',
                  border: 'none',
                  color: analyticsView === 'audits' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  borderBottom: analyticsView === 'audits' ? '2px solid var(--accent-blue)' : '2px solid transparent',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                Audit Findings
              </button>
              <button
                onClick={() => setAnalyticsView('management')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'none',
                  border: 'none',
                  color: analyticsView === 'management' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  borderBottom: analyticsView === 'management' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                Audit Management
              </button>
              <button
                onClick={() => setAnalyticsView('rcm')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'none',
                  border: 'none',
                  color: analyticsView === 'rcm' ? 'var(--accent-purple)' : 'var(--text-secondary)',
                  borderBottom: analyticsView === 'rcm' ? '2px solid var(--accent-purple)' : '2px solid transparent',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                RCM Analytics
              </button>
            </div>

            {analyticsView === 'audits' ? (
              <RiskHeatmap chartData={chartData} />
            ) : analyticsView === 'rcm' ? (
              <RcmAnalytics
                rcmCategoryData={rcmCategoryData}
                rcmControlTypeData={rcmControlTypeData}
                rcmFunctionData={rcmFunctionData}
              />
            ) : (
              <ManagementAnalytics
                planStatusData={planStatusData}
                engagementStatusData={engagementStatusData}
                resourceWorkloadData={resourceWorkloadData}
                auditsByFunctionData={auditByFunctionData}
              />
            )}
          </>
        ) : activeView === 'admin' ? (
          <>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1px' }}>
              <button
                onClick={() => setAdminView('references')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'none',
                  border: 'none',
                  color: adminView === 'references' ? 'var(--accent-purple)' : 'var(--text-secondary)',
                  borderBottom: adminView === 'references' ? '2px solid var(--accent-purple)' : '2px solid transparent',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                References
              </button>
              <button
                onClick={() => setAdminView('setup')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'none',
                  border: 'none',
                  color: adminView === 'setup' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  borderBottom: adminView === 'setup' ? '2px solid var(--accent-blue)' : '2px solid transparent',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                Setup
              </button>
              <button
                onClick={() => setAdminView('templates')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'none',
                  border: 'none',
                  color: adminView === 'templates' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  borderBottom: adminView === 'templates' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                Templates
              </button>
            </div>

            {adminView === 'setup' ? (
              <AdminSetupView
                industries={industries}
                setIndustries={setIndustries}
                allFunctions={allFunctions}
                setAllFunctions={setAllFunctions}
                allDepartments={allDepartments}
                toggleDepartmentStatus={toggleDepartmentStatus}
              />
            ) : adminView === 'references' ? (
              <AdminReferencesView
                refDocs={refDocs}
                refFilters={refFilters}
                setRefFilters={setRefFilters}
                setShowRefUploadModal={setShowRefUploadModal}
                handleDeleteRef={handleDeleteRef}
                profile={profile}
              />
            ) : adminView === 'templates' ? (
              <AdminTemplatesView
                isTemplateUploading={isTemplateUploading}
                setIsTemplateUploading={setIsTemplateUploading}
              />
            ) : null}
          </>
        ) : activeView === 'risk-assessment' ? (
          <>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1px' }}>
              <button
                onClick={() => setRiskAssessmentView('library')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'none',
                  border: 'none',
                  color: riskAssessmentView === 'library' ? 'var(--success)' : 'var(--text-secondary)',
                  borderBottom: riskAssessmentView === 'library' ? '2px solid var(--success)' : '2px solid transparent',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                Risk Library
              </button>
              <button
                onClick={() => setRiskAssessmentView('register')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'none',
                  border: 'none',
                  color: riskAssessmentView === 'register' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  borderBottom: riskAssessmentView === 'register' ? '2px solid var(--accent-blue)' : '2px solid transparent',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                Risk Register
              </button>
            </div>

            {riskAssessmentView === 'register' ? (
              <RiskRegisterView
                riskRegisterFilters={riskRegisterFilters}
                setRiskRegisterFilters={setRiskRegisterFilters}
                riskCats={riskCats}
                riskRegisterEntries={riskRegisterEntries}
                setIsEditingRisk={setIsEditingRisk}
                setCurrentRiskId={setCurrentRiskId}
                setNewRiskEntry={setNewRiskEntry}
                setShowNewRiskModal={setShowNewRiskModal}
                handleDeleteRisk={handleDeleteRisk}
              />
            ) : (
              <RcmView
                rcmFilters={rcmFilters}
                setRcmFilters={setRcmFilters}
                industries={industries}
                allFunctions={allFunctions}
                allDepartments={allDepartments}
                allSystems={allSystems}
                riskCats={riskCats}
                rcmEntries={rcmEntries}
                openEditRcmModal={openEditRcmModal}
                handleDeleteRcm={handleDeleteRcm}
                setIsEditingRcm={setIsEditingRcm}
                setCurrentRcmId={setCurrentRcmId}
                setNewRcm={setNewRcm}
                setShowNewRcmModal={setShowNewRcmModal}
              />
            )}
          </>
        ) : activeView === 'analytics' ? (
          <GeneralAnalytics />
        ) : activeView === 'audit-planning' ? (
          <AuditPlanningView
            auditPlans={auditPlans}
            selectedPlanId={selectedPlanId}
            setSelectedPlanId={setSelectedPlanId}
            audits={audits}
            setActiveView={setActiveView}
            setSearchQuery={setSearchQuery}
            createAuditProgram={createAuditProgram}
            auditPrograms={auditPrograms}
          />
        ) : activeView === 'audit-program' ? (
          <AuditProgramView
            auditPrograms={auditPrograms}
            isDataLoading={isDataLoading || isProgramLoading}
            selectedProgram={selectedProgram}
            setSelectedProgram={setSelectedProgram}
            fetchProgramDetails={fetchProgramDetails}
            updateProcedureStatus={updateProcedureStatus}
            addProcedureToTest={addProcedureToTest}
            addTestToProgram={addTestToProgram}
            handleToggleObservation={handleToggleObservation}
            riskRegisterEntries={riskRegisterEntries}
          />
        ) : (
          <FindingsView
            isDataLoading={isDataLoading}
            filteredObservations={filteredObservations}
            setSelectedObs={setSelectedObs}
            selectedObs={selectedObs}
            openEditObsModal={openEditObsModal}
            handleDeleteObs={handleDeleteObs}
            setIsEditingObs={setIsEditingObs}
            setCurrentObsId={setCurrentObsId}
            setNewObs={setNewObs}
            setUploadedAttachments={setUploadedAttachments}
            setShowNewModal={setShowNewModal}
            handleGenerateDetailedPDF={(obs) => handleGenerateDetailedPDF(obs, profile, session?.user?.email)}
          />
        )}
      </main >
      <ObservationModal
        showNewModal={showNewModal}
        setShowNewModal={setShowNewModal}
        isEditingObs={isEditingObs}
        currentObsId={currentObsId}
        newObs={newObs}
        setNewObs={setNewObs}
        aiInput={aiInput}
        setAiInput={setAiInput}
        isAIProcessing={isAIProcessing}
        processWithAI={processWithAI}
        audits={audits}
        procedures={procedures}
        attachmentTitle={attachmentTitle}
        setAttachmentTitle={setAttachmentTitle}
        handleFileUpload={handleFileUpload}
        isUploading={isUploading}
        uploadedAttachments={uploadedAttachments}
        setUploadedAttachments={setUploadedAttachments}
        fetchData={fetchData}
      />

      <AnnualPlanModal
        showNewPlanModal={showNewPlanModal}
        setShowNewPlanModal={setShowNewPlanModal}
        fetchAuditPlanningData={fetchAuditPlanningData}
      />

      <AuditEngagementModal
        showNewAuditModal={showNewAuditModal}
        setShowNewAuditModal={setShowNewAuditModal}
        newAudit={newAudit}
        setNewAudit={setNewAudit}
        auditPlans={auditPlans}
        allFunctions={allFunctions}
        allDepartments={allDepartments}
        auditors={auditors}
        isCustomFunctionAudit={isCustomFunctionAudit}
        setIsCustomFunctionAudit={setIsCustomFunctionAudit}
        isCustomDepartmentAudit={isCustomDepartmentAudit}
        setIsCustomDepartmentAudit={setIsCustomDepartmentAudit}
        customFunctionAudit={customFunctionAudit}
        setCustomFunctionAudit={setCustomFunctionAudit}
        customDepartmentAudit={customDepartmentAudit}
        setCustomDepartmentAudit={setCustomDepartmentAudit}
        fetchAuditPlanningData={fetchAuditPlanningData}
        fetchRcmContext={fetchRcmContext}
      />

      <RiskAssessmentModal
        showNewRiskModal={showNewRiskModal}
        setShowNewRiskModal={setShowNewRiskModal}
        isEditingRisk={isEditingRisk}
        newRiskEntry={newRiskEntry}
        setNewRiskEntry={setNewRiskEntry}
        riskCats={riskCats}
        rcmEntries={rcmEntries}
        handleSaveRisk={handleSaveRisk}
      />

      <RcmModal
        showNewRcmModal={showNewRcmModal}
        setShowNewRcmModal={setShowNewRcmModal}
        isEditingRcm={isEditingRcm}
        newRcm={newRcm}
        setNewRcm={setNewRcm}
        rcmAiInput={rcmAiInput}
        setRcmAiInput={setRcmAiInput}
        isRcmAiProcessing={isRcmAiProcessing}
        handleRcmAiGenerate={handleRcmAiGenerate}
        industries={industries}
        allFunctions={allFunctions}
        allDepartments={allDepartments}
        riskCats={riskCats}
        allSystems={allSystems}
        isCustomFunctionRcm={isCustomFunctionRcm}
        setIsCustomFunctionRcm={setIsCustomFunctionRcm}
        isCustomDepartmentRcm={isCustomDepartmentRcm}
        setIsCustomDepartmentRcm={setIsCustomDepartmentRcm}
        customFunctionRcm={customFunctionRcm}
        setCustomFunctionRcm={setCustomFunctionRcm}
        customDepartmentRcm={customDepartmentRcm}
        setCustomDepartmentRcm={setCustomDepartmentRcm}
        handleCreateRcm={handleCreateRcm}
      />

      <ReferenceUploadModal
        showRefUploadModal={showRefUploadModal}
        setShowRefUploadModal={setShowRefUploadModal}
        newRefDoc={newRefDoc}
        setNewRefDoc={setNewRefDoc}
        handleRefUpload={handleRefUpload}
        isRefUploading={isRefUploading}
      />
    </div >
  )
}

export default App
