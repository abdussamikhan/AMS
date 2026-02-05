import React from 'react'
import {
    LayoutDashboard,
    CheckCircle2,
    Grid,
    ShieldAlert,
    ClipboardList,
    BarChart3,
    TrendingUp,
    Shield,
    ChevronDown,
    ChevronRight,
    Settings,
    Database as DatabaseIcon,
    Layout,
    LogOut
} from 'lucide-react'
import type { Profile } from '../types'

interface SidebarProps {
    activeView: string
    setActiveView: (view: string) => void
    isAdminExpanded: boolean
    setIsAdminExpanded: (expanded: boolean) => void
    profile: Profile | null
    session: any
    handleLogout: () => Promise<void>
}

export const Sidebar: React.FC<SidebarProps> = ({
    activeView,
    setActiveView,
    isAdminExpanded,
    setIsAdminExpanded,
    profile,
    session,
    handleLogout,
}) => {
    return (
        <aside className="sidebar">
            <div className="logo">AuditAce</div>
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
                    Audit Observations
                </div>
                <div
                    className={`nav-link ${activeView === 'rcm' ? 'active' : ''}`}
                    onClick={() => setActiveView('rcm')}
                >
                    <Grid />
                    Risk Control Matrix
                </div>
                <div
                    className={`nav-link ${activeView === 'risk-register' ? 'active' : ''}`}
                    onClick={() => setActiveView('risk-register')}
                >
                    <ShieldAlert />
                    Risk Register
                </div>
                <div
                    className={`nav-link ${activeView === 'audit-planning' ? 'active' : ''}`}
                    onClick={() => setActiveView('audit-planning')}
                >
                    <ClipboardList />
                    Audit Planning
                </div>
                <div className="nav-link">
                    <BarChart3 />
                    Reporting
                </div>
                <div
                    className={`nav-link ${activeView === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveView('analytics')}
                >
                    <TrendingUp />
                    Data Analytics
                </div>
                {profile?.role === 'admin' && (
                    <>
                        <div
                            className={`nav-link ${activeView.startsWith('admin') ? 'active' : ''}`}
                            onClick={() => setIsAdminExpanded(!isAdminExpanded)}
                            style={{ justifyContent: 'space-between', cursor: 'pointer' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Shield />
                                Admin
                            </div>
                            {isAdminExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </div>

                        {isAdminExpanded && (
                            <div style={{ marginLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <div
                                    className={`nav-link ${activeView === 'admin-setup' ? 'active' : ''}`}
                                    onClick={() => setActiveView('admin-setup')}
                                    style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                                >
                                    <Settings size={16} />
                                    Setup
                                </div>
                                <div
                                    className={`nav-link ${activeView === 'admin-references' ? 'active' : ''}`}
                                    onClick={() => setActiveView('admin-references')}
                                    style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                                >
                                    <DatabaseIcon size={16} />
                                    References
                                </div>
                                <div
                                    className={`nav-link ${activeView === 'admin-templates' ? 'active' : ''}`}
                                    onClick={() => setActiveView('admin-templates')}
                                    style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                                >
                                    <Layout size={16} />
                                    Templates
                                </div>
                            </div>
                        )}
                    </>
                )}
            </nav>

            <div className="logout-container">
                <div className="logout-btn" onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '0 1rem' }}>
                    <div style={{ fontWeight: '600', color: '#fff' }}>{profile?.full_name || session?.user?.email}</div>
                    <div style={{ textTransform: 'capitalize' }}>{profile?.role || 'User'}</div>
                </div>
            </div>
        </aside>
    )
}
