import React from 'react';
import { Search, Plus, Database as DatabaseIcon, FileText, Download, Trash2 } from 'lucide-react';
import type { ReferenceDocument, Profile } from '../../types';

interface ReferenceFilters {
    search: string;
    category: string;
}

interface AdminReferencesViewProps {
    refDocs: ReferenceDocument[];
    refFilters: ReferenceFilters;
    setRefFilters: (filters: ReferenceFilters) => void;
    setShowRefUploadModal: (show: boolean) => void;
    handleDeleteRef: (doc: ReferenceDocument) => void;
    profile: Profile | null;
}

export const AdminReferencesView: React.FC<AdminReferencesViewProps> = ({
    refDocs,
    refFilters,
    setRefFilters,
    setShowRefUploadModal,
    handleDeleteRef,
    profile
}) => {
    return (
        <div className="admin-view">
            <div style={{ background: 'var(--card-bg)', borderRadius: '1.25rem', border: '1px solid var(--border-color)', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Reference Documents Library</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Standards, Regulations, Policies, and Procedures</p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowRefUploadModal(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={18} /> Upload Reference
                    </button>
                </div>

                {/* Filter Bar */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ background: 'var(--glass-bg)', borderRadius: '0.75rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 1rem', height: '42px', flex: 1 }}>
                        <Search size={18} color="var(--text-secondary)" style={{ minWidth: '18px' }} />
                        <input
                            type="text"
                            placeholder="Search documents by title..."
                            style={{
                                background: 'transparent',
                                border: 'none',
                                boxShadow: 'none',
                                flex: 1,
                                minWidth: 0,
                                marginLeft: '0.5rem',
                                height: '100%',
                                color: 'var(--text-primary)',
                                fontSize: '0.95rem',
                                outline: 'none'
                            }}
                            value={refFilters.search}
                            onChange={e => setRefFilters({ ...refFilters, search: e.target.value })}
                        />
                    </div>
                    <select
                        className="form-control"
                        style={{ width: '200px', cursor: 'pointer' }}
                        value={refFilters.category}
                        onChange={e => setRefFilters({ ...refFilters, category: e.target.value })}
                    >
                        <option value="all">All Categories</option>
                        <option value="Standard">Standard</option>
                        <option value="Regulation">Regulation</option>
                        <option value="Policy">Policy</option>
                        <option value="Procedure">Procedure</option>
                        <option value="Manual">Manual</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                {refDocs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--glass-bg)', borderRadius: '1rem', border: '1px dashed var(--border-color)' }}>
                        <DatabaseIcon size={40} color="var(--text-secondary)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p style={{ color: 'var(--text-secondary)' }}>No reference documents uploaded yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {refDocs
                            .filter(doc => {
                                const matchesSearch = doc.title?.toLowerCase().includes(refFilters.search.toLowerCase())
                                const matchesCategory = refFilters.category === 'all' || doc.category === refFilters.category
                                return matchesSearch && matchesCategory
                            })
                            .map((doc, idx) => (
                                <div key={doc.doc_id || idx} className="doc-card" style={{ background: 'var(--card-bg)', borderRadius: '1rem', border: '1px solid var(--border-color)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                                            <FileText size={20} color="var(--accent-blue)" />
                                        </div>
                                        <span className="badge badge-low" style={{ fontSize: '0.7rem' }}>{doc.category}</span>
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.25rem' }}>{doc.title}</h4>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            Uploaded: {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '---'} • {doc.file_size}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ flex: 1, fontSize: '0.8rem', padding: '0.4rem', textDecoration: 'none', textAlign: 'center' }}>View</a>
                                        <a href={doc.file_url} download className="btn btn-secondary" style={{ padding: '0.4rem' }}><Download size={14} /></a>
                                        {profile?.role === 'admin' && (
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => handleDeleteRef(doc)}
                                                style={{ padding: '0.4rem', color: 'var(--error)' }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};
