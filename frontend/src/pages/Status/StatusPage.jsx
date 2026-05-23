import { useState, useEffect, useCallback } from 'react';
import { Activity, Server, Shield, Wifi, WifiOff, RefreshCw, Clock } from 'lucide-react';

/**
 * StatusPage — Health Dashboard (Modul 14: Monitoring & Observability)
 * 
 * Menampilkan status real-time semua microservices:
 * - Auth Service health + metrics
 * - Dashboard Service health + metrics (circuit breaker state)
 * - API Gateway health
 * 
 * Auto-refresh setiap 10 detik.
 */

const GATEWAY_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
// Microservices gateway biasanya di port 8080
const MICROSERVICES_URL = 'http://localhost:8080';

function ServiceCard({ name, icon: Icon, healthUrl, metricsUrl, description }) {
    const [health, setHealth] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastChecked, setLastChecked] = useState(null);

    const fetchStatus = useCallback(async () => {
        setLoading(true);
        try {
            const healthRes = await fetch(healthUrl, { signal: AbortSignal.timeout(5000) });
            const healthData = await healthRes.json();
            setHealth(healthData);
        } catch {
            setHealth({ status: 'unreachable' });
        }

        if (metricsUrl) {
            try {
                const metricsRes = await fetch(metricsUrl, { signal: AbortSignal.timeout(5000) });
                const metricsData = await metricsRes.json();
                setMetrics(metricsData);
            } catch {
                setMetrics(null);
            }
        }

        setLoading(false);
        setLastChecked(new Date());
    }, [healthUrl, metricsUrl]);

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 10000);
        return () => clearInterval(interval);
    }, [fetchStatus]);

    const statusColor = {
        healthy: '#22c55e',
        degraded: '#f59e0b',
        unhealthy: '#ef4444',
        unreachable: '#6b7280',
    };

    const statusLabel = {
        healthy: 'Healthy',
        degraded: 'Degraded',
        unhealthy: 'Unhealthy',
        unreachable: 'Unreachable',
    };

    const status = health?.status || 'unreachable';
    const color = statusColor[status] || statusColor.unreachable;

    return (
        <div className="status-card" style={{ borderLeft: `4px solid ${color}` }}>
            <div className="status-card-header">
                <div className="status-card-title">
                    <Icon size={20} style={{ color: 'var(--text-secondary)' }} />
                    <div>
                        <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>{name}</h3>
                        {description && <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{description}</p>}
                    </div>
                </div>
                <span className="status-badge" style={{ background: color }}>
                    {loading ? '...' : statusLabel[status]}
                </span>
            </div>

            {/* Circuit Breaker Info (jika ada) */}
            {health?.circuit_breaker && (
                <div className="status-circuit-breaker">
                    <span className="cb-label">Circuit Breaker:</span>
                    <span className={`cb-state cb-${health.circuit_breaker.state}`}>
                        {health.circuit_breaker.state.toUpperCase()}
                    </span>
                    <span className="cb-detail">
                        ({health.circuit_breaker.failure_count}/{health.circuit_breaker.threshold} failures)
                    </span>
                </div>
            )}

            {/* Metrics */}
            {metrics && (
                <div className="status-metrics">
                    <div className="metric-item">
                        <span className="metric-label">Requests</span>
                        <span className="metric-value">{metrics.requests_total?.toLocaleString()}</span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-label">Errors</span>
                        <span className="metric-value" style={{ color: metrics.errors_total > 0 ? '#ef4444' : 'inherit' }}>
                            {metrics.errors_total}
                        </span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-label">Error Rate</span>
                        <span className="metric-value">
                            {metrics.requests_total > 0
                                ? `${((metrics.errors_total / metrics.requests_total) * 100).toFixed(1)}%`
                                : '0%'}
                        </span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-label">Avg Latency</span>
                        <span className="metric-value">
                            {metrics.avg_latency_seconds
                                ? `${(metrics.avg_latency_seconds * 1000).toFixed(1)}ms`
                                : '—'}
                        </span>
                    </div>
                    {metrics.requests_by_status && Object.keys(metrics.requests_by_status).length > 0 && (
                        <div className="metric-item metric-wide">
                            <span className="metric-label">Status Codes</span>
                            <span className="metric-value metric-codes">
                                {Object.entries(metrics.requests_by_status).map(([code, count]) => (
                                    <span key={code} className={`code-badge code-${code[0]}xx`}>
                                        {code}: {count}
                                    </span>
                                ))}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {lastChecked && (
                <div className="status-card-footer">
                    <Clock size={12} />
                    <span>Last checked: {lastChecked.toLocaleTimeString()}</span>
                </div>
            )}
        </div>
    );
}

export default function StatusPage() {
    const [refreshing, setRefreshing] = useState(false);

    const handleManualRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
        // Force re-render triggers useEffect in children
        window.dispatchEvent(new Event('status-refresh'));
    };

    return (
        <div className="page-content">
            <div className="status-page-header">
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                        <Activity size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                        System Status
                    </h1>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                        Real-time health monitoring — auto-refresh setiap 10 detik
                    </p>
                </div>
                <button
                    className="btn-refresh"
                    onClick={handleManualRefresh}
                    disabled={refreshing}
                >
                    <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
                    Refresh
                </button>
            </div>

            <div className="status-grid">
                {/* Auth Service */}
                <ServiceCard
                    name="Auth Service"
                    icon={Shield}
                    description="Authentication & JWT token management (port 8001)"
                    healthUrl={`${MICROSERVICES_URL}/health/auth`}
                    metricsUrl={`${MICROSERVICES_URL}/metrics/auth`}
                />

                {/* Dashboard Service */}
                <ServiceCard
                    name="Dashboard Service"
                    icon={Server}
                    description="Sales & Inbox data with circuit breaker (port 8002)"
                    healthUrl={`${MICROSERVICES_URL}/health/dashboard`}
                    metricsUrl={`${MICROSERVICES_URL}/metrics/dashboard`}
                />

                {/* API Gateway */}
                <ServiceCard
                    name="API Gateway"
                    icon={Wifi}
                    description="Nginx reverse proxy, rate limiting, routing (port 8080)"
                    healthUrl={`${MICROSERVICES_URL}/health`}
                    metricsUrl={null}
                />

                {/* Monolith Backend (jika jalan) */}
                <ServiceCard
                    name="Monolith Backend"
                    icon={Server}
                    description="Main FastAPI app — monolith mode (port 8000)"
                    healthUrl={`${GATEWAY_URL}/health`}
                    metricsUrl={null}
                />
            </div>

            <div className="status-info-box">
                <h3>📖 Tentang Monitoring (Modul 14)</h3>
                <p>Halaman ini menampilkan <strong>Three Pillars of Observability</strong>:</p>
                <ul>
                    <li><strong>Health Check</strong> — Status tiap service (healthy/degraded/unreachable)</li>
                    <li><strong>Metrics</strong> — Request count, error rate, average latency</li>
                    <li><strong>Circuit Breaker</strong> — State (closed/open/half_open) untuk inter-service reliability</li>
                </ul>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Correlation ID diteruskan via header <code>X-Correlation-ID</code> untuk request tracing lintas service.
                </p>
            </div>
        </div>
    );
}
