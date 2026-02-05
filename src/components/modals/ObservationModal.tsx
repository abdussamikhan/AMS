import React from 'react';
import { X, Wand2, Sparkles, Upload, CheckCircle } from 'lucide-react';
import { supabase } from '../../supabase';

interface ObservationModalProps {
    showNewModal: boolean;
    setShowNewModal: (show: boolean) => void;
    isEditingObs: boolean;
    currentObsId: string | null;
    newObs: any;
    setNewObs: (obs: any) => void;
    aiInput: string;
    setAiInput: (input: string) => void;
    isAIProcessing: boolean;
    processWithAI: () => void;
    audits: any[];
    procedures: any[];
    attachmentTitle: string;
    setAttachmentTitle: (title: string) => void;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isUploading: boolean;
    uploadedAttachments: any[];
    setUploadedAttachments: (attachments: any[]) => void;
    fetchData: () => void;
}

export const ObservationModal: React.FC<ObservationModalProps> = ({
    showNewModal,
    setShowNewModal,
    isEditingObs,
    currentObsId,
    newObs,
    setNewObs,
    aiInput,
    setAiInput,
    isAIProcessing,
    processWithAI,
    audits,
    procedures,
    attachmentTitle,
    setAttachmentTitle,
    handleFileUpload,
    isUploading,
    uploadedAttachments,
    setUploadedAttachments,
    fetchData
}) => {
    if (!showNewModal) return null;

    return (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h2>{isEditingObs ? 'Edit Audit Observation' : 'New Audit Observation'}</h2>
                    <button className="close-btn" onClick={() => setShowNewModal(false)}>
                        <X size={24} />
                    </button>
                </div>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* AI Assistant Section */}
                    <div style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid var(--accent-blue)',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        marginBottom: '0.5rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--accent-blue)' }}>
                            <Wand2 size={18} />
                            <span style={{ fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase' }}>AI Audit Assistant</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Paste your raw audit notes or observation text below, and let AI structure the observation for you.
                        </p>
                        <textarea
                            className="form-control"
                            style={{ minHeight: '80px', marginBottom: '1rem', background: 'rgba(0,0,0,0.2)' }}
                            placeholder="e.g., During the review of backup logs for Q3, we noticed that 5 servers didn't have backup records. This violates the IT Policy SEC-04. The admin forgot to include them in the new schedule..."
                            value={aiInput}
                            onChange={e => setAiInput(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={processWithAI}
                            disabled={isAIProcessing || !aiInput.trim()}
                            style={{
                                width: '100%',
                                background: 'var(--accent-blue)',
                                color: '#fff',
                                border: 'none',
                                padding: '0.6rem',
                                borderRadius: '0.5rem',
                                cursor: (isAIProcessing || !aiInput.trim()) ? 'not-allowed' : 'pointer',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                fontSize: '0.875rem'
                            }}
                        >
                            {isAIProcessing ? 'AI is processing...' : <><Sparkles size={16} /> Structure with AI</>}
                        </button>
                    </div>

                    <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={async (e) => {
                        e.preventDefault()
                        const submission = {
                            ...newObs,
                            audit_id: newObs.audit_id || null,
                            evidence_json: uploadedAttachments
                        }

                        let error;
                        if (isEditingObs && currentObsId) {
                            const { error: updateError } = await supabase.from('audit_observations').update(submission).eq('observation_id', currentObsId)
                            error = updateError;
                        } else {
                            const { error: insertError } = await supabase.from('audit_observations').insert([submission])
                            error = insertError;
                        }

                        if (!error) {
                            setShowNewModal(false)
                            setUploadedAttachments([])
                            setNewObs({
                                procedure_id: '',
                                condition: '',
                                criteria: '',
                                cause: '',
                                effect: '',
                                recommendation: '',
                                risk_rating: 'Low' as any,
                                title: '',
                                audit_id: ''
                            })
                            fetchData()
                        } else {
                            alert('Error saving observation: ' + error.message)
                        }
                    }}>
                        <div className="detail-item">
                            <label className="detail-label">Audit Engagement (Optional)</label>
                            <select
                                className="form-control"
                                value={newObs.audit_id || ''}
                                onChange={e => setNewObs({ ...newObs, audit_id: e.target.value })}
                            >
                                <option value="">None / Independent Observation</option>
                                {audits.map(a => (
                                    <option key={a.audit_id} value={a.audit_id}>{a.audit_title} ({a.industries?.industry_name})</option>
                                ))}
                            </select>
                        </div>

                        <div className="detail-item">
                            <label className="detail-label">Audit Procedure</label>
                            <select
                                required
                                className="form-control"
                                value={newObs.procedure_id}
                                onChange={e => setNewObs({ ...newObs, procedure_id: e.target.value })}
                            >
                                <option value="">Select a procedure...</option>
                                {procedures.map(p => (
                                    <option key={p.procedure_id} value={p.procedure_id}>
                                        {p.framework_mapping?.framework_name} {p.framework_mapping?.reference_code} - {p.procedure_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="detail-item">
                            <label className="detail-label">Title (Summary)</label>
                            <input
                                required
                                className="form-control"
                                placeholder="Summarized observation title..."
                                value={newObs.title}
                                onChange={e => setNewObs({ ...newObs, title: e.target.value })}
                            />
                        </div>

                        <div className="detail-item">
                            <label className="detail-label">Condition (Observation)</label>
                            <textarea
                                required
                                className="form-control"
                                placeholder="What was found?"
                                value={newObs.condition}
                                onChange={e => setNewObs({ ...newObs, condition: e.target.value })}
                            />
                        </div>

                        <div className="detail-item">
                            <label className="detail-label">Criteria (Standard)</label>
                            <textarea
                                required
                                className="form-control"
                                style={{ minHeight: '80px' }}
                                placeholder="What is the required standard?"
                                value={newObs.criteria}
                                onChange={e => setNewObs({ ...newObs, criteria: e.target.value })}
                            />
                        </div>

                        <div className="detail-item">
                            <label className="detail-label">Cause (Root Cause)</label>
                            <textarea
                                required
                                className="form-control"
                                style={{ minHeight: '80px' }}
                                placeholder="Root cause..."
                                value={newObs.cause}
                                onChange={e => setNewObs({ ...newObs, cause: e.target.value })}
                            />
                        </div>

                        <div className="detail-item">
                            <label className="detail-label">Risk Rating</label>
                            <select
                                className="form-control"
                                value={newObs.risk_rating}
                                onChange={e => setNewObs({ ...newObs, risk_rating: e.target.value as any })}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>

                        <div className="detail-item">
                            <label className="detail-label">Recommendation</label>
                            <textarea
                                className="form-control"
                                placeholder="Suggested action plan..."
                                value={newObs.recommendation}
                                onChange={e => setNewObs({ ...newObs, recommendation: e.target.value })}
                            />
                        </div>

                        <div className="detail-item">
                            <label className="detail-label">Attachments (Evidence)</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <input
                                    className="form-control"
                                    placeholder="Enter file title (e.g. Audit Policy)..."
                                    value={attachmentTitle}
                                    onChange={e => setAttachmentTitle(e.target.value)}
                                />
                                <div style={{
                                    border: '2px dashed var(--border-color)',
                                    borderRadius: '0.5rem',
                                    padding: '0.5rem',
                                    textAlign: 'center',
                                    background: 'var(--glass-bg)',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                                >
                                    <input
                                        type="file"
                                        onChange={handleFileUpload}
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                    />
                                    <Upload color="var(--text-secondary)" size={16} />
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                        {isUploading ? 'Uploading...' : 'Choose File'}
                                    </span>
                                </div>
                            </div>
                            {uploadedAttachments.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                                    {uploadedAttachments.map((att, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem' }}>
                                            <CheckCircle size={14} color="var(--success)" />
                                            <span style={{ fontSize: '0.75rem', color: '#fff' }}>{att.title}</span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>File attached</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isUploading}
                            style={{
                                background: isUploading ? 'var(--border-color)' : 'var(--accent-blue)',
                                color: '#fff',
                                border: 'none',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                cursor: isUploading ? 'not-allowed' : 'pointer',
                                fontWeight: '700',
                                marginTop: '1rem',
                                transition: 'opacity 0.2s'
                            }}
                        >
                            {isUploading ? 'Finalizing Uploads...' : (isEditingObs ? 'Update Observation' : 'Save Observation')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
