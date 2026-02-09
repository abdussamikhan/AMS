import React from 'react'
import {
    LayoutDashboard,
    CheckCircle2,
    ClipboardList,
    BarChart3,
    TrendingUp,
    Shield,
    Target,
    FileText,
    LogOut
} from 'lucide-react'
import type { Profile } from '../types'

interface SidebarProps {
    activeView: string
    setActiveView: (view: string) => void
    profile: Profile | null
    session: any
    handleLogout: () => Promise<void>
}

export const Sidebar: React.FC<SidebarProps> = ({
    activeView,
    setActiveView,
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
                    className={`nav-link ${activeView === 'risk-assessment' ? 'active' : ''}`}
                    onClick={() => setActiveView('risk-assessment')}
                >
                    <Target />
                    Risk Assessment
                </div>

                <div
                    className={`nav-link ${activeView === 'audit-planning' ? 'active' : ''}`}
                    onClick={() => setActiveView('audit-planning')}
                >
                    <ClipboardList />
                    Audit Plan
                </div>

                <div
                    className={`nav-link ${activeView === 'audit-program' ? 'active' : ''}`}
                    onClick={() => setActiveView('audit-program')}
                >
                    <FileText />
                    Audit Program
                </div>

                <div
                    className={`nav-link ${activeView === 'findings' ? 'active' : ''}`}
                    onClick={() => setActiveView('findings')}
                >
                    <CheckCircle2 />
                    Audit Observations
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
                    <div
                        className={`nav-link ${activeView === 'admin' ? 'active' : ''}`}
                        onClick={() => setActiveView('admin')}
                    >
                        <Shield />
                        Admin
                    </div>
                )}
            </nav>

            <div className="logout-container">
                <div className="logout-btn" onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '0 1rem' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{profile?.full_name || session?.user?.email}</div>
                    <div style={{ textTransform: 'capitalize' }}>{profile?.role || 'User'}</div>
                </div>
            </div>
        </aside>
    )
}
