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
import { BarChart3, Activity, Grid } from 'lucide-react'

interface RcmAnalyticsProps {
    rcmCategoryData: any[]
    rcmControlTypeData: any[]
    rcmFunctionData: any[]
}

export const RcmAnalytics: React.FC<RcmAnalyticsProps> = ({
    rcmCategoryData,
    rcmControlTypeData,
    rcmFunctionData
}) => {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
            <section style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid var(--border-color)' }}>
                <div className="section-title" style={{ marginBottom: '1.5rem' }}>
                    <BarChart3 size={20} color="var(--accent-blue)" />
                    <h3 style={{ fontSize: '1rem' }}>Risks by Category</h3>
                </div>
                <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={rcmCategoryData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={10} axisLine={false} tickLine={false} />
                            <YAxis stroke="var(--text-secondary)" fontSize={10} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ background: '#1a1f26', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}
                            />
                            <Bar dataKey="count" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            <section style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid var(--border-color)' }}>
                <div className="section-title" style={{ marginBottom: '1.5rem' }}>
                    <Activity size={20} color="var(--accent-cyan)" />
                    <h3 style={{ fontSize: '1rem' }}>Control Type Breakdown</h3>
                </div>
                <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={rcmControlTypeData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {rcmControlTypeData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b'][index % 3]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ background: '#1a1f26', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </section>

            <section style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid var(--border-color)', gridColumn: 'span 2' }}>
                <div className="section-title" style={{ marginBottom: '1.5rem' }}>
                    <Grid size={20} color="var(--accent-purple)" />
                    <h3 style={{ fontSize: '1rem' }}>Risk Density by Function</h3>
                </div>
                <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={rcmFunctionData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                            <XAxis type="number" stroke="var(--text-secondary)" fontSize={10} axisLine={false} tickLine={false} />
                            <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" fontSize={10} axisLine={false} tickLine={false} width={100} />
                            <Tooltip
                                contentStyle={{ background: '#1a1f26', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}
                            />
                            <Bar dataKey="count" fill="var(--accent-cyan)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>
        </div>
    )
}
