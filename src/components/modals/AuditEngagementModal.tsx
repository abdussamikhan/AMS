import React from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../supabase';

interface AuditEngagementModalProps {
    showNewAuditModal: boolean;
    setShowNewAuditModal: (show: boolean) => void;
    newAudit: any;
    setNewAudit: (audit: any) => void;
    auditPlans: any[];
    allFunctions: any[];
    allDepartments: any[];
    auditors: any[];
    isCustomFunctionAudit: boolean;
    setIsCustomFunctionAudit: (custom: boolean) => void;
    isCustomDepartmentAudit: boolean;
    setIsCustomDepartmentAudit: (custom: boolean) => void;
    customFunctionAudit: string;
    setCustomFunctionAudit: (name: string) => void;
    customDepartmentAudit: string;
    setCustomDepartmentAudit: (name: string) => void;
    fetchAuditPlanningData: () => void;
    fetchRcmContext: () => void;
}

export const AuditEngagementModal: React.FC<AuditEngagementModalProps> = ({
    showNewAuditModal,
    setShowNewAuditModal,
    newAudit,
    setNewAudit,
    auditPlans,
    allFunctions,
    allDepartments,
    auditors,
    isCustomFunctionAudit,
    setIsCustomFunctionAudit,
    isCustomDepartmentAudit,
    setIsCustomDepartmentAudit,
    customFunctionAudit,
    setCustomFunctionAudit,
    customDepartmentAudit,
    setCustomDepartmentAudit,
    fetchAuditPlanningData,
    fetchRcmContext
}) => {
    if (!showNewAuditModal) return null;

    return (
        <div className="modal-overlay" onClick={() => setShowNewAuditModal(false)}>
            <div className="modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Schedule Audit Engagement</h2>
                    <button className="close-btn" onClick={() => setShowNewAuditModal(false)}>
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                        let functionId = newAudit.function_id;
                        let departmentId = newAudit.department_id;

                        // 1. Handle Custom Function
                        if (isCustomFunctionAudit && customFunctionAudit) {
                            const { data: newFunc, error: funcError } = await supabase
                                .from('functions')
                                .insert({ function_name: customFunctionAudit })
                                .select()
                                .single();
                            if (funcError) throw new Error('Error creating function: ' + funcError.message);
                            if (newFunc) functionId = newFunc.function_id;
                        }

                        // 2. Handle Custom Department
                        if (isCustomDepartmentAudit && customDepartmentAudit) {
                            if (!functionId) throw new Error('Function is required to create a custom department.');
                            const { data: newDept, error: deptError } = await supabase
                                .from('departments')
                                .insert({ department_name: customDepartmentAudit, function_id: functionId })
                                .select()
                                .single();
                            if (deptError) throw new Error('Error creating department: ' + deptError.message);
                            if (newDept) departmentId = newDept.department_id;
                        }

                        const submission = {
                            ...newAudit,
                            industry_id: newAudit.industry_id || null,
                            function_id: functionId || null,
                            department_id: departmentId || null,
                            plan_id: newAudit.plan_id || null
                        };

                        const { error } = await supabase.from('audits').insert([submission]).select();
                        if (error) throw error;

                        setShowNewAuditModal(false);
                        setNewAudit({
                            plan_id: auditPlans[0]?.plan_id || '',
                            audit_title: '',
                            assigned_auditor: '',
                            start_date: '',
                            end_date: '',
                            status: 'Scheduled',
                            industry_id: '',
                            function_id: '',
                            department_id: ''
                        });
                        setIsCustomFunctionAudit(false);
                        setIsCustomDepartmentAudit(false);
                        setCustomFunctionAudit('');
                        setCustomDepartmentAudit('');
                        fetchAuditPlanningData();
                        fetchRcmContext();
                    } catch (err: any) {
                        alert(err.message);
                    }
                }} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="detail-item">
                        <label className="detail-label">Annual Plan</label>
                        <select className="form-control" required value={newAudit.plan_id} onChange={e => setNewAudit({ ...newAudit, plan_id: e.target.value })}>
                            <option value="">Select Plan...</option>
                            {auditPlans.map(p => <option key={p.plan_id} value={p.plan_id}>{p.title} ({p.year})</option>)}
                        </select>
                    </div>
                    <div className="detail-item">
                        <label className="detail-label">Engagement Title</label>
                        <input
                            type="text"
                            className="form-control"
                            required
                            placeholder="e.g. Finance Audit Q1, IT General Controls..."
                            value={newAudit.audit_title}
                            onChange={e => {
                                const val = e.target.value;
                                setNewAudit((prev: any) => ({ ...prev, audit_title: val }));
                            }}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="detail-item">
                            <label className="detail-label">Function</label>
                            <select
                                className="form-control"
                                required
                                value={isCustomFunctionAudit ? 'custom' : newAudit.function_id}
                                onChange={e => {
                                    if (e.target.value === 'custom') {
                                        setIsCustomFunctionAudit(true);
                                        setNewAudit({ ...newAudit, function_id: '', department_id: '' });
                                    } else {
                                        setIsCustomFunctionAudit(false);
                                        setNewAudit({ ...newAudit, function_id: e.target.value, department_id: '' });
                                    }
                                }}
                            >
                                <option value="">Select Function...</option>
                                {allFunctions.map(f => <option key={f.function_id} value={f.function_id}>{f.function_name}</option>)}
                                <option value="custom">+ Other / Custom...</option>
                            </select>
                            {isCustomFunctionAudit && (
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{ marginTop: '0.5rem' }}
                                    placeholder="Enter function name..."
                                    required
                                    value={customFunctionAudit}
                                    onChange={e => setCustomFunctionAudit(e.target.value)}
                                />
                            )}
                        </div>
                        <div className="detail-item">
                            <label className="detail-label">Department</label>
                            <select
                                className="form-control"
                                required
                                value={isCustomDepartmentAudit ? 'custom' : newAudit.department_id}
                                disabled={!newAudit.function_id && !isCustomFunctionAudit}
                                onChange={e => {
                                    if (e.target.value === 'custom') {
                                        setIsCustomDepartmentAudit(true);
                                        setNewAudit({ ...newAudit, department_id: '' });
                                    } else {
                                        setIsCustomDepartmentAudit(false);
                                        setNewAudit({ ...newAudit, department_id: e.target.value });
                                    }
                                }}
                            >
                                <option value="">Select Department...</option>
                                {!isCustomFunctionAudit && allDepartments.filter(d => d.function_id === newAudit.function_id).map(d => (
                                    <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                                ))}
                                <option value="custom">+ Other / Custom...</option>
                            </select>
                            {isCustomDepartmentAudit && (
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{ marginTop: '0.5rem' }}
                                    placeholder="Enter department name..."
                                    required
                                    value={customDepartmentAudit}
                                    onChange={e => setCustomDepartmentAudit(e.target.value)}
                                />
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="detail-item">
                            <label className="detail-label">Start Date</label>
                            <input type="date" className="form-control" required value={newAudit.start_date} onChange={e => setNewAudit({ ...newAudit, start_date: e.target.value })} />
                        </div>
                        <div className="detail-item">
                            <label className="detail-label">End Date</label>
                            <input type="date" className="form-control" required value={newAudit.end_date} onChange={e => setNewAudit({ ...newAudit, end_date: e.target.value })} />
                        </div>
                    </div>
                    <div className="detail-item">
                        <label className="detail-label">Lead Auditor</label>
                        <select className="form-control" required value={newAudit.assigned_auditor} onChange={e => setNewAudit({ ...newAudit, assigned_auditor: e.target.value })}>
                            <option value="">Select Auditor...</option>
                            {auditors.map(aud => <option key={aud.id} value={aud.id}>{aud.full_name}</option>)}
                        </select>
                    </div>
                    <button type="submit" className="auth-button">Schedule Engagement</button>
                </form>
            </div>
        </div>
    );
};
