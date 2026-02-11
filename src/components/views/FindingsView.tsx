import React from 'react';
import {
    CheckCircle,
    Plus,
    Clock,
    Edit3,
    Trash2,
    X,
    FileText,
    ExternalLink
} from 'lucide-react';
import type { Observation } from '../../types';
import type { NewObservation } from '../../hooks/useAuditData';
import { getRatingBadge } from '../../utils/uiHelpers';

interface FindingsViewProps {
    isDataLoading: boolean;
    filteredObservations: Observation[];
    setSelectedObs: (obs: Observation | null) => void;
    selectedObs: Observation | null;
    openEditObsModal: (obs: Observation) => void;
    handleDeleteObs: (id: string) => Promise<void>;
    setIsEditingObs: (val: boolean) => void;
    setCurrentObsId: (id: string | null) => void;
    setNewObs: React.Dispatch<React.SetStateAction<NewObservation>>;
    setUploadedAttachments: React.Dispatch<React.SetStateAction<{ url: string; title: string; }[]>>;
    setShowNewModal: (val: boolean) => void;
    handleGenerateDetailedPDF: (obs: Observation) => void;
}

export const FindingsView: React.FC<FindingsViewProps> = ({
    isDataLoading,
    filteredObservations,
    setSelectedObs,
    selectedObs,
    openEditObsModal,
    handleDeleteObs,
    setIsEditingObs,
    setCurrentObsId,
    setNewObs,
    setUploadedAttachments,
    setShowNewModal,
    handleGenerateDetailedPDF,
}) => {
    return (
        <>
            <section className="observations-section">
                <div className="section-title" style={{ justifyContent: 'space-between', width: '100%', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <CheckCircle size={24} color="var(--accent-blue)" />
                        <h2>Observations List</h2>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setIsEditingObs(false);
                            setCurrentObsId(null);
                            setNewObs({
                                procedure_id: '',
                                condition: '',
                                criteria: '',
                                cause: '',
                                effect: '',
                                recommendation: '',
                                risk_rating: 'Low',
                                title: '',
                                audit_id: ''
                            });
                            setUploadedAttachments([]);
                            setShowNewModal(true);
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={18} /> New Observation
                    </button>
                </div>
                {isDataLoading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        Loading audit data from Supabase...
                    </div>
                ) : (
                    <div className="observations-list">
                        {filteredObservations.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', background: 'var(--glass-bg)', borderRadius: '1rem' }}>
                                No observations match your search query.
                            </div>
                        ) : (
                            filteredObservations.map((obs) => (
                                <div key={obs.observation_id} className="observation-card fade-in">
                                    <div className="rating-indicator">
                                        {getRatingBadge(obs.risk_rating)}
                                    </div>
                                    <div className="obs-info">
                                        <h3>{obs.title || obs.condition}</h3>
                                        <div className="obs-meta">
                                            <span>{obs.audit_procedures?.framework_mapping?.framework_name} / {obs.audit_procedures?.framework_mapping?.reference_code}</span>
                                            <span>•</span>
                                            <span>{obs.audit_procedures?.framework_mapping?.risk_categories?.category_name}</span>
                                            <span>•</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <Clock size={12} />
                                                {new Date(obs.created_at).toISOString().split('T')[0]}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <button
                                            onClick={() => openEditObsModal(obs)}
                                            className="btn btn-secondary"
                                            style={{ padding: '0.5rem', minWidth: 'auto' }}
                                            title="Edit"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteObs(obs.observation_id)}
                                            className="btn btn-secondary"
                                            style={{ padding: '0.5rem', minWidth: 'auto', color: 'var(--accent-red)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => setSelectedObs(obs)}
                                            style={{
                                                background: 'var(--glass-bg)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer',
                                                color: 'var(--text-primary)'
                                            }}>
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </section>

            {/* Details Modal */}
            {selectedObs && (
                <div className="modal-overlay" onClick={() => setSelectedObs(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    {getRatingBadge(selectedObs.risk_rating)}
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {selectedObs.audit_procedures?.framework_mapping?.framework_name} • {selectedObs.audit_procedures?.framework_mapping?.reference_code} • {selectedObs.audit_procedures?.framework_mapping?.risk_categories?.category_name}
                                        <span>•</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Clock size={12} />
                                            {new Date(selectedObs.created_at).toISOString().split('T')[0]}
                                        </span>
                                    </span>
                                </div>
                                <h2 style={{ fontSize: '1.5rem', lineHeight: '1.3' }}>{selectedObs.title || selectedObs.condition}</h2>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <button
                                    onClick={() => handleGenerateDetailedPDF(selectedObs!)}
                                    style={{
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        color: 'var(--accent-blue)',
                                        border: '1px solid var(--accent-blue)',
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '0.4rem',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem'
                                    }}
                                >
                                    <FileText size={14} />
                                    Export Details PDF
                                </button>
                                <button className="close-btn" onClick={() => setSelectedObs(null)}>
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="modal-body">
                            <div className="detail-grid">
                                <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                                    <div className="detail-label">Condition (Finding Detail)</div>
                                    <div className="detail-value" style={{ fontSize: '1.1rem' }}>{selectedObs.condition}</div>
                                </div>
                                <div className="detail-item">
                                    <div className="detail-label">Criteria</div>
                                    <div className="detail-value">{selectedObs.criteria}</div>
                                </div>
                                <div className="detail-item">
                                    <div className="detail-label">Cause</div>
                                    <div className="detail-value">{selectedObs.cause || 'Not specified'}</div>
                                </div>
                                <div className="detail-item">
                                    <div className="detail-label">Effect / Impact</div>
                                    <div className="detail-value">{selectedObs.effect || 'Not specified'}</div>
                                </div>
                                <div className="detail-item">
                                    <div className="detail-label">Recommendation</div>
                                    <div className="detail-value">{selectedObs.recommendation || 'Not specified'}</div>
                                </div>
                            </div>

                            {/* Evidence Section */}
                            {selectedObs.evidence_urls && selectedObs.evidence_urls.length > 0 && (
                                <div style={{ marginTop: '2rem' }}>
                                    <div className="detail-label" style={{ marginBottom: '1rem' }}>Supporting Evidence</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
                                        {selectedObs.evidence_urls.map((url, i) => {
                                            const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)/i);
                                            return (
                                                <a
                                                    key={i}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        background: 'var(--glass-bg)',
                                                        border: '1px solid var(--border-color)',
                                                        borderRadius: '0.75rem',
                                                        padding: '0.5rem',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        textDecoration: 'none',
                                                        color: 'inherit',
                                                        transition: 'transform 0.2s'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                                >
                                                    {isImage ? (
                                                        <img src={url} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '0.4rem' }} alt="Evidence" />
                                                    ) : (
                                                        <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <FileText size={32} color="var(--accent-blue)" />
                                                        </div>
                                                    )}
                                                    <span style={{
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        textAlign: 'center',
                                                        color: 'var(--text-primary)'
                                                    }}>
                                                        {decodeURIComponent(url.split('/').pop()?.split('?')[0] || 'Unknown File')}
                                                    </span>
                                                    <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>View File <ExternalLink size={10} /></span>
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
