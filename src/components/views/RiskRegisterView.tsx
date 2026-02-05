import React from 'react';
import { Search, Plus, Trash2, ShieldAlert } from 'lucide-react';
import type { RiskRegisterEntry } from '../../types';
import { getScoreColor } from '../../utils/uiHelpers';

interface RiskRegisterViewProps {
    riskRegisterFilters: {
        search: string;
        category: string;
        owner: string;
        year: string;
    };
    setRiskRegisterFilters: (filters: any) => void;
    riskCats: any[];
    riskRegisterEntries: RiskRegisterEntry[];
    setIsEditingRisk: (isEditing: boolean) => void;
    setCurrentRiskId: (id: string | null) => void;
    setNewRiskEntry: (entry: any) => void;
    setShowNewRiskModal: (show: boolean) => void;
    handleDeleteRisk: (id: string) => Promise<void>;
}

export const RiskRegisterView: React.FC<RiskRegisterViewProps> = ({
    riskRegisterFilters,
    setRiskRegisterFilters,
    riskCats,
    riskRegisterEntries,
    setIsEditingRisk,
    setCurrentRiskId,
    setNewRiskEntry,
    setShowNewRiskModal,
    handleDeleteRisk
}) => {
    // Get unique owners
    const owners = Array.from(new Set(riskRegisterEntries.map(entry => entry.risk_owner).filter(Boolean)));

    return (
        <div className="risk-register-view">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 140px 140px auto', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: 'var(--glass-bg)', borderRadius: '0.75rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 1rem', height: '42px' }}>
                    <Search size={18} color="var(--text-secondary)" style={{ minWidth: '18px' }} />
                    <input
                        type="text"
                        placeholder="Search risks or controls..."
                        value={riskRegisterFilters.search}
                        onChange={e => setRiskRegisterFilters({ ...riskRegisterFilters, search: e.target.value })}
                        style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', marginLeft: '0.8rem', flex: 1 }}
                    />
                </div>
                <select
                    className="form-control"
                    value={riskRegisterFilters.category}
                    onChange={e => setRiskRegisterFilters({ ...riskRegisterFilters, category: e.target.value })}
                >
                    <option value="all">All Categories</option>
                    {riskCats.map(cat => <option key={cat.risk_id} value={cat.risk_id}>{cat.category_name}</option>)}
                </select>

                <select
                    className="form-control"
                    value={riskRegisterFilters.owner}
                    onChange={e => setRiskRegisterFilters({ ...riskRegisterFilters, owner: e.target.value })}
                >
                    <option value="all">All Owners</option>
                    {owners.map((owner, idx) => <option key={idx} value={owner}>{owner}</option>)}
                </select>

                <select
                    className="form-control"
                    value={riskRegisterFilters.year}
                    onChange={e => setRiskRegisterFilters({ ...riskRegisterFilters, year: e.target.value })}
                >
                    {[...Array(5)].map((_, i) => {
                        const y = (new Date().getFullYear() - 2 + i).toString();
                        return <option key={y} value={y}>{y} FY</option>
                    })}
                </select>
                <button
                    className="btn btn-primary"
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
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', height: '42px', padding: '0 1.25rem' }}
                >
                    <Plus size={18} /> New Risk Assessment
                </button>
            </div>

            <div style={{ background: 'var(--card-bg)', borderRadius: '1rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', width: '40%' }}>Risk Details</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', width: '40%' }}>Desired Control</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', textAlign: 'center', width: '5%' }}>Inherent Risk Score</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', textAlign: 'center', width: '5%' }}>Residual Risk Score</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', width: '5%' }}>Audit Frequency</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', textAlign: 'right', width: '5%' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {riskRegisterEntries
                            .filter(entry => {
                                const matchesSearch = entry.risk_title?.toLowerCase().includes(riskRegisterFilters.search.toLowerCase()) ||
                                    entry.risk_description?.toLowerCase().includes(riskRegisterFilters.search.toLowerCase()) ||
                                    entry.control_title?.toLowerCase().includes(riskRegisterFilters.search.toLowerCase()) ||
                                    entry.control_description?.toLowerCase().includes(riskRegisterFilters.search.toLowerCase());
                                const matchesCategory = riskRegisterFilters.category === 'all' || entry.risk_category_id === riskRegisterFilters.category;
                                const matchesOwner = riskRegisterFilters.owner === 'all' || entry.risk_owner === riskRegisterFilters.owner;
                                const matchesYear = riskRegisterFilters.year === 'all' || entry.fiscal_year.toString() === riskRegisterFilters.year;
                                return matchesSearch && matchesCategory && matchesOwner && matchesYear;
                            })
                            .map((entry) => {
                                const inherentScore = entry.inherent_likelihood * entry.inherent_impact;
                                const residualScore = entry.residual_likelihood * entry.residual_impact;

                                return (
                                    <tr key={entry.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <td style={{ padding: '1.25rem' }}>
                                            <div style={{ fontWeight: '600', color: '#fff', marginBottom: '0.25rem', fontSize: '0.85rem' }}>{entry.risk_title}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{entry.risk_description}</div>
                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', background: 'rgba(59,130,246,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                                    {entry.risk_categories?.category_name}
                                                </span>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                                                    Owner: {entry.risk_owner}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem' }}>
                                            {entry.control_title && (
                                                <div style={{ fontWeight: '500', fontSize: '0.85rem', marginBottom: '0.25rem', color: '#e2e8f0' }}>
                                                    {entry.control_title}
                                                </div>
                                            )}
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                                {entry.control_description || '-'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                                            <div style={{
                                                display: 'inline-flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '8px',
                                                background: getScoreColor(inherentScore),
                                                color: '#fff',
                                                fontWeight: '700'
                                            }}>
                                                {inherentScore}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                                            <div style={{
                                                display: 'inline-flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '8px',
                                                background: getScoreColor(residualScore),
                                                color: '#fff',
                                                fontWeight: '700'
                                            }}>
                                                {residualScore}
                                            </div>
                                        </td>

                                        <td style={{ padding: '1.25rem' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', background: 'rgba(139,92,246,0.1)', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>
                                                {entry.audit_frequency || '12 months'}
                                            </span>
                                        </td>

                                        <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleDeleteRisk(entry.id)}
                                                className="btn btn-secondary"
                                                style={{ padding: '0.4rem', color: 'var(--accent-red)' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        {riskRegisterEntries.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    <ShieldAlert size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                    <div>No risks identified for this fiscal year.</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
