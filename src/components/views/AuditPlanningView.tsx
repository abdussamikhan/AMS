import React from 'react';
import { ClipboardList, Calendar, Clock, User as UserIcon } from 'lucide-react';
import type { AuditPlan, AuditEngagement, AuditProgram } from '../../types';

interface AuditPlanningViewProps {
    auditPlans: AuditPlan[];
    selectedPlanId: string | null;
    setSelectedPlanId: (id: string | null) => void;
    audits: AuditEngagement[];
    setActiveView: (view: string) => void;
    setSearchQuery: (query: string) => void;
    createAuditProgram: (auditId: string) => Promise<AuditProgram | undefined>;
    auditPrograms: AuditProgram[];
}

export const AuditPlanningView: React.FC<AuditPlanningViewProps> = ({
    auditPlans,
    selectedPlanId,
    setSelectedPlanId,
    audits,
    setActiveView,
    setSearchQuery,
    createAuditProgram,
    auditPrograms
}) => {
    const getProgramForAudit = (auditId: string) => {
        return auditPrograms.find(p => p.audit_id === auditId);
    };
    return (
        <div className="audit-planning-view">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Plan Selection Dropdown */}
                <div>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ClipboardList size={20} color="var(--accent-blue)" /> Annual Plans
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Select Plan:</span>
                        <select
                            className="form-control"
                            style={{ maxWidth: '400px', cursor: 'pointer' }}
                            value={selectedPlanId || ''}
                            onChange={(e) => setSelectedPlanId(e.target.value)}
                        >
                            {auditPlans.map((plan) => (
                                <option key={plan.plan_id} value={plan.plan_id}>
                                    {plan.year} Plan - {plan.title} ({plan.status})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Scheduled Engagements for selected plan */}
                <div>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={20} color="var(--accent-cyan)" /> Scheduled Engagements
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
                        {audits.filter(a => a.plan_id === selectedPlanId).length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', background: 'var(--card-bg)', border: '1px dashed var(--border-color)', borderRadius: '1rem', gridColumn: '1 / -1' }}>
                                Select a plan or schedule a new engagement.
                            </div>
                        ) : (
                            audits.filter(a => a.plan_id === selectedPlanId).map(audit => (
                                <div key={audit.audit_id} className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--accent-cyan)' }}>{audit.audit_title}</h4>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                                {audit.industries?.industry_name} • {audit.functions?.function_name} • {audit.departments?.department_name}
                                            </div>
                                        </div>
                                        <span className={`badge badge-${(audit.status || 'Pending').toLowerCase().replace(' ', '-')}`}>{audit.status || 'Pending'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                <Clock size={14} /> {audit.start_date}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                <UserIcon size={14} /> {audit.profiles?.full_name || 'Unassigned'}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}
                                                onClick={() => { setActiveView('findings'); setSearchQuery(audit.audit_title); }}
                                            >
                                                Findings
                                            </button>
                                            {getProgramForAudit(audit.audit_id) ? (
                                                <button
                                                    className="btn btn-secondary"
                                                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem', borderColor: 'var(--accent-blue)', color: 'var(--accent-blue)' }}
                                                    onClick={() => { setActiveView('audit-program'); }}
                                                >
                                                    Open Program
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn btn-primary"
                                                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}
                                                    onClick={async () => {
                                                        await createAuditProgram(audit.audit_id);
                                                        setActiveView('audit-program');
                                                    }}
                                                >
                                                    Start Program
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
