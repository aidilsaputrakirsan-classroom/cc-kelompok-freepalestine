import {
    LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Area
} from 'recharts';

const formatNumber = (v, decimals = 2) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return v;
    return n.toFixed(decimals);
};

function CustomLineTooltip({ active, payload, label, tooltipPrefix = '', tooltipSuffix = '' }) {
    if (!active || !payload || payload.length === 0) return null;

    return (
        <div className="recharts-tooltip">
            <div className="recharts-tooltip-label">{label}</div>
            <div className="recharts-tooltip-items">
                {payload.map((entry, i) => (
                    <div key={i} className="recharts-tooltip-item">
                        <span
                            className="recharts-tooltip-dot"
                            style={{ background: entry.color || entry.stroke }}
                        />
                        <span
                            className="recharts-tooltip-name"
                            style={{ color: entry.color || entry.stroke }}
                        >
                            {entry.name}
                        </span>
                        <span className="recharts-tooltip-value">
                            {tooltipPrefix}{formatNumber(entry.value, 2)}{tooltipSuffix}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function LineChart({ data, lines, height = 300, showArea = false, tooltipPrefix = '', tooltipSuffix = '' }) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsLineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <Tooltip
                    content={(props) => (
                        <CustomLineTooltip
                            {...props}
                            tooltipPrefix={tooltipPrefix}
                            tooltipSuffix={tooltipSuffix}
                        />
                    )}
                    cursor={{ stroke: 'rgba(148, 163, 184, 0.3)', strokeWidth: 1 }}
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
