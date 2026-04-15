import {
    LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Area
} from 'recharts';

export default function LineChart({ data, lines, height = 300, showArea = false, tooltipPrefix = '', tooltipSuffix = '' }) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsLineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }}
                    formatter={(value) => [`${tooltipPrefix}${value}${tooltipSuffix}`, '']}
                />
                {lines.map((line) => (
                    <Line
                        key={line.dataKey}
                        type="monotone"
                        dataKey={line.dataKey}
                        name={line.name}
                        stroke={line.color}
                        strokeWidth={line.strokeWidth || 2}
                        dot={false}
                        activeDot={{ r: 4 }}
                    />
                ))}
                {showArea && lines.map((line) => (
                    <Area
                        key={`area-${line.dataKey}`}
                        type="monotone"
                        dataKey={line.dataKey}
                        fill={line.color}
                        fillOpacity={0.08}
                        stroke="none"
                    />
                ))}
            </RechartsLineChart>
        </ResponsiveContainer>
    );
}
