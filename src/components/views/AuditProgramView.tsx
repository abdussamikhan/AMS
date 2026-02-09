import React, { useState } from 'react';
import {
    ClipboardList,
    Plus,
    Search,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Clock,
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    Activity,
    Shield
} from 'lucide-react';
import type { AuditProgram, RiskRegisterEntry } from '../../types';

interface AuditProgramViewProps {
    auditPrograms: AuditProgram[];
    isDataLoading: boolean;
    selectedProgram: AuditProgram | null;
    setSelectedProgram: (program: AuditProgram | null) => void;
    fetchProgramDetails: (id: string) => Promise<void>;
    updateProcedureStatus: (pId: string, status: 'Pending' | 'Passed' | 'Failed', tId: string) => Promise<void>;
    addProcedureToTest: (tId: string, name: string, desc: string, ev: string) => Promise<void>;
    addTestToProgram: (pId: string, rId: string) => Promise<void>;
    handleToggleObservation: (tId: string, issue: boolean) => Promise<void>;
    riskRegisterEntries: RiskRegisterEntry[];
}

export const AuditProgramView: React.FC<AuditProgramViewProps> = ({
    auditPrograms,
    isDataLoading,
    selectedProgram,
    setSelectedProgram,
    fetchProgramDetails,
    updateProcedureStatus,
    addProcedureToTest,
    addTestToProgram,
    handleToggleObservation,
    riskRegisterEntries
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddProcedure, setShowAddProcedure] = useState<string | null>(null); // testId
    const [showLinkRiskModal, setShowLinkRiskModal] = useState(false);
    const [newProc, setNewProc] = useState({ name: '', desc: '', ev: '' });

    const filteredPrograms = auditPrograms.filter(p =>
        p.audits?.audit_title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed': return <CheckCircle2 size={16} color="var(--success)" />;
            case 'In Progress': return <Activity size={16} color="var(--accent-blue)" />;
            default: return <Clock size={16} color="var(--text-secondary)" />;
        }
    };

    const getRollupBadge = (status: string) => {
        let color = 'var(--text-secondary)';
        let bg = 'rgba(107, 114, 128, 0.1)';

        if (status === 'Implemented' || status === 'Mitigated') {
            color = 'var(--success)';
            bg = 'rgba(34, 197, 94, 0.1)';
        } else if (status === 'Partially Implemented' || status === 'Partially Mitigated') {
            color = 'var(--accent-orange)';
            bg = 'rgba(249, 115, 22, 0.1)';
        } else if (status === 'Not Implemented' || status === 'Not Mitigated') {
            color = 'var(--accent-red)';
            bg = 'rgba(239, 68, 68, 0.1)';
        }

        return (
            <span style={{
                padding: '0.25rem 0.6rem',
                borderRadius: '1rem',
                fontSize: '0.7rem',
                fontWeight: '600',
                background: bg,
                color: color,
                border: `1px solid ${color}33`
            }}>
                {status}
            </span>
        );
    };

    if (selectedProgram) {
        return (
            <div className="program-detail-view fade-in">
                <div className="section-title" style={{ marginBottom: '2rem', gap: '1rem' }}>
                    <button
                        onClick={() => setSelectedProgram(null)}
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem', minWidth: 'auto' }}
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '1.5rem' }}>{selectedProgram.audits?.audit_title}</h2>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Audit Program Workflow</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {getStatusIcon(selectedProgram.status)}
                        <span style={{ fontWeight: '600' }}>{selectedProgram.status}</span>
                    </div>
                </div>

                <div className="program-content">
                    {selectedProgram.tests?.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--glass-bg)', borderRadius: '1rem' }}>
                            <ClipboardList size={48} color="var(--text-secondary)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                            <p style={{ color: 'var(--text-secondary)' }}>No risk-control pairs linked to this program yet.</p>
                            <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowLinkRiskModal(true)}>Link Risks from Register</button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button className="btn btn-secondary" onClick={() => setShowLinkRiskModal(true)}>
                                    <Plus size={14} /> Link Another Risk
                                </button>
                            </div>
                            {selectedProgram.tests?.map((test) => (
                                <div key={test.id} className="test-card" style={{
                                    background: 'var(--glass-bg)',
                                    borderRadius: '1rem',
                                    border: '1px solid var(--border-color)',
                                    overflow: 'hidden'
                                }}>
                                    <div className="test-header" style={{
                                        padding: '1.25rem',
                                        borderBottom: '1px solid var(--border-color)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        background: 'rgba(255,255,255,0.02)'
                                    }}>
                                        <div>
                                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                {getRollupBadge(test.control_status)}
                                                {getRollupBadge(test.risk_status)}
                                            </div>
                                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{test.risk_register?.risk_title}</h3>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '800px' }}>
                                                <strong>Control:</strong> {test.risk_register?.control_description}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Issue Observation</span>
                                                <input
                                                    type="checkbox"
                                                    checked={test.issue_observation}
                                                    onChange={(e) => handleToggleObservation(test.id, e.target.checked)}
                                                    style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
                                                />
                                            </div>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                                                onClick={() => setShowAddProcedure(test.id)}
                                            >
                                                <Plus size={14} /> Add Step
                                            </button>
                                        </div>
                                    </div>

                                    <div className="test-procedures" style={{ padding: '1.25rem' }}>
                                        {test.procedures?.length === 0 ? (
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                                No test procedures defined for this control.
                                            </p>
                                        ) : (
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                                                        <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Step / Procedure</th>
                                                        <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Evidence Req.</th>
                                                        <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</th>
                                                        <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {test.procedures?.map((proc) => (
                                                        <tr key={proc.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                            <td style={{ padding: '1rem 0.75rem' }}>
                                                                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{proc.procedure_name}</div>
                                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{proc.description}</div>
                                                            </td>
                                                            <td style={{ padding: '1rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                                {proc.evidence_requirements || '-'}
                                                            </td>
                                                            <td style={{ padding: '1rem 0.75rem' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                    {proc.status === 'Passed' ? <CheckCircle size={14} color="var(--success)" /> :
                                                                        proc.status === 'Failed' ? <XCircle size={14} color="var(--accent-red)" /> :
                                                                            <Clock size={14} color="var(--text-secondary)" />}
                                                                    <span style={{ fontSize: '0.875rem' }}>{proc.status}</span>
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '1rem 0.75rem' }}>
                                                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                                    <button
                                                                        onClick={() => updateProcedureStatus(proc.id, 'Passed', test.id)}
                                                                        className="btn btn-secondary"
                                                                        style={{ padding: '0.3rem', minWidth: 'auto', color: proc.status === 'Passed' ? 'var(--success)' : 'inherit' }}
                                                                    >
                                                                        Pass
                                                                    </button>
                                                                    <button
                                                                        onClick={() => updateProcedureStatus(proc.id, 'Failed', test.id)}
                                                                        className="btn btn-secondary"
                                                                        style={{ padding: '0.3rem', minWidth: 'auto', color: proc.status === 'Failed' ? 'var(--accent-red)' : 'inherit' }}
                                                                    >
                                                                        Fail
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add Procedure Modal (Inline simplified) */}
                {showAddProcedure && (
                    <div className="modal-overlay" onClick={() => setShowAddProcedure(null)}>
                        <div className="modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Add Test Procedure</h2>
                                <button className="close-btn" onClick={() => setShowAddProcedure(null)}><Plus style={{ transform: 'rotate(45deg)' }} /></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    await addProcedureToTest(showAddProcedure, newProc.name, newProc.desc, newProc.ev);
                                    setNewProc({ name: '', desc: '', ev: '' });
                                    setShowAddProcedure(null);
                                }}>
                                    <div className="form-group">
                                        <label>Procedure Name</label>
                                        <input
                                            className="form-control"
                                            value={newProc.name}
                                            onChange={e => setNewProc({ ...newProc, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Steps/Description</label>
                                        <textarea
                                            className="form-control"
                                            value={newProc.desc}
                                            onChange={e => setNewProc({ ...newProc, desc: e.target.value })}
                                            rows={3}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Evidence Requirements</label>
                                        <input
                                            className="form-control"
                                            value={newProc.ev}
                                            onChange={e => setNewProc({ ...newProc, ev: e.target.value })}
                                            placeholder="e.g. Sample of 25 transactions"
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Add Procedure</button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Link Risk Modal */}
                {showLinkRiskModal && (
                    <div className="modal-overlay" onClick={() => setShowLinkRiskModal(false)}>
                        <div className="modal-content" style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Shield size={24} color="var(--accent-blue)" />
                                    <h2>Link Risks from Register</h2>
                                </div>
                                <button className="close-btn" onClick={() => setShowLinkRiskModal(false)}><Plus style={{ transform: 'rotate(45deg)' }} /></button>
                            </div>
                            <div className="modal-body">
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                                    Select risk-control pairs from the Risk Register to include in this audit program.
                                </p>
                                <div className="risk-selection-list" style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {riskRegisterEntries.map(risk => {
                                        const isAlreadyLinked = selectedProgram.tests?.some(t => t.risk_register_id === risk.id);
                                        return (
                                            <div key={risk.id} style={{
                                                padding: '1rem',
                                                background: 'rgba(255,255,255,0.02)',
                                                borderRadius: '0.75rem',
                                                border: '1px solid var(--border-color)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                opacity: isAlreadyLinked ? 0.5 : 1
                                            }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{risk.risk_title}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                        <strong>Control:</strong> {risk.control_title}
                                                    </div>
                                                </div>
                                                {isAlreadyLinked ? (
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: '600' }}>Linked</span>
                                                ) : (
                                                    <button
                                                        className="btn btn-secondary"
                                                        style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                                                        onClick={() => addTestToProgram(selectedProgram.id, risk.id)}
                                                    >
                                                        Link Risk
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <section className="audit-program-section fade-in">
            <div className="section-title" style={{ justifyContent: 'space-between', width: '100%', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ClipboardList size={24} color="var(--accent-blue)" />
                    <h2>Audit Program Management</h2>
                </div>
            </div>

            <div className="search-bar" style={{ marginBottom: '2rem', position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                    type="text"
                    placeholder="Search by engagement title..."
                    className="form-control"
                    style={{ paddingLeft: '3rem' }}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {isDataLoading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="spinner" style={{ marginBottom: '1rem' }}></div>
                    <p style={{ color: 'var(--text-secondary)' }}>Loading audit programs...</p>
                </div>
            ) : filteredPrograms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--glass-bg)', borderRadius: '1rem' }}>
                    <AlertCircle size={48} color="var(--text-secondary)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>No audit programs found.</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Create programs from the Audit Plan view.</p>
                </div>
            ) : (
                <div className="programs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {filteredPrograms.map((program) => (
                        <div key={program.id} className="program-card" onClick={() => fetchProgramDetails(program.id)} style={{
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            position: 'relative'
                        }}>
                            <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem' }}>
                                {getStatusIcon(program.status)}
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', paddingRight: '2rem' }}>{program.audits?.audit_title}</h3>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '0.4rem' }}>
                                    Engagement Program
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--accent-blue)' }}>Open Program</span>
                                <ChevronRight size={18} color="var(--accent-blue)" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};
