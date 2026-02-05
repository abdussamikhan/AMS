import React from 'react';
import { X, ShieldAlert } from 'lucide-react';

interface RiskAssessmentModalProps {
    showNewRiskModal: boolean;
    setShowNewRiskModal: (show: boolean) => void;
    isEditingRisk: boolean;
    newRiskEntry: any;
    setNewRiskEntry: (entry: any) => void;
    riskCats: any[];
    rcmEntries: any[];
    handleSaveRisk: (e: React.FormEvent) => void;
}

export const RiskAssessmentModal: React.FC<RiskAssessmentModalProps> = ({
    showNewRiskModal,
    setShowNewRiskModal,
    isEditingRisk,
    newRiskEntry,
    setNewRiskEntry,
    riskCats,
    rcmEntries,
    handleSaveRisk
}) => {
    if (!showNewRiskModal) return null;

    return (
        <div className="modal-overlay" onClick={() => setShowNewRiskModal(false)}>
            <div className="modal-content fade-in" style={{ maxWidth: '800px', width: '90%', borderRadius: '1.5rem' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.6rem', borderRadius: '0.75rem' }}>
                            <ShieldAlert size={24} color="var(--accent-blue)" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{isEditingRisk ? 'Edit Risk Assessment' : 'New Risk Assessment'}</h2>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Identify and assess organizational risks for the current fiscal year</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={() => setShowNewRiskModal(false)}>
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSaveRisk} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="detail-item">
                            <label className="detail-label">Risk Category</label>
                            <select
                                className="form-control"
                                required
                                value={newRiskEntry.risk_category_id}
                                onChange={e => setNewRiskEntry({ ...newRiskEntry, risk_category_id: e.target.value })}
                            >
                                <option value="">Select Category...</option>
                                {riskCats.map(cat => <option key={cat.risk_id} value={cat.risk_id}>{cat.category_name}</option>)}
                            </select>
                        </div>
                        <div className="detail-item">
                            <label className="detail-label">Fiscal Year</label>
                            <select
                                className="form-control"
                                value={newRiskEntry.fiscal_year}
                                onChange={e => setNewRiskEntry({ ...newRiskEntry, fiscal_year: parseInt(e.target.value) })}
                            >
                                {[...Array(5)].map((_, i) => (
                                    <option key={i} value={new Date().getFullYear() - 1 + i}>
                                        {new Date().getFullYear() - 1 + i} FY
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="detail-item">
                        <label className="detail-label">Source from RCM (Optional)</label>
                        <select
                            className="form-control"
                            value={newRiskEntry.rcm_id || ''}
                            onChange={e => {
                                const rcmId = e.target.value;
                                const rcmEntry = rcmEntries.find(r => r.rcm_id === rcmId);
                                if (rcmEntry) {
                                    setNewRiskEntry({
                                        ...newRiskEntry,
                                        rcm_id: rcmId,
                                        risk_title: rcmEntry.risk_title || rcmEntry.risk_description.substring(0, 50),
                                        risk_description: rcmEntry.risk_description,
                                        control_title: rcmEntry.control_title || '',
                                        control_description: rcmEntry.control_description || '',
                                        risk_category_id: rcmEntry.risk_category_id,
                                        action_plan: `Source Control: ${rcmEntry.control_description}`
                                    });
                                } else {
                                    setNewRiskEntry({ ...newRiskEntry, rcm_id: null });
                                }
                            }}
                        >
                            <option value="">-- Manual Entry --</option>
                            {rcmEntries.map(rcm => (
                                <option key={rcm.rcm_id} value={rcm.rcm_id}>
                                    {rcm.risk_title || rcm.risk_description.substring(0, 60) + '...'}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                        <label className="detail-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Risk Title & Description</label>
                        <input
                            type="text"
                            className="form-control"
                            required
                            placeholder="e.g. Unauthorized access to production database"
                            value={newRiskEntry.risk_title}
                            onChange={e => setNewRiskEntry({ ...newRiskEntry, risk_title: e.target.value })}
                            style={{ marginBottom: '0.75rem', fontWeight: '600', color: 'var(--accent-blue)' }}
                        />
                        <textarea
                            className="form-control"
                            rows={2}
                            required
                            placeholder="Detailed description of the risk scenario..."
                            value={newRiskEntry.risk_description}
                            onChange={e => setNewRiskEntry({ ...newRiskEntry, risk_description: e.target.value })}
                        />
                    </div>

                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                        <label className="detail-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Control Title & Description</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Access Control Policy"
                            value={newRiskEntry.control_title || ''}
                            onChange={e => setNewRiskEntry({ ...newRiskEntry, control_title: e.target.value })}
                            style={{ marginBottom: '0.75rem', fontWeight: '600', color: 'var(--accent-blue)' }}
                        />
                        <textarea
                            className="form-control"
                            rows={2}
                            placeholder="Describe the mitigating control activity..."
                            value={newRiskEntry.control_description || ''}
                            onChange={e => setNewRiskEntry({ ...newRiskEntry, control_description: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                        <div>
                            <h4 style={{ fontSize: '0.9rem', marginBottom: '1.25rem', color: 'var(--accent-blue)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Inherent Risk Assessment</span>
                                <span style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                                    Score: {(newRiskEntry.inherent_likelihood || 0) * (newRiskEntry.inherent_impact || 0)}
                                </span>
                            </h4>
                            <div className="detail-item" style={{ marginBottom: '1rem' }}>
                                <label className="detail-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    Likelihood
                                    <span>{newRiskEntry.inherent_likelihood} / 5</span>
                                </label>
                                <input
                                    type="range" min="1" max="5" step="1"
                                    className="form-control"
                                    value={newRiskEntry.inherent_likelihood}
                                    onChange={e => setNewRiskEntry({ ...newRiskEntry, inherent_likelihood: parseInt(e.target.value) })}
                                    style={{ height: 'auto', padding: '0.5rem 0', cursor: 'pointer' }}
                                />
                            </div>
                            <div className="detail-item">
                                <label className="detail-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    Impact
                                    <span>{newRiskEntry.inherent_impact} / 5</span>
                                </label>
                                <input
                                    type="range" min="1" max="5" step="1"
                                    className="form-control"
                                    value={newRiskEntry.inherent_impact}
                                    onChange={e => setNewRiskEntry({ ...newRiskEntry, inherent_impact: parseInt(e.target.value) })}
                                    style={{ height: 'auto', padding: '0.5rem 0', cursor: 'pointer' }}
                                />
                            </div>
                        </div>

                        <div>
                            <h4 style={{ fontSize: '0.9rem', marginBottom: '1.25rem', color: 'var(--accent-purple)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Residual Risk Assessment</span>
                                <span style={{ background: 'rgba(167, 139, 250, 0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                                    Score: {(newRiskEntry.residual_likelihood || 0) * (newRiskEntry.residual_impact || 0)}
                                </span>
                            </h4>
                            <div className="detail-item" style={{ marginBottom: '1rem' }}>
                                <label className="detail-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    Likelihood
                                    <span>{newRiskEntry.residual_likelihood} / 5</span>
                                </label>
                                <input
                                    type="range" min="1" max="5" step="1"
                                    className="form-control"
                                    value={newRiskEntry.residual_likelihood}
                                    onChange={e => setNewRiskEntry({ ...newRiskEntry, residual_likelihood: parseInt(e.target.value) })}
                                    style={{ height: 'auto', padding: '0.5rem 0', cursor: 'pointer' }}
                                />
                            </div>
                            <div className="detail-item">
                                <label className="detail-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    Impact
                                    <span>{newRiskEntry.residual_impact} / 5</span>
                                </label>
                                <input
                                    type="range" min="1" max="5" step="1"
                                    className="form-control"
                                    value={newRiskEntry.residual_impact}
                                    onChange={e => setNewRiskEntry({ ...newRiskEntry, residual_impact: parseInt(e.target.value) })}
                                    style={{ height: 'auto', padding: '0.5rem 0', cursor: 'pointer' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                        <div className="detail-item">
                            <label className="detail-label">Risk Owner</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="e.g. IT Manager, CFO..."
                                value={newRiskEntry.risk_owner}
                                onChange={e => setNewRiskEntry({ ...newRiskEntry, risk_owner: e.target.value })}
                            />
                        </div>
                        <div className="detail-item">
                            <label className="detail-label">Audit Frequency</label>
                            <select
                                className="form-control"
                                value={newRiskEntry.audit_frequency || '12 months'}
                                onChange={e => setNewRiskEntry({ ...newRiskEntry, audit_frequency: e.target.value })}
                            >
                                <option value="3 months">3 months</option>
                                <option value="6 months">6 months</option>
                                <option value="12 months">12 months</option>
                                <option value="18 months">18 months</option>
                                <option value="24 months">24 months</option>
                                <option value="36 months">36 months</option>
                                <option value="Continuous">Continuous</option>
                            </select>
                        </div>
                        <div className="detail-item">
                            <label className="detail-label">Target Residual Score</label>
                            <input
                                type="number"
                                className="form-control"
                                min="1"
                                max="25"
                                placeholder="1-25"
                                value={newRiskEntry.target_residual_score || ''}
                                onChange={e => setNewRiskEntry({ ...newRiskEntry, target_residual_score: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    <div className="detail-item">
                        <label className="detail-label">Remarks</label>
                        <textarea
                            className="form-control"
                            rows={2}
                            placeholder="Additional notes or comments..."
                            value={newRiskEntry.remarks || ''}
                            onChange={e => setNewRiskEntry({ ...newRiskEntry, remarks: e.target.value })}
                        />
                    </div>

                    <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowNewRiskModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                            {isEditingRisk ? 'Update Assessment' : 'Create Assessment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
