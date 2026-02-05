import React from 'react';
import { Search, Plus, Edit3, Trash2 } from 'lucide-react';
import type { RCMEntry } from '../../types';

interface RcmViewProps {
    rcmFilters: {
        search: string;
        industry: string;
        function: string;
        department: string;
        system: string;
        category: string;
        frequency: string;
    };
    setRcmFilters: (filters: any) => void;
    industries: any[];
    allFunctions: any[];
    allDepartments: any[];
    allSystems: any[];
    riskCats: any[];
    rcmEntries: RCMEntry[];
    openEditRcmModal: (entry: RCMEntry) => void;
    handleDeleteRcm: (id: string) => Promise<void>;
    setIsEditingRcm: (isEditing: boolean) => void;
    setCurrentRcmId: (id: string | null) => void;
    setNewRcm: (rcm: any) => void;
    setShowNewRcmModal: (show: boolean) => void;
}

export const RcmView: React.FC<RcmViewProps> = ({
    rcmFilters,
    setRcmFilters,
    industries,
    allFunctions,
    allDepartments,
    allSystems,
    riskCats,
    rcmEntries,
    openEditRcmModal,
    handleDeleteRcm,
    setIsEditingRcm,
    setCurrentRcmId,
    setNewRcm,
    setShowNewRcmModal
}) => {
    return (
        <div className="rcm-view">
            {/* Filters Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 130px 130px 130px 130px 130px 130px auto', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                <div style={{ background: 'var(--glass-bg)', borderRadius: '0.75rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 0.75rem', height: '38px' }}>
                    <Search size={16} color="var(--text-secondary)" style={{ minWidth: '16px' }} />
                    <input
                        type="text"
                        placeholder="Search risks..."
                        style={{
                            background: 'transparent',
                            border: 'none',
                            boxShadow: 'none',
                            flex: 1,
                            minWidth: 0,
                            marginLeft: '0.4rem',
                            height: '100%',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem',
                            outline: 'none'
                        }}
                        value={rcmFilters.search}
                        onChange={e => setRcmFilters({ ...rcmFilters, search: e.target.value })}
                    />
                </div>
                <select
                    className="form-control form-control-sm"
                    value={rcmFilters.industry}
                    onChange={e => setRcmFilters({ ...rcmFilters, industry: e.target.value })}
                >
                    <option value="all">Industries</option>
                    {industries.filter(i => i.is_active !== false).map(i => <option key={i.industry_id} value={i.industry_id}>{i.industry_name}</option>)}
                </select>
                <select
                    className="form-control form-control-sm"
                    value={rcmFilters.function}
                    onChange={e => setRcmFilters({ ...rcmFilters, function: e.target.value })}
                >
                    <option value="all">Functions</option>
                    {allFunctions.filter(f => f.is_active !== false).map(f => <option key={f.function_id} value={f.function_id}>{f.function_name}</option>)}
                </select>
                <select
                    className="form-control form-control-sm"
                    value={rcmFilters.department}
                    onChange={e => setRcmFilters({ ...rcmFilters, department: e.target.value })}
                >
                    <option value="all">Departments</option>
                    {allDepartments
                        .filter(d => (rcmFilters.function === 'all' || !rcmFilters.function || d.function_id === rcmFilters.function) && d.is_active !== false)
                        .map(d => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)
                    }
                </select>
                <select
                    className="form-control form-control-sm"
                    value={rcmFilters.system}
                    onChange={e => setRcmFilters({ ...rcmFilters, system: e.target.value })}
                >
                    <option value="all">Systems</option>
                    {allSystems.map(s => <option key={s.system_id} value={s.system_id}>{s.system_name}</option>)}
                </select>
                <select
                    className="form-control form-control-sm"
                    value={rcmFilters.category}
                    onChange={e => setRcmFilters({ ...rcmFilters, category: e.target.value })}
                >
                    <option value="all">Categories</option>
                    {riskCats.map(c => <option key={c.risk_id} value={c.risk_id}>{c.category_name}</option>)}
                </select>
                <select
                    className="form-control form-control-sm"
                    value={rcmFilters.frequency}
                    onChange={e => setRcmFilters({ ...rcmFilters, frequency: e.target.value })}
                >
                    <option value="all">Frequency</option>
                    <option value="Continuous">Continuous</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annual">Annual</option>
                </select>
                <button
                    className="btn btn-primary"
                    onClick={() => {
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
                            control_type: 'Preventive',
                            control_frequency: 'Continuous',
                            system_id: ''
                        })
                        setShowNewRcmModal(true)
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap', height: '38px', padding: '0 1rem', fontSize: '0.85rem' }}
                >
                    <Plus size={16} /> New Control
                </button>
            </div>

            {/* RCM Table */}
            <div style={{ background: 'var(--card-bg)', borderRadius: '1rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', width: '20%' }}>Function / Department</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', width: '25%' }}>Risk Scenario</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', width: '25%' }}>Control Activity</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', width: '20%' }}>Category / Frequency</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', width: '10%', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rcmEntries
                            .filter(entry => {
                                const matchesSearch = entry.risk_description?.toLowerCase().includes(rcmFilters.search.toLowerCase()) ||
                                    entry.control_description?.toLowerCase().includes(rcmFilters.search.toLowerCase()) ||
                                    entry.reference_standard?.toLowerCase().includes(rcmFilters.search.toLowerCase())
                                const matchesIndustry = rcmFilters.industry === 'all' || entry.industry_id === rcmFilters.industry
                                const matchesFunction = rcmFilters.function === 'all' || entry.function_id === rcmFilters.function
                                const matchesDepartment = rcmFilters.department === 'all' || !rcmFilters.department || entry.department_id === rcmFilters.department
                                const matchesSystem = rcmFilters.system === 'all' || !rcmFilters.system || entry.system_id === rcmFilters.system
                                const matchesCategory = rcmFilters.category === 'all' || entry.risk_category_id === rcmFilters.category
                                const matchesFrequency = rcmFilters.frequency === 'all' || entry.control_frequency === rcmFilters.frequency
                                return matchesSearch && matchesIndustry && matchesFunction && matchesDepartment && matchesSystem && matchesCategory && matchesFrequency
                            })
                            .map((entry) => (
                                <tr key={entry.rcm_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--accent-blue)' }}>{entry.functions?.function_name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', marginTop: '0.25rem' }}>{entry.departments?.department_name}</div>
                                    </td>
                                    <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                                        {entry.risk_title && <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--accent-blue)', marginBottom: '0.25rem' }}>{entry.risk_title}</div>}
                                        <div style={{ fontWeight: '500', fontSize: '0.9rem', lineHeight: '1.5' }}>{entry.risk_description}</div>
                                    </td>
                                    <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                                        {entry.control_title && <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--accent-blue)', marginBottom: '0.25rem' }}>{entry.control_title}</div>}
                                        <div style={{ fontSize: '0.875rem' }}>{entry.control_description}</div>
                                        {entry.reference_standard && <div style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', marginTop: '0.25rem' }}>Ref: {entry.reference_standard}</div>}
                                    </td>
                                    <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                                        <div style={{ display: 'inline-flex' }}>
                                            <span className="badge badge-low" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', border: '1px solid rgba(59, 130, 246, 0.2)', fontSize: '0.7rem' }}>
                                                {entry.risk_categories?.category_name}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{entry.control_frequency}</div>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => openEditRcmModal(entry)}
                                                className="btn btn-secondary"
                                                style={{ padding: '0.4rem', minWidth: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                title="Edit"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteRcm(entry.rcm_id)}
                                                className="btn btn-secondary"
                                                style={{ padding: '0.4rem', minWidth: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-red)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
