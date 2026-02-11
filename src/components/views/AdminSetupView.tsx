import React from 'react';
import { Target, Layers, Users } from 'lucide-react';
import { supabase } from '../../supabase';
import type { Industry, Func, Dept } from '../../types';

interface AdminSetupViewProps {
    industries: Industry[];
    setIndustries: React.Dispatch<React.SetStateAction<Industry[]>>;
    allFunctions: Func[];
    setAllFunctions: React.Dispatch<React.SetStateAction<Func[]>>;
    allDepartments: Dept[];
    toggleDepartmentStatus: (dept: Dept) => void;
}

export const AdminSetupView: React.FC<AdminSetupViewProps> = ({
    industries,
    setIndustries,
    allFunctions,
    setAllFunctions,
    allDepartments,
    toggleDepartmentStatus
}) => {
    return (
        <div className="admin-view">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                {/* Industry Management */}
                <div style={{ background: 'var(--card-bg)', borderRadius: '1.25rem', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <Target size={20} color="var(--accent-cyan)" /> Industry Management
                    </h3>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Industry Name</th>
                                    <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Status</th>
                                    <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {industries.map((ind) => (
                                    <tr key={ind.industry_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '0.75rem' }}>{ind.industry_name}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span className={`badge ${ind.is_active !== false ? 'badge-completed' : 'badge-draft'}`}>
                                                {ind.is_active !== false ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                            <button
                                                className={`btn ${ind.is_active !== false ? 'btn-secondary' : 'btn-primary'}`}
                                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                                                onClick={async () => {
                                                    const newStatus = ind.is_active === false;
                                                    const { error } = await supabase
                                                        .from('industries')
                                                        .update({ is_active: newStatus })
                                                        .eq('industry_id', ind.industry_id);

                                                    if (error) {
                                                        alert('Error updating status');
                                                    } else {
                                                        setIndustries(prev => prev.map(i => i.industry_id === ind.industry_id ? { ...i, is_active: newStatus } : i));
                                                    }
                                                }}
                                            >
                                                {ind.is_active !== false ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Function Management */}
                <div style={{ background: 'var(--card-bg)', borderRadius: '1.25rem', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <Layers size={20} color="var(--accent-purple)" /> Function Management
                    </h3>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Function Name</th>
                                    <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Status</th>
                                    <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allFunctions.map((func) => (
                                    <tr key={func.function_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '0.75rem' }}>{func.function_name}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span className={`badge ${func.is_active !== false ? 'badge-completed' : 'badge-draft'}`}>
                                                {func.is_active !== false ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                            <button
                                                className={`btn ${func.is_active !== false ? 'btn-secondary' : 'btn-primary'}`}
                                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                                                onClick={async () => {
                                                    const newStatus = func.is_active === false;
                                                    const { error } = await supabase
                                                        .from('functions')
                                                        .update({ is_active: newStatus })
                                                        .eq('function_id', func.function_id);

                                                    if (error) {
                                                        alert('Error updating status');
                                                    } else {
                                                        setAllFunctions(prev => prev.map(f => f.function_id === func.function_id ? { ...f, is_active: newStatus } : f));
                                                    }
                                                }}
                                            >
                                                {func.is_active !== false ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Department Management */}
                <div style={{ background: 'var(--card-bg)', borderRadius: '1.25rem', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <Users size={20} color="var(--accent-pink)" /> Department Management
                    </h3>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Department Name</th>
                                    <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Status</th>
                                    <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allDepartments.map((dept) => (
                                    <tr key={dept.department_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '0.75rem' }}>{dept.department_name}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span className={`badge ${dept.is_active !== false ? 'badge-completed' : 'badge-draft'}`}>
                                                {dept.is_active !== false ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                            <button
                                                className={`btn ${dept.is_active !== false ? 'btn-secondary' : 'btn-primary'}`}
                                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                                                onClick={() => toggleDepartmentStatus(dept)}
                                            >
                                                {dept.is_active !== false ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
