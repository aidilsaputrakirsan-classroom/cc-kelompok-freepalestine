export default function ChartCard({ title, subtitle, value, subvalue, badge, children, headerExtra }) {
    return (
        <div className="chart-card">
            <div className="chart-card-header">
                <div className="chart-card-title-group">
                    <h3 className="chart-card-title">{title}</h3>
                    {subtitle && <p className="chart-card-subtitle">{subtitle}</p>}
                    {badge && <span className={`chart-badge ${badge.type}`}>{badge.text}</span>}
                </div>
                <div className="chart-card-meta">
                    {value && <span className="chart-card-value">{value}</span>}
                    {subvalue && <span className="chart-card-subvalue">{subvalue}</span>}
                    {headerExtra}
                </div>
            </div>
            <div className="chart-card-body">
                {children}
            </div>
        </div>
    );
}
