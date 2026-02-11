import React from 'react';
import { X, Upload } from 'lucide-react';
import type { ReferenceDocument } from '../../types';

interface ReferenceUploadModalProps {
    showRefUploadModal: boolean;
    setShowRefUploadModal: (show: boolean) => void;
    newRefDoc: Partial<ReferenceDocument>;
    setNewRefDoc: (doc: Partial<ReferenceDocument>) => void;
    handleRefUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isRefUploading: boolean;
}

export const ReferenceUploadModal: React.FC<ReferenceUploadModalProps> = ({
    showRefUploadModal,
    setShowRefUploadModal,
    newRefDoc,
    setNewRefDoc,
    handleRefUpload,
    isRefUploading
}) => {
    if (!showRefUploadModal) return null;

    return (
        <div className="modal-overlay" onClick={() => setShowRefUploadModal(false)}>
            <div className="modal-content fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h2>Upload Reference Document</h2>
                    <button className="close-btn" onClick={() => setShowRefUploadModal(false)}><X /></button>
                </div>
                <div style={{ padding: '2rem' }}>
                    <div className="detail-item" style={{ marginBottom: '1.5rem' }}>
                        <label className="detail-label">Document Title</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. ISO 27001 Standard"
                            value={newRefDoc.title}
                            onChange={e => setNewRefDoc({ ...newRefDoc, title: e.target.value })}
                            autoFocus
                        />
                    </div>

                    <div className="detail-item" style={{ marginBottom: '2rem' }}>
                        <label className="detail-label">Category</label>
                        <select
                            className="form-control"
                            value={newRefDoc.category}
                            onChange={e => setNewRefDoc({ ...newRefDoc, category: e.target.value })}
                        >
                            <option value="Standard">Standard</option>
                            <option value="Regulation">Regulation</option>
                            <option value="Policy">Policy</option>
                            <option value="Procedure">Procedure</option>
                            <option value="Manual">Manual</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div style={{
                        border: '2px dashed var(--border-color)',
                        borderRadius: '1rem',
                        padding: '3rem 2rem',
                        textAlign: 'center',
                        background: 'rgba(255,255,255,0.02)',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <input
                            type="file"
                            onChange={handleRefUpload}
                            disabled={isRefUploading}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                        />
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Upload color="var(--accent-blue)" size={32} />
                        </div>
                        <div>
                            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                {isRefUploading ? 'Uploading Document...' : 'Click or Drag to Upload'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                PDF, DOCX, or Excel files up to 10MB
                            </div>
                        </div>
                    </div>

                    {isRefUploading && (
                        <div style={{ marginTop: '1.5rem', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'var(--accent-blue)', width: '50%', borderRadius: '2px' }} className="loading-bar"></div>
                        </div>
                    )}
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', padding: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={() => setShowRefUploadModal(false)}>Cancel</button>
                </div>
            </div>
        </div>
    );
};
