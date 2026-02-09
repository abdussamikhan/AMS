import React from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts'
import { Activity, Target, CheckCircle, ShieldAlert } from 'lucide-react'

export const GeneralAnalytics: React.FC = () => {
    return (
        <div className="analytics-view">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                {/* Audit Completion Trend */}
                <section style={{ background: 'var(--card-bg)', borderRadius: '1.25rem', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={18} color="var(--accent-blue)" />
                            Audit Completion Trend
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Monthly audit completion rate</p>
                    </div>
                    <div style={{ height: '250px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { month: 'Jan', completed: 12, planned: 15 },
                                { month: 'Feb', completed: 14, planned: 15 },
                                { month: 'Mar', completed: 18, planned: 20 },
                                { month: 'Apr', completed: 16, planned: 18 },
                                { month: 'May', completed: 20, planned: 22 },
                                { month: 'Jun', completed: 19, planned: 20 }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={11} axisLine={false} tickLine={false} />
                                <YAxis stroke="var(--text-secondary)" fontSize={11} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }} />
                                <Legend />
                                <Bar dataKey="completed" fill="var(--success)" radius={[4, 4, 0, 0]} name="Completed" />
                                <Bar dataKey="planned" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} name="Planned" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* Risk Distribution by Category */}
                <section style={{ background: 'var(--card-bg)', borderRadius: '1.25rem', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Target size={18} color="var(--accent-purple)" />
                            Risk Distribution
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Risks by category</p>
                    </div>
                    <div style={{ height: '250px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Strategic', value: 25, color: '#8b5cf6' },
                                        { name: 'Operational', value: 35, color: '#3b82f6' },
                                        { name: 'Financial', value: 20, color: '#10b981' },
                                        { name: 'Compliance', value: 20, color: '#f59e0b' }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {[
                                        { name: 'Strategic', value: 25, color: '#8b5cf6' },
                                        { name: 'Operational', value: 35, color: '#3b82f6' },
                                        { name: 'Financial', value: 20, color: '#10b981' },
                                        { name: 'Compliance', value: 20, color: '#f59e0b' }
                                    ].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* Control Effectiveness */}
                <section style={{ background: 'var(--card-bg)', borderRadius: '1.25rem', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle size={18} color="var(--success)" />
                            Control Effectiveness
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Control performance metrics</p>
                    </div>
                    <div style={{ height: '250px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { type: 'Preventive', effective: 85, ineffective: 15 },
                                { type: 'Detective', effective: 78, ineffective: 22 },
                                { type: 'Corrective', effective: 92, ineffective: 8 }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="type" stroke="var(--text-secondary)" fontSize={11} axisLine={false} tickLine={false} />
                                <YAxis stroke="var(--text-secondary)" fontSize={11} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }} />
                                <Legend />
                                <Bar dataKey="effective" stackId="a" fill="var(--success)" radius={[4, 4, 0, 0]} name="Effective" />
                                <Bar dataKey="ineffective" stackId="a" fill="var(--error)" radius={[4, 4, 0, 0]} name="Ineffective" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* Findings by Severity Over Time */}
                <section style={{ background: 'var(--card-bg)', borderRadius: '1.25rem', border: '1px solid var(--border-color)', padding: '1.5rem', gridColumn: 'span 2' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ShieldAlert size={18} color="var(--error)" />
                            Observations Trend by Severity
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Monthly observations breakdown</p>
                    </div>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { month: 'Jan', critical: 2, high: 5, medium: 8, low: 12 },
                                { month: 'Feb', critical: 1, high: 4, medium: 10, low: 15 },
                                { month: 'Mar', critical: 3, high: 6, medium: 7, low: 10 },
                                { month: 'Apr', critical: 1, high: 3, medium: 9, low: 14 },
                                { month: 'May', critical: 2, high: 5, medium: 11, low: 13 },
                                { month: 'Jun', critical: 1, high: 4, medium: 8, low: 11 }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={11} axisLine={false} tickLine={false} />
                                <YAxis stroke="var(--text-secondary)" fontSize={11} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }} />
                                <Legend />
                                <Bar dataKey="critical" stackId="a" fill="#dc2626" name="Critical" />
                                <Bar dataKey="high" stackId="a" fill="#f59e0b" name="High" />
                                <Bar dataKey="medium" stackId="a" fill="#3b82f6" name="Medium" />
                                <Bar dataKey="low" stackId="a" fill="#10b981" name="Low" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            </div>
        </div>
    )
}
