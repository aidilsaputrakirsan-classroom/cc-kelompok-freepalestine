import {
    BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function BarChart({ data, bars, height = 300, showLegend = true, barSize = 20, tooltipPrefix = '', tooltipSuffix = '' }) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }}
                    formatter={(value) => [`${tooltipPrefix}${value}${tooltipSuffix}`, '']}
                />
                {showLegend && <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />}
                {bars.map((bar) => (
                    <Bar
                        key={bar.dataKey}
                        dataKey={bar.dataKey}
                        name={bar.name}
                        fill={bar.color}
                        barSize={barSize}
                        radius={[4, 4, 0, 0]}
                    />
                ))}
            </RechartsBarChart>
        </ResponsiveContainer>
    );
}
