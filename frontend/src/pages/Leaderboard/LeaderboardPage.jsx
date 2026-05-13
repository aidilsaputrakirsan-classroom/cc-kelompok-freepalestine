import { useEffect, useState } from 'react';
import { Trophy, TrendingUp, CheckCircle } from 'lucide-react';
import { leaderboardApi } from '../../services/api';
import { useDataUploadEvent, getLastUpload } from '../../utils/uploadEvents';

const CURRENT_YEAR = new Date().getFullYear();
const BASE_YEARS = (() => {
    const set = new Set();
    for (let y = CURRENT_YEAR + 1; y >= CURRENT_YEAR - 3; y -= 1) set.add(y);
    const last = getLastUpload();
    if (last?.year) set.add(last.year);
    return Array.from(set).sort((a, b) => b - a);
})();

const rankColor = (rank) => {
    if (rank === 1) return '#f59e0b'; // gold
    if (rank === 2) return '#94a3b8'; // silver
    if (rank === 3) return '#f97316'; // bronze
    return '#64748b';
};

export default function LeaderboardPage() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(() => {
        const last = getLastUpload();
        return last?.year || CURRENT_YEAR;
    });
    const [extraYears, setExtraYears] = useState([]);

    useEffect(() => { load(); }, [year]);

    // Auto-switch ke tahun file yang baru di-upload (mis. sample_revenue_2026)
    // dan refresh data leaderboard.
    useDataUploadEvent((detail) => {
        if (detail?.year && detail.year !== year) {
            setExtraYears((prev) => prev.includes(detail.year) ? prev : [...prev, detail.year]);
            setYear(detail.year); // akan men-trigger load() via useEffect
        } else {
            load();
        }
    });

    const yearList = Array.from(new Set([...BASE_YEARS, ...extraYears, year]))
        .sort((a, b) => b - a);

    const load = async () => {
        setLoading(true);
        try {
            const data = await leaderboardApi.get({ year });
            setRows(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const top3 = rows.slice(0, 3);
    const rest = rows.slice(3);

    return (
        <div className="page-content">
            <div className="page-header">
                <h2><Trophy size={20} style={{ verticalAlign: 'middle', color: '#f59e0b' }} /> Witel Leaderboard</h2>
                <div className="filter-group">
                    <label>Tahun</label>
                    <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
                        {yearList.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            <p className="page-description">
                Peringkat kompetisi internal Witel Kalimantan. Gabungan <strong>capaian revenue (70%)</strong>
                dan <strong>tingkat penyelesaian tiket (30%)</strong>.
            </p>

            {loading ? (
                <div className="loading-spinner-wrapper"><div className="loading-spinner" /></div>
            ) : rows.length === 0 ? (
                <div className="empty-state">Belum ada data peringkat untuk tahun {year}.</div>
            ) : (
                <>
                    {/* Podium top 3 — satu kartu = satu warna konsisten */}
                    <div className="podium-grid">
                        {top3.map((r) => {
                            const rc = rankColor(r.rank);
                            return (
                                <div
                                    key={r.witel}
                                    className="podium-card"
                                    style={{
                                        '--rank-color': rc,
                                        borderTopColor: rc,
                                    }}
                                >
                                    <div className="podium-rank" style={{ background: rc }}>#{r.rank}</div>
                                    <h3 className="podium-witel">{r.witel}</h3>
                                    <div className="podium-score">
                                        <span className="podium-score-value" style={{ color: rc }}>
                                            {r.score.toFixed(1)}
                                        </span>
                                        <span className="podium-score-label">SKOR</span>
                                    </div>
                                    <div className="podium-stats">
                                        <div className="podium-stat">
                                            <TrendingUp size={14} style={{ color: rc }} />
                                            <span>Ach: <strong>{r.achievement}%</strong></span>
                                        </div>
                                        <div className="podium-stat">
                                            <CheckCircle size={14} style={{ color: rc }} />
                                            <span>Tiket: <strong>{r.resolution_rate}%</strong></span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Full table */}
                    <div className="table-wrapper" style={{ marginTop: 20 }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Peringkat</th><th>Witel</th><th>Revenue Actual</th><th>Target</th>
                                    <th>Achievement</th><th>Tiket Selesai</th><th>Total Tiket</th>
                                    <th>Resolution %</th><th>Skor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...top3, ...rest].map((r) => (
                                    <tr key={r.witel}>
                                        <td>
                                            <span className="rank-badge" style={{ background: rankColor(r.rank) }}>
                                                #{r.rank}
                                            </span>
                                        </td>
                                        <td><span className="witel-badge">{r.witel}</span></td>
                                        <td className="number">Rp {r.revenue_actual.toLocaleString('id-ID')}</td>
                                        <td className="number">Rp {r.revenue_target.toLocaleString('id-ID')}</td>
                                        <td>
                                            <span className={`ach-badge ${r.achievement >= 100 ? 'good' : 'warning'}`}>
                                                {r.achievement}%
                                            </span>
                                        </td>
                                        <td className="number">{r.tickets_resolved}</td>
                                        <td className="number">{r.tickets_total}</td>
                                        <td className="number">{r.resolution_rate}%</td>
                                        <td className="number"><strong>{r.score.toFixed(1)}</strong></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
