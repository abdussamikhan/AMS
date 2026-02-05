import React from 'react';
import { Search, Plus, Trash2, ShieldAlert } from 'lucide-react';
import type { RiskRegisterEntry } from '../../types';
import { getScoreColor } from '../../utils/uiHelpers';

interface RiskRegisterViewProps {
    riskRegisterFilters: {
        search: string;
        category: string;
        status: string;
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
    return (
        <div className="risk-register-view">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 180px 140px auto', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: 'var(--glass-bg)', borderRadius: '0.75rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 1rem', height: '42px' }}>
                    <Search size={18} color="var(--text-secondary)" style={{ minWidth: '18px' }} />
                    <input
                        type="text"
                        placeholder="Search risks by title or description..."
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
                    value={riskRegisterFilters.status}
                    onChange={e => setRiskRegisterFilters({ ...riskRegisterFilters, status: e.target.value })}
                >
                    <option value="all">All Statuses</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Mitigated">Mitigated</option>
                    <option value="Closed">Closed</option>
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
                            mitigation_strategy: 'Mitigate',
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
                            <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Risk Details</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Owner / Year</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', textAlign: 'center' }}>Inherent</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', textAlign: 'center' }}>Residual</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Strategy</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Status</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {riskRegisterEntries
                            .filter(entry => {
                                const matchesSearch = entry.risk_title?.toLowerCase().includes(riskRegisterFilters.search.toLowerCase()) ||
                                    entry.risk_description?.toLowerCase().includes(riskRegisterFilters.search.toLowerCase());
                                const matchesCategory = riskRegisterFilters.category === 'all' || entry.risk_category_id === riskRegisterFilters.category;
                                const matchesStatus = riskRegisterFilters.status === 'all' || entry.status === riskRegisterFilters.status;
                                const matchesYear = riskRegisterFilters.year === 'all' || entry.fiscal_year.toString() === riskRegisterFilters.year;
                                return matchesSearch && matchesCategory && matchesStatus && matchesYear;
                            })
                            .map((entry) => {
                                const inherentScore = entry.inherent_likelihood * entry.inherent_impact;
                                const residualScore = entry.residual_likelihood * entry.residual_impact;

                                return (
                                    <tr key={entry.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <td style={{ padding: '1.25rem' }}>
                                            <div style={{ fontWeight: '600', color: '#fff', marginBottom: '0.25rem' }}>{entry.risk_title}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{entry.risk_description}</div>
                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', background: 'rgba(59,130,246,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                                    {entry.risk_categories?.category_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem' }}>
                                            <div style={{ fontWeight: '500', fontSize: '0.85rem' }}>{entry.risk_owner}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>FY{entry.fiscal_year}</div>
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
                                            <span className={`badge badge-${entry.mitigation_strategy.toLowerCase()}`} style={{ fontSize: '0.75rem' }}>
                                                {entry.mitigation_strategy}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.25rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.status === 'Closed' ? '#10b981' : '#f59e0b' }}></div>
                                                {entry.status}
                                            </div>
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
                                <td colSpan={7} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
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
