import {
    BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const formatNumber = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v ?? '');
    // Integers tetap integer, desimal dibatasi 2 angka.
    return Number.isInteger(n) ? n.toLocaleString('id-ID') : n.toFixed(2);
};

function CustomBarTooltip({ active, payload, label, tooltipPrefix = '', tooltipSuffix = '' }) {
    if (!active || !payload || payload.length === 0) return null;
    const main = payload[0];
    return (
        <div className="recharts-tooltip bar-tooltip">
            <div className="bar-tooltip-label">{label}</div>
            <div
                className="bar-tooltip-value"
                style={{ color: main.color || main.fill }}
            >
                {tooltipPrefix}{formatNumber(main.value)}{tooltipSuffix}
            </div>
            <div className="bar-tooltip-name">{main.name}</div>
        </div>
    );
}

export default function BarChart({ data, bars, height = 300, showLegend = true, barSize = 22, tooltipPrefix = '', tooltipSuffix = '' }) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <Tooltip
                    content={(props) => (
                        <CustomBarTooltip
                            {...props}
                            tooltipPrefix={tooltipPrefix}
                            tooltipSuffix={tooltipSuffix}
                        />
                    )}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
                />
                {showLegend && <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }} />}
                {bars.map((bar) => (
                    <Bar
                        key={bar.dataKey}
                        dataKey={bar.dataKey}
                        name={bar.name}
                        fill={bar.color}
                        barSize={barSize}
                        radius={[6, 6, 0, 0]}
                    />
                ))}
            </RechartsBarChart>
        </ResponsiveContainer>
    );
}
