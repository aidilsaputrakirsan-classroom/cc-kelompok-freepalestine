import { useState, useEffect } from 'react';
import { ChartCard, LineChart, BarChart, DonutChart } from '../../components/Charts';
import { salesApi, inboxApi } from '../../services/api';
import { TrendingUp, TrendingDown, Package, Inbox, DollarSign, Activity } from 'lucide-react';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const WITELS = ['BALIKPAPAN', 'KALBAR', 'KALSELTENG', 'KALTIMTARA'];

const witelColors = {
    BALIKPAPAN: '#1e3a5f',
    KALBAR: '#3b82f6',
    KALSELTENG: '#14b8a6',
    KALTIMTARA: '#93c5fd',
};

const formatRupiah = (value) => `Rp ${Number(value).toFixed(2)} M`;

export default function HomeDashboard() {
    const [summary, setSummary] = useState(null);
    const [monthlyData, setMonthlyData] = useState([]);
    const [inboxStats, setInboxStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterYear, setFilterYear] = useState(2025);
    const [filterWitel, setFilterWitel] = useState('');

    useEffect(() => {
        loadData();
    }, [filterYear, filterWitel]);

    const loadData = async () => {
        setLoading(true);
        try {
            const params = { year: filterYear };
            if (filterWitel) params.witel = filterWitel;

            const [summaryRes, monthlyRes, inboxRes] = await Promise.all([
                salesApi.summary(params),
                salesApi.monthly(params),
                inboxApi.stats(filterWitel ? { witel: filterWitel } : {}),
            ]);

            setSummary(summaryRes);
            setInboxStats(inboxRes);

            // Transform monthly data for line chart
            const monthMap = {};
            monthlyRes.forEach((item) => {
                if (!monthMap[item.month]) monthMap[item.month] = { name: MONTHS[item.month - 1] };
                monthMap[item.month][item.witel] = item.revenue;
            });
            setMonthlyData(Object.values(monthMap).sort((a, b) => MONTHS.indexOf(a.name) - MONTHS.indexOf(b.name)));
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const kpiCards = summary ? [
        { title: 'Total Revenue Target', value: formatRupiah(summary.total_target), icon: DollarSign, color: '#3b82f6' },
        { title: 'Total Revenue Actual', value: formatRupiah(summary.total_actual), icon: TrendingUp, color: '#10b981' },
        { title: 'Achievement', value: `${summary.achievement}%`, icon: Activity, color: summary.achievement >= 100 ? '#10b981' : '#ef4444' },
        { title: 'Total SSL', value: `${summary.total_ssl_actual.toLocaleString()} / ${summary.total_ssl_target.toLocaleString()}`, icon: Package, color: '#8b5cf6' },
    ] : [];

    const lineChartLines = filterWitel
        ? [{ dataKey: filterWitel, name: filterWitel, color: witelColors[filterWitel] || '#3b82f6', strokeWidth: 2.5 }]
        : WITELS.map((w) => ({ dataKey: w, name: w, color: witelColors[w], strokeWidth: 2 }));

    // Bar chart: revenue per witel from monthly data
    const witelTotals = {};
    (monthlyData || []).forEach((m) => {
        WITELS.forEach((w) => {
            if (m[w]) witelTotals[w] = (witelTotals[w] || 0) + m[w];
        });
    });
    const barData = Object.entries(witelTotals).map(([name, revenue]) => ({ name, Revenue: Number(revenue.toFixed(2)) }));

    // Donut chart: inbox status
    const donutData = inboxStats ? [
        { name: 'Pending', value: inboxStats.pending, color: '#f59e0b' },
        { name: 'In Progress', value: inboxStats.in_progress, color: '#3b82f6' },
        { name: 'Completed', value: inboxStats.completed, color: '#10b981' },
        { name: 'Rejected', value: inboxStats.rejected, color: '#ef4444' },
    ].filter((d) => d.value > 0) : [];

    if (loading) {
        return (
            <div className="page-content">
                <div className="loading-spinner-wrapper">
                    <div className="loading-spinner" />
                    <p>Memuat data dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-content">
            {/* Filter Bar */}
            <div className="dashboard-filter-bar">
                <div className="filter-group">
                    <label>Tahun</label>
                    <select value={filterYear} onChange={(e) => setFilterYear(Number(e.target.value))}>
                        <option value={2025}>2025</option>
                        <option value={2024}>2024</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Witel</label>
                    <select value={filterWitel} onChange={(e) => setFilterWitel(e.target.value)}>
                        <option value="">Semua Witel</option>
                        {WITELS.map((w) => <option key={w} value={w}>{w}</option>)}
                    </select>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                {kpiCards.map((kpi, i) => (
                    <div key={i} className="kpi-card">
                        <div className="kpi-card-icon" style={{ background: `${kpi.color}22`, color: kpi.color }}>
                            <kpi.icon size={22} />
                        </div>
                        <div className="kpi-card-info">
                            <span className="kpi-card-title">{kpi.title}</span>
                            <span className="kpi-card-value" style={{ color: kpi.color }}>{kpi.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row 1: Line + Bar */}
            <div className="dashboard-row">
                <ChartCard title={`Trend Revenue YTD ${filterYear}`} subtitle={filterWitel || 'Semua Witel — Regional 4'}>
                    <LineChart
                        data={monthlyData}
                        lines={lineChartLines}
                        height={280}
                        showArea={true}
                        tooltipPrefix="Rp "
                        tooltipSuffix=" M"
                    />
                </ChartCard>
                <ChartCard title="Revenue per Witel" subtitle={`Total YTD ${filterYear}`}>
                    <BarChart
                        data={barData}
                        bars={[{ dataKey: 'Revenue', name: 'Revenue (M)', color: '#3b82f6' }]}
                        height={280}
                        tooltipPrefix="Rp "
                        tooltipSuffix=" M"
                    />
                </ChartCard>
            </div>

            {/* Charts Row 2: Donut */}
            {inboxStats && inboxStats.total > 0 && (
                <div className="dashboard-row">
                    <ChartCard title="Status Tiket Inbox" subtitle={`Total: ${inboxStats.total} tiket`}>
                        <DonutChart
                            data={donutData}
                            centerValue={String(inboxStats.total)}
                            centerLabel="TIKET"
                            height={200}
                            showLegend={true}
                        />
                    </ChartCard>
                    <ChartCard title="Ringkasan Revenue" subtitle={`Achievement YTD ${filterYear}`}>
                        <div className="revenue-summary-clean">
                            <div className="revenue-summary-hero">
                                <span className="hero-ach-value" style={{ color: summary?.achievement >= 100 ? '#22c55e' : '#ef4444' }}>
                                    {summary?.achievement}%
                                </span>
                                <span className="hero-ach-label">Achievement</span>
                            </div>
                            <div className="revenue-summary-metrics">
                                <div className="revenue-metric-item">
                                    <span className="metric-label">Target</span>
                                    <span className="metric-value">{formatRupiah(summary?.total_target || 0)}</span>
                                </div>
                                <div className="revenue-metric-item">
                                    <span className="metric-label">Realisasi</span>
                                    <span className="metric-value highlight">{formatRupiah(summary?.total_actual || 0)}</span>
                                </div>
                                <div className="revenue-metric-item">
                                    <span className="metric-label">Gap</span>
                                    <span className="metric-value" style={{
                                        color: (summary?.total_actual - summary?.total_target) >= 0 ? '#22c55e' : '#ef4444'
                                    }}>
                                        {(summary?.total_actual - summary?.total_target) >= 0 ? '+' : ''}
                                        {formatRupiah((summary?.total_actual || 0) - (summary?.total_target || 0))}
                                    </span>
                                </div>
                                <div className="revenue-metric-item">
                                    <span className="metric-label">Total SSL</span>
                                    <span className="metric-value">{summary?.total_ssl_actual?.toLocaleString()} / {summary?.total_ssl_target?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </ChartCard>
                </div>
            )}
        </div>
    );
}
