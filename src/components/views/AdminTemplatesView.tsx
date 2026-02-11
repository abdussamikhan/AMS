import React from 'react';
import { FileText, Upload } from 'lucide-react';
import { supabase } from '../../supabase';

interface AdminTemplatesViewProps {
    isTemplateUploading: boolean;
    setIsTemplateUploading: (uploading: boolean) => void;
}

export const AdminTemplatesView: React.FC<AdminTemplatesViewProps> = ({
    isTemplateUploading,
    setIsTemplateUploading
}) => {
    return (
        <div className="admin-view">
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Audit Template Upload */}
                <div style={{ background: 'var(--card-bg)', borderRadius: '1.25rem', border: '1px solid var(--border-color)', padding: '2rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <FileText size={20} color="var(--accent-blue)" /> Audit Report Templates
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                        Manage the structured templates used by AI to generate audit reports. Uploading a new template will update the logic used for future reports.
                    </p>
                    <div style={{ background: 'var(--bg-dark)', borderRadius: '1rem', border: '1px dashed var(--border-color)', padding: '3rem', textAlign: 'center' }}>
                        <Upload size={48} color="var(--text-secondary)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            Upload PDF templates here (Max 10MB)
                        </p>
                        <label className="btn btn-primary" style={{ display: 'inline-flex', cursor: 'pointer', padding: '0.75rem 2rem' }}>
                            {isTemplateUploading ? 'Uploading...' : 'Upload New Template'}
                            <input
                                type="file"
                                accept="application/pdf"
                                style={{ display: 'none' }}
                                onChange={async (e) => {
                                    const file = e.target.files?.[0]
                                    if (!file) return
                                    setIsTemplateUploading(true)
                                    try {
                                        const fileExt = file.name.split('.').pop()
                                        const fileName = `${Math.random()}.${fileExt}`
                                        const { error } = await supabase.storage
                                            .from('audit-templates')
                                            .upload(fileName, file)
                                        if (error) throw error
                                        alert('Template uploaded successfully!')
                                    } catch (err: unknown) {
                                        alert('Error uploading template: ' + (err as Error).message)
                                    } finally {
                                        setIsTemplateUploading(false)
                                    }
                                }}
                            />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};
