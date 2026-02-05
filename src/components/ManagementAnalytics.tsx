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
import { ClipboardList, CheckCircle2, User as UserIcon, Grid } from 'lucide-react'

interface ManagementAnalyticsProps {
    planStatusData: any[]
    engagementStatusData: any[]
    resourceWorkloadData: any[]
    auditsByFunctionData: any[]
}

export const ManagementAnalytics: React.FC<ManagementAnalyticsProps> = ({
    planStatusData,
    engagementStatusData,
    resourceWorkloadData,
    auditsByFunctionData
}) => {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
            <section style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid var(--border-color)' }}>
                <div className="section-title" style={{ marginBottom: '1.5rem' }}>
                    <ClipboardList size={20} color="var(--accent-blue)" />
                    <h3 style={{ fontSize: '1rem' }}>Audit Plan Status</h3>
                </div>
                <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={planStatusData}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {planStatusData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#fbbf24', '#f87171'][index % 4]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#1a1f26', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </section>

            <section style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid var(--border-color)' }}>
                <div className="section-title" style={{ marginBottom: '1.5rem' }}>
                    <CheckCircle2 size={20} color="var(--accent-cyan)" />
                    <h3 style={{ fontSize: '1rem' }}>Engagement Status</h3>
                </div>
                <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={engagementStatusData}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {engagementStatusData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#6366f1', '#14b8a6', '#f59e0b', '#ef4444'][index % 4]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#1a1f26', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </section>

            <section style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid var(--border-color)', gridColumn: 'span 2' }}>
                <div className="section-title" style={{ marginBottom: '1.5rem' }}>
                    <UserIcon size={20} color="var(--accent-purple)" />
                    <h3 style={{ fontSize: '1rem' }}>Resource Allocation & Workload</h3>
                </div>
                <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={resourceWorkloadData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                            <XAxis type="number" stroke="var(--text-secondary)" fontSize={10} axisLine={false} tickLine={false} />
                            <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" fontSize={10} axisLine={false} tickLine={false} width={120} />
                            <Tooltip contentStyle={{ background: '#1a1f26', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }} />
                            <Bar dataKey="count" fill="var(--accent-purple)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            <section style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid var(--border-color)', gridColumn: 'span 2' }}>
                <div className="section-title" style={{ marginBottom: '1.5rem' }}>
                    <Grid size={20} color="var(--accent-blue)" />
                    <h3 style={{ fontSize: '1rem' }}>Audits by Function</h3>
                </div>
                <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={auditsByFunctionData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                            <XAxis type="number" stroke="var(--text-secondary)" fontSize={10} axisLine={false} tickLine={false} />
                            <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" fontSize={10} axisLine={false} tickLine={false} width={120} />
                            <Tooltip contentStyle={{ background: '#1a1f26', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }} />
                            <Bar dataKey="count" fill="var(--accent-blue)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>
        </div>
    )
}
