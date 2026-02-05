import React from 'react';
import { X, Grid, Sparkles, Wand2 } from 'lucide-react';

interface RcmModalProps {
    showNewRcmModal: boolean;
    setShowNewRcmModal: (show: boolean) => void;
    isEditingRcm: boolean;
    newRcm: any;
    setNewRcm: (rcm: any) => void;
    rcmAiInput: string;
    setRcmAiInput: (input: string) => void;
    isRcmAiProcessing: boolean;
    handleRcmAiGenerate: () => void;
    industries: any[];
    allFunctions: any[];
    allDepartments: any[];
    riskCats: any[];
    allSystems: any[];
    isCustomFunctionRcm: boolean;
    setIsCustomFunctionRcm: (custom: boolean) => void;
    isCustomDepartmentRcm: boolean;
    setIsCustomDepartmentRcm: (custom: boolean) => void;
    customFunctionRcm: string;
    setCustomFunctionRcm: (name: string) => void;
    customDepartmentRcm: string;
    setCustomDepartmentRcm: (name: string) => void;
    handleCreateRcm: (e: React.FormEvent) => void;
}

export const RcmModal: React.FC<RcmModalProps> = ({
    showNewRcmModal,
    setShowNewRcmModal,
    isEditingRcm,
    newRcm,
    setNewRcm,
    rcmAiInput,
    setRcmAiInput,
    isRcmAiProcessing,
    handleRcmAiGenerate,
    industries,
    allFunctions,
    allDepartments,
    riskCats,
    allSystems,
    isCustomFunctionRcm,
    setIsCustomFunctionRcm,
    isCustomDepartmentRcm,
    setIsCustomDepartmentRcm,
    customFunctionRcm,
    setCustomFunctionRcm,
    customDepartmentRcm,
    setCustomDepartmentRcm,
    handleCreateRcm
}) => {
    if (!showNewRcmModal) return null;

    return (
        <div className="modal-overlay" onClick={() => setShowNewRcmModal(false)}>
            <div className="modal-content" style={{ width: '800px' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem' }}>
                            <Grid size={20} color="var(--accent-blue)" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{isEditingRcm ? 'Edit Risk Control' : 'New Risk Control'}</h2>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{isEditingRcm ? 'Update existing risk scenario and control' : 'Define a new risk scenario and its mitigating control'}</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={() => setShowNewRcmModal(false)}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.05)', borderBottom: '1px solid var(--border-color)' }}>
                    <label className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sparkles size={14} color="var(--accent-blue)" />
                        AI Risk Draft (Optional)
                    </label>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <input
                            className="form-control"
                            placeholder="e.g. unauthorized change to database table..."
                            value={rcmAiInput}
                            onChange={e => setRcmAiInput(e.target.value)}
                        />
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleRcmAiGenerate}
                            disabled={isRcmAiProcessing}
                            style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Wand2 size={16} />
                            {isRcmAiProcessing ? 'Thinking...' : 'Generate with AI'}
                        </button>
                    </div>
                </div>

                <form onSubmit={handleCreateRcm}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', padding: '1.5rem' }}>
                        <div className="detail-item">
                            <label className="detail-label">Risk Title</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter a brief risk title..."
                                value={newRcm.risk_title || ''}
                                onChange={e => setNewRcm({ ...newRcm, risk_title: e.target.value })}
                            />
                        </div>

                        <div className="detail-item">
                            <label className="detail-label">Control Title</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter a brief control title..."
                                value={newRcm.control_title || ''}
                                onChange={e => setNewRcm({ ...newRcm, control_title: e.target.value })}
                            />
                        </div>

                        <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                            <label className="detail-label">Risk Description</label>
                            <textarea
                                className="form-control"
                                rows={2}
                                required
                                placeholder="Enter the risk scenario..."
                                value={newRcm.risk_description}
                                onChange={e => setNewRcm({ ...newRcm, risk_description: e.target.value })}
                            />
                        </div>

                        <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                            <label className="detail-label">Control Description</label>
                            <textarea
                                className="form-control"
                                rows={2}
                                required
                                placeholder="Enter the mitigating control..."
                                value={newRcm.control_description}
                                onChange={e => setNewRcm({ ...newRcm, control_description: e.target.value })}
                            />
                        </div>

                        <div className="detail-item">
                            <label className="detail-label">Industry</label>
                            <select
                                className="form-control"
                                required
                                value={newRcm.industry_id}
                                onChange={e => setNewRcm({ ...newRcm, industry_id: e.target.value, function_id: '', department_id: '' })}
                            >
                                <option value="">Select Industry...</option>
                                {industries.filter(i => i.is_active !== false).map(i => <option key={i.industry_id} value={i.industry_id}>{i.industry_name}</option>)}
                            </select>
                        </div>

                        <div className="detail-item">
                            <label className="detail-label">Risk Category</label>
                            <select
                                className="form-control"
                                required
                                value={newRcm.risk_category_id}
                                onChange={e => setNewRcm({ ...newRcm, risk_category_id: e.target.value })}
                            >
                                <option value="">Select Risk Category...</option>
                                {riskCats.map(c => <option key={c.risk_id} value={c.risk_id}>{c.category_name}</option>)}
                            </select>
                        </div>

                        <div className="detail-item">
                            <label className="detail-label">Function</label>
                            <select
                                className="form-control"
                                required
                                value={isCustomFunctionRcm ? 'custom' : newRcm.function_id}
                                onChange={e => {
                                    if (e.target.value === 'custom') {
                                        setIsCustomFunctionRcm(true)
                                        setNewRcm({ ...newRcm, function_id: '', department_id: '' })
                                    } else {
                                        setIsCustomFunctionRcm(false)
                                        setNewRcm({ ...newRcm, function_id: e.target.value, department_id: '' })
                                    }
                                }}
                            >
                                <option value="">Select Function...</option>
                                {allFunctions.filter(f => f.is_active !== false).map(f => (
                                    <option key={f.function_id} value={f.function_id}>{f.function_name}</option>
                                ))}
                                <option value="custom">+ Other / Custom...</option>
                            </select>
                            {isCustomFunctionRcm && (
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{ marginTop: '0.5rem' }}
                                    placeholder="Enter custom function name..."
                                    required
                                    value={customFunctionRcm}
                                    onChange={e => setCustomFunctionRcm(e.target.value)}
                                />
                            )}
                        </div>

                        <div className="detail-item">
                            <label className="detail-label">Department</label>
                            <select
                                className="form-control"
                                required
                                value={isCustomDepartmentRcm ? 'custom' : newRcm.department_id}
                                disabled={!newRcm.function_id && !isCustomFunctionRcm}
                                onChange={e => {
                                    if (e.target.value === 'custom') {
                                        setIsCustomDepartmentRcm(true)
                                        setNewRcm({ ...newRcm, department_id: '' })
                                    } else {
                                        setIsCustomDepartmentRcm(false)
                                        setNewRcm({ ...newRcm, department_id: e.target.value })
                                    }
                                }}
                            >
                                <option value="">Select Department...</option>
                                {!isCustomFunctionRcm && allDepartments.filter(d => (d.function_id === newRcm.function_id) && d.is_active !== false).map(d => (
                                    <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                                ))}
                                <option value="custom">+ Other / Custom...</option>
                            </select>
                            {isCustomDepartmentRcm && (
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{ marginTop: '0.5rem' }}
                                    placeholder="Enter custom department name..."
                                    required
                                    value={customDepartmentRcm}
                                    onChange={e => setCustomDepartmentRcm(e.target.value)}
                                />
                            )}
                        </div>

                        <div className="detail-item">
                            <label className="detail-label">Reference Standard</label>
                            <input
                                className="form-control"
                                placeholder="e.g. ISO 27001, COBIT..."
                                value={newRcm.reference_standard}
                                onChange={e => setNewRcm({ ...newRcm, reference_standard: e.target.value })}
                            />
                        </div>

                        <div className="detail-item">
                            <label className="detail-label">System / Application</label>
                            <select
                                className="form-control"
                                value={newRcm.system_id || ''}
                                onChange={e => setNewRcm({ ...newRcm, system_id: e.target.value || null })}
                            >
                                <option value="">Select System (Optional)...</option>
                                {allSystems.map(s => <option key={s.system_id} value={s.system_id}>{s.system_name}</option>)}
                            </select>
                        </div>

                        <div className="detail-item">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label className="detail-label">Control Type</label>
                                    <select
                                        className="form-control"
                                        value={newRcm.control_type}
                                        onChange={e => setNewRcm({ ...newRcm, control_type: e.target.value as any })}
                                    >
                                        <option value="Preventive">Preventive</option>
                                        <option value="Detective">Detective</option>
                                        <option value="Corrective">Corrective</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="detail-label">Frequency</label>
                                    <select
                                        className="form-control"
                                        value={newRcm.control_frequency}
                                        onChange={e => setNewRcm({ ...newRcm, control_frequency: e.target.value as any })}
                                    >
                                        <option value="Continuous">Continuous</option>
                                        <option value="Daily">Daily</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                        <option value="Quarterly">Quarterly</option>
                                        <option value="Annual">Annual</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', padding: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowNewRcmModal(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: '#fff', padding: '0.6rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer' }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ background: 'var(--accent-blue)', color: '#fff', border: 'none', padding: '0.6rem 2rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
                            {isEditingRcm ? 'Update Control' : 'Create Control'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
