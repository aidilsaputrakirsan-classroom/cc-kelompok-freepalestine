import { useEffect, useState } from 'react';
import { HeartPulse, Activity, CheckCircle, AlertCircle, TrendingDown } from 'lucide-react';
import { monitoringApi, inboxApi } from '../../services/api';
import { useToast, extractErrorMessage } from '../../components/Toast/ToastProvider';
import { useDataUploadEvent } from '../../utils/uploadEvents';
import { ChartCard, DonutChart, BarChart } from '../../components/Charts';
import InboxPage from '../Inbox/InboxPage';

export default function CustomerCarePage() {
    const toast = useToast();
    const [summary, setSummary] = useState(null);
    const [inboxStats, setInboxStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

    // Auto-refresh KPI & NPS summary tiap kali ada upload file inbox baru.
    // (Daftar tiket di bawah akan ikut refresh otomatis karena InboxPage
    // juga men-subscribe event yang sama.)
    useDataUploadEvent((detail) => {
        if (detail?.target === 'inbox') load();
    });

    const load = async () => {
        setLoading(true);
        try {
            const [s, st] = await Promise.all([
                monitoringApi.summary(),
                inboxApi.stats(),
            ]);
            setSummary(s);
            setInboxStats(st);
        } catch (err) {
            toast.error('Gagal memuat data Customer Care', extractErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="page-content"><div className="loading-spinner-wrapper"><div className="loading-spinner" /></div></div>;
    }

    const npsColor = (score) =>
        score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
    const npsLabel = (score) =>
        score >= 70 ? 'Excellent' : score >= 40 ? 'Average' : 'Poor';

    // Pastel KPI cards: each card has a distinct cardKey so CSS can apply pastel background + text color.
    const kpi = summary ? [
        {
            title: 'NPS Score',
            value: `${summary.nps_score}`,
            sub: npsLabel(summary.nps_score),
            cardKey: 'nps',
            color: npsColor(summary.nps_score),
            icon: HeartPulse,
        },
        {
            title: 'Resolution Rate',
            value: `${summary.resolution_rate}%`,
            sub: 'Target SLA minimum 80%',
            cardKey: summary.resolution_rate >= 80 ? 'completed' : 'critical',
            color: summary.resolution_rate >= 80 ? '#10b981' : '#ef4444',
            icon: CheckCircle,
        },
        {
            title: 'Total Tiket',
            value: summary.total_tickets.toLocaleString('id-ID'),
            sub: `${summary.resolved} tiket selesai`,
            cardKey: 'in_progress',
            color: '#3b82f6',
            icon: Activity,
        },
        {
            title: 'Tiket Kritis',
            value: summary.critical,
            sub: 'Prioritas critical',
            cardKey: summary.critical > 0 ? 'critical' : 'completed',
            color: summary.critical > 0 ? '#ef4444' : '#10b981',
            icon: AlertCircle,
        },
    ] : [];

    const donutData = inboxStats ? [
        { name: 'Pending', value: inboxStats.pending, color: '#f59e0b' },
        { name: 'In Progress', value: inboxStats.in_progress, color: '#3b82f6' },
        { name: 'Completed', value: inboxStats.completed, color: '#10b981' },
        { name: 'Rejected', value: inboxStats.rejected, color: '#ef4444' },
    ].filter((d) => d.value > 0) : [];

    const witelBarData = summary
        ? Object.entries(summary.by_witel || {}).map(([name, v]) => ({ name, Tiket: v }))
        : [];

    const slaTarget = 80;
    const slaActual = summary?.resolution_rate || 0;

    return (
        <div className="page-content">
            <div className="page-header">
                <h2><HeartPulse size={18} style={{ verticalAlign: 'middle', color: '#ef4444' }} /> Customer Care &amp; NPS</h2>
            </div>
            <p className="page-description">
                Monitoring kesehatan layanan pelanggan: NPS, SLA resolution, prioritas tiket, dan tren gangguan per Witel.
            </p>

            {/* KPI — pastel filled */}
            <div className="inbox-stats-grid kpi-4-cols">
                {kpi.map((k, i) => (
                    <div key={i} className={`inbox-stat-card ${k.cardKey}`}>
                        <div className="stat-icon-wrap"><k.icon size={20} /></div>
                        <div>
                            <span className="stat-count">{k.value}</span>
                            <span className="stat-label">{k.title}</span>
                            <span style={{ fontSize: 11, opacity: 0.8, marginTop: 2, display: 'block' }}>{k.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* SLA meter */}
            <ChartCard title="SLA Resolution" subtitle={`Target minimum ${slaTarget}% · Realisasi ${slaActual}%`}>
                <div className="sla-bar-wrap">
                    <div className="sla-bar-track">
                        <div
                            className="sla-bar-fill"
                            style={{
                                width: `${Math.min(slaActual, 100)}%`,
                                background: slaActual >= slaTarget ? '#10b981' : '#ef4444',
                            }}
                        />
                        <div className="sla-bar-target" style={{ left: `${slaTarget}%` }} title={`Target ${slaTarget}%`} />
                    </div>
                    <div className="sla-bar-legend">
                        <span><span className="dot ok" /> Realisasi ({slaActual}%)</span>
                        <span><span className="dot target" /> Target SLA ({slaTarget}%)</span>
                    </div>
                </div>
            </ChartCard>

            {/* Charts */}
            <div className="dashboard-row">
                <ChartCard title="Status Tiket" subtitle={`Total ${inboxStats?.total || 0} tiket`}>
                    <DonutChart
                        data={donutData}
                        centerValue={String(inboxStats?.total || 0)}
                        centerLabel="TIKET"
                        height={240}
                        innerRadius={60}
                        outerRadius={90}
                        showLegend={true}
                    />
                </ChartCard>
                <ChartCard title="Gangguan per Witel" subtitle="Jumlah tiket per wilayah">
                    <BarChart
                        data={witelBarData}
                        bars={[{ dataKey: 'Tiket', name: 'Jumlah Tiket', color: '#3b82f6' }]}
                        height={240}
                        showLegend={false}
                    />
                </ChartCard>
            </div>

            {/* Churn indicator — pastel red block */}
            {summary && summary.churn_indicator >= 20 && (
                <div className="inbox-stat-card critical churn-banner">
                    <div className="stat-icon-wrap"><TrendingDown size={20} /></div>
                    <div>
                        <span className="stat-count">{summary.churn_indicator}%</span>
                        <span className="stat-label">Churn Indicator Tinggi</span>
                        <span style={{ fontSize: 11, opacity: 0.85, marginTop: 4, display: 'block' }}>
                            Indikasi potensi pelanggan pindah karena isu belum tertangani.
                        </span>
                    </div>
                </div>
            )}

            {/* Inbox CRUD table (embedded) */}
            <h3 className="section-subtitle">Daftar Tiket &amp; Inbox</h3>
            <InboxPage embedded />
        </div>
    );
}
