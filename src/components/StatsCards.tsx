import React from 'react'

interface StatsCardsProps {
    stats: {
        total: number
        critical: number
        high: number
        medium: number
    }
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
    return (
        <div className="stats-grid" style={{ flex: 1, marginBottom: 0 }}>
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
    )
}
