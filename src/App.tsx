import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { Database } from './types/supabase'
import {
  LayoutDashboard,
  ShieldAlert,
  CheckCircle2,
  BarChart3,
  Search,
  ChevronRight,
  ClipboardList,
  X,
  Target,
  User,
  Calendar,
  Plus,
  Download,
  Activity,
  Send,
  CheckCircle
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts'

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
}

function App() {
  const [loading, setLoading] = useState(true)
  const [observations, setObservations] = useState<Observation[]>([])
  const [activeView, setActiveView] = useState('overview') // 'overview' | 'findings'
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
    risk_rating: 'Low' as Database['public']['Enums']['risk_level']
  })
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0
  })

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
    fetchData()
    fetchProcedures()
  }, [])

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
      setLoading(true)
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
      setLoading(false)
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

  const getRatingBadge = (rating: string) => {
    const r = rating.toLowerCase()
    return <span className={`badge badge-${r}`}>{rating}</span>
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
      </aside>

      <main className="main-content">
        <header className="header" style={{ marginBottom: activeView === 'findings' ? '2rem' : '3rem' }}>
          <div>
            <h1>{activeView === 'overview' ? 'Audit Overview' : 'Control Findings'}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {activeView === 'overview'
                ? 'High-level risk distribution and analytics'
                : 'Detailed list of organizational audit observations'}
            </p>
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
                Export Report
              </button>
            </div>
          )}
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
        ) : (
          <section className="observations-section">
            <div className="section-title">
              <CheckCircle size={24} color="var(--accent-blue)" />
              <h2>Active Findings List</h2>
            </div>

            {loading ? (
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
                        <h3>{obs.condition}</h3>
                        <div className="obs-meta">
                          <span>{obs.audit_procedures?.framework_mapping?.framework_name} / {obs.audit_procedures?.framework_mapping?.reference_code}</span>
                          <span>•</span>
                          <span>{obs.audit_procedures?.framework_mapping?.risk_categories?.category_name}</span>
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
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {selectedObs.audit_procedures?.framework_mapping?.framework_name} • {selectedObs.audit_procedures?.framework_mapping?.reference_code}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.5rem', lineHeight: '1.3' }}>{selectedObs.condition}</h2>
              </div>
              <button className="close-btn" onClick={() => setSelectedObs(null)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
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
                      <User size={16} color="var(--text-secondary)" />
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
                <div className="management-section" style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--accent-blue)' }}>
                    <Plus size={20} />
                    <h3 style={{ textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: '700' }}>Submit Management Response</h3>
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
            <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={async (e) => {
              e.preventDefault()
              const { error } = await supabase.from('audit_observations').insert([newObs])
              if (!error) {
                setShowNewModal(false)
                setNewObs({
                  procedure_id: '',
                  condition: '',
                  criteria: '',
                  cause: '',
                  effect: '',
                  recommendation: '',
                  risk_rating: 'Low'
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
                  placeholder="What is the required standard?"
                  value={newObs.criteria}
                  onChange={e => setNewObs({ ...newObs, criteria: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                  <label className="detail-label">Cause</label>
                  <input
                    className="form-control"
                    placeholder="Root cause..."
                    value={newObs.cause}
                    onChange={e => setNewObs({ ...newObs, cause: e.target.value })}
                  />
                </div>
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

              <button
                type="submit"
                style={{
                  background: 'var(--accent-blue)',
                  color: '#fff',
                  border: 'none',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '700',
                  marginTop: '1rem'
                }}
              >
                Save Observation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
