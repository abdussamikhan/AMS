import { Bell, Clock, Sun, Moon } from 'lucide-react'
import { supabase } from '../supabase'
import type { Session } from '@supabase/supabase-js'
import type { Notification } from '../types'

interface HeaderProps {
    activeView: string
    showNotifications: boolean
    setShowNotifications: (show: boolean) => void
    notifications: Notification[]
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>
    markAsRead: (id: string) => void
    session: Session | null
    theme: 'light' | 'dark'
    toggleTheme: () => void
    children?: React.ReactNode
}

export const Header: React.FC<HeaderProps> = ({
    activeView,
    showNotifications,
    setShowNotifications,
    notifications,
    setNotifications,
    markAsRead,
    session,
    theme,
    toggleTheme,
    children
}) => {
    const getHeaderTitle = () => {
        switch (activeView) {
            case 'overview': return 'Audit Overview'
            case 'rcm': return 'Risk Control Catalogue'
            case 'risk-assessment': return 'Risk Assessment'
            case 'audit-planning': return 'Audit Plan'
            case 'risk-register': return 'Risk Register'
            case 'analytics': return 'Data Analytics'
            case 'admin-setup': return 'Organization Setup'
            case 'admin-references': return 'Reference Documents'
            case 'admin-templates': return 'Audit Templates'
            case 'admin': return 'System Administration'
            case 'audit-program': return 'Audit Program'
            default: return 'Audit Observations'
        }
    }

    const getHeaderSubtitle = () => {
        switch (activeView) {
            case 'overview': return 'High-level risk distribution and analytics'
            case 'rcm': return 'Map risks to internal controls across the organization'
            case 'risk-assessment': return 'Comprehensive risk identification and control mapping'
            case 'risk-register': return 'Identify, assess, and monitor organizational risks'
            case 'audit-planning': return 'Manage annual audit plans and schedule engagements'
            case 'analytics': return 'Advanced insights and trends across audit observations and controls'
            case 'admin-setup': return 'Manage industries, functions, and departments'
            case 'admin-references': return 'Upload and manage reference documents, standards, and policies'
            case 'admin-templates': return 'Upload and manage audit report templates'
            case 'admin': return 'Setup of System Parameters and Templates'
            case 'audit-program': return 'Manage audit test procedures and automated status rollups'
            default: return 'Detailed list of organizational audit observations'
        }
    }

    const handleMarkAllAsRead = async () => {
        if (!session?.user?.id) return;
        const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', session.user.id);
        if (!error) setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }

    return (
        <header className="header" style={{ marginBottom: (activeView === 'findings' || activeView === 'risk-register' || activeView === 'risk-assessment') ? '2rem' : '3rem' }}>
            <div>
                <h1>{getHeaderTitle()}</h1>
                <p style={{ color: 'var(--text-secondary)' }}>{getHeaderSubtitle()}</p>
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
                            border: '2px solid var(--bg-color)'
                        }}>
                            {notifications.filter(n => !n.is_read).length}
                        </span>
                    )}

                    {showNotifications && (
                        <div style={{
                            position: 'absolute',
                            top: '40px',
                            right: '0',
                            width: '320px',
                            maxHeight: '450px',
                            background: 'var(--dropdown-bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '0.75rem',
                            boxShadow: '0 20px 25px -5px var(--shadow-color)',
                            zIndex: 1000,
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }} onClick={e => e.stopPropagation()}>
                            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '700' }}>Notifications</span>
                                <span
                                    style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', cursor: 'pointer' }}
                                    onClick={handleMarkAllAsRead}
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
                                                <div style={{ fontWeight: '600', fontSize: '0.875rem', color: n.is_read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{n.title}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{n.message}</div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <Clock size={10} /> {n.created_at ? new Date(n.created_at).toISOString().split('T')[1].substring(0, 5) : '--:--'}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div
                    onClick={toggleTheme}
                    style={{
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        color: 'var(--text-secondary)'
                    }}
                    title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                >
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                {children}
            </div>
        </header>
    )
}
