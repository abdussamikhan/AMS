import React from 'react';
import { User as UserIcon, Mail, Lock } from 'lucide-react';

interface AuthViewProps {
    authMode: 'login' | 'signup';
    setAuthMode: (mode: 'login' | 'signup') => void;
    authEmail: string;
    setAuthEmail: (email: string) => void;
    authPassword: string;
    setAuthPassword: (password: string) => void;
    authFullName: string;
    setAuthFullName: (name: string) => void;
    selectedRole: string;
    setSelectedRole: (role: 'manager' | 'auditor' | 'client') => void;
    handleAuth: (e: React.FormEvent) => void;
    isAuthLoading: boolean;
}

export const AuthView: React.FC<AuthViewProps> = ({
    authMode,
    setAuthMode,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    authFullName,
    setAuthFullName,
    selectedRole,
    setSelectedRole,
    handleAuth,
    isAuthLoading
}) => {
    return (
        <div className="auth-container">
            <div className="auth-card fade-in">
                <div className="auth-header">
                    <div className="logo" style={{ marginBottom: '0.5rem' }}>AuditAce</div>
                    <h2>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {authMode === 'login' ? 'Enter your credentials to access the system' : 'Sign up to start managing audit findings'}
                    </p>
                </div>
                <form className="auth-form" onSubmit={handleAuth}>
                    {authMode === 'signup' && (
                        <>
                            <div className="detail-item">
                                <label className="detail-label">Full Name / Display Name</label>
                                <div style={{ position: 'relative' }}>
                                    <UserIcon size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                    <input
                                        type="text"
                                        className="form-control"
                                        style={{ paddingLeft: '40px' }}
                                        placeholder="John Doe"
                                        value={authFullName}
                                        onChange={e => setAuthFullName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="detail-item">
                                <label className="detail-label">I am an:</label>
                                <div className="role-selector">
                                    <button
                                        type="button"
                                        className={`role-btn ${selectedRole === 'manager' ? 'active' : ''}`}
                                        onClick={() => setSelectedRole('manager')}
                                    >
                                        Manager
                                    </button>
                                    <button
                                        type="button"
                                        className={`role-btn ${selectedRole === 'auditor' ? 'active' : ''}`}
                                        onClick={() => setSelectedRole('auditor')}
                                    >
                                        Auditor
                                    </button>
                                    <button
                                        type="button"
                                        className={`role-btn ${selectedRole === 'client' ? 'active' : ''}`}
                                        onClick={() => setSelectedRole('client')}
                                    >
                                        Client
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                    <div className="detail-item">
                        <label className="detail-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="email"
                                className="form-control"
                                style={{ paddingLeft: '40px' }}
                                placeholder="name@company.com"
                                value={authEmail}
                                onChange={e => setAuthEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="detail-item">
                        <label className="detail-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="password"
                                className="form-control"
                                style={{ paddingLeft: '40px' }}
                                placeholder="••••••••"
                                value={authPassword}
                                onChange={e => setAuthPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="auth-button" disabled={isAuthLoading}>
                        {isAuthLoading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>
                <div className="auth-footer">
                    {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
                    <span className="auth-link" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>
                        {authMode === 'login' ? 'Sign Up' : 'Sign In'}
                    </span>
                </div>
            </div>
        </div>
    );
};
