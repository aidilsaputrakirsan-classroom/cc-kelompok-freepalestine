import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function DonutChart({ data, centerValue, centerLabel, height = 200, innerRadius = 55, outerRadius = 80, showLegend = true }) {
    return (
        <div className="donut-chart-wrapper">
            <ResponsiveContainer width="100%" height={height}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={innerRadius}
                        outerRadius={outerRadius}
                        paddingAngle={2}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }}
                        formatter={(value) => [`${value}%`, '']}
                    />
                </PieChart>
            </ResponsiveContainer>
            {centerValue && (
                <div className="donut-center">
                    <span className="donut-center-value">{centerValue}</span>
                    {centerLabel && <span className="donut-center-label">{centerLabel}</span>}
                </div>
            )}
            {showLegend && (
                <div className="donut-legend">
                    {data.map((entry, index) => (
                        <div key={index} className="donut-legend-item">
                            <span className="donut-legend-dot" style={{ backgroundColor: entry.color }} />
                            <span className="donut-legend-text">{entry.name}: {entry.value}%</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
