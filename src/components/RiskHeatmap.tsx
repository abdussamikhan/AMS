import React from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'
import { BarChart3 } from 'lucide-react'

interface RiskHeatmapProps {
    chartData: any[]
}

export const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ chartData }) => {
    return (
        <section style={{ marginBottom: '3rem' }}>
            <div className="section-title">
                <BarChart3 size={24} color="var(--accent-blue)" />
                <h2>Risk Heatmap</h2>
            </div>
            <div style={{ height: '400px', background: 'var(--card-bg)', padding: '2rem', borderRadius: '1.25rem', border: '1px solid var(--border-color)' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} axisLine={false} tickLine={false} />
                        <YAxis stroke="var(--text-secondary)" fontSize={12} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{ background: '#1a1f26', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        />
                        <Legend iconType="circle" />
                        <Bar dataKey="Critical" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="High" stackId="a" fill="#f87171" />
                        <Bar dataKey="Medium" stackId="a" fill="#fbbf24" />
                        <Bar dataKey="Low" stackId="a" fill="#10b981" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </section>
    )
}
