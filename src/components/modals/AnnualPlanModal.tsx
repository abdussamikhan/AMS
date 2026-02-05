import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../supabase';

interface AnnualPlanModalProps {
    showNewPlanModal: boolean;
    setShowNewPlanModal: (show: boolean) => void;
    fetchAuditPlanningData: () => void;
}

export const AnnualPlanModal: React.FC<AnnualPlanModalProps> = ({
    showNewPlanModal,
    setShowNewPlanModal,
    fetchAuditPlanningData
}) => {
    const [newPlan, setNewPlan] = useState({
        title: '',
        year: new Date().getFullYear(),
        description: '',
        status: 'Draft'
    });

    if (!showNewPlanModal) return null;

    return (
        <div className="modal-overlay" onClick={() => setShowNewPlanModal(false)}>
            <div className="modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Create Annual Audit Plan</h2>
                    <button className="close-btn" onClick={() => setShowNewPlanModal(false)}>
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={async (e) => {
                    e.preventDefault();
                    const { error: insError } = await supabase.from('audit_plans').insert([newPlan]);
                    if (insError) alert(insError.message);
                    else {
                        setShowNewPlanModal(false);
                        setNewPlan({ title: '', year: new Date().getFullYear(), description: '', status: 'Draft' });
                        fetchAuditPlanningData();
                    }
                }} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="detail-item">
                        <label className="detail-label">Plan Title</label>
                        <input className="form-control" required value={newPlan.title} onChange={e => setNewPlan({ ...newPlan, title: e.target.value })} />
                    </div>
                    <div className="detail-item">
                        <label className="detail-label">Year</label>
                        <input type="number" className="form-control" required value={newPlan.year} onChange={e => setNewPlan({ ...newPlan, year: parseInt(e.target.value) })} />
                    </div>
                    <div className="detail-item">
                        <label className="detail-label">Description</label>
                        <input className="form-control" value={newPlan.description} onChange={e => setNewPlan({ ...newPlan, description: e.target.value })} />
                    </div>
                    <button type="submit" className="auth-button">Create Plan</button>
                </form>
            </div>
        </div>
    );
};
