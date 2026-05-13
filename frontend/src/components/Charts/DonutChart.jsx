import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

function CustomDonutTooltip({ active, payload }) {
    if (!active || !payload || payload.length === 0) return null;
    const p = payload[0];
    return (
        <div className="recharts-tooltip">
            <div className="recharts-tooltip-items">
                <div className="recharts-tooltip-item">
                    <span className="recharts-tooltip-dot" style={{ background: p.payload.color }} />
                    <span className="recharts-tooltip-name" style={{ color: p.payload.color }}>
                        {p.name}
                    </span>
                    <span className="recharts-tooltip-value">{p.value}</span>
                </div>
            </div>
        </div>
    );
}

export default function DonutChart({
    data, centerValue, centerLabel,
    height = 220, innerRadius = 55, outerRadius = 80,
    showLegend = true,
}) {
    // Container harus punya height tetap agar overlay center bisa dihitung persis di tengah area chart.
    return (
        <div className="donut-chart-wrapper">
            <div className="donut-chart-inner" style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={innerRadius}
                            outerRadius={outerRadius}
                            paddingAngle={2}
                            dataKey="value"
                            isAnimationActive={false}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomDonutTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
                {centerValue !== undefined && centerValue !== null && (
                    <div className="donut-center">
                        <span className="donut-center-value">{centerValue}</span>
                        {centerLabel && <span className="donut-center-label">{centerLabel}</span>}
                    </div>
                )}
            </div>
            {showLegend && (
                <div className="donut-legend">
                    {data.map((entry, index) => (
                        <div key={index} className="donut-legend-item">
                            <span className="donut-legend-dot" style={{ backgroundColor: entry.color }} />
                            <span className="donut-legend-text">
                                {entry.name}: <strong>{entry.value}</strong>
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
