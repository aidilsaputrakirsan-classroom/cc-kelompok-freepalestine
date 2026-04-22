import { useState, useEffect, useRef } from 'react';
import { inboxApi } from '../../services/api';
import { useToast, extractErrorMessage } from '../../components/Toast/ToastProvider';
import { useDataUploadEvent } from '../../utils/uploadEvents';
import { capitalize } from '../../utils/text';
import {
    Plus, Search, Pencil, Trash2, X, ChevronLeft, ChevronRight, Download,
    AlertCircle, Clock, CheckCircle, XCircle,
} from 'lucide-react';

const WITELS = ['BALIKPAPAN', 'KALBAR', 'KALSELTENG', 'KALTIMTARA'];
const STATUSES = ['pending', 'in_progress', 'completed', 'rejected'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const CATEGORIES = ['gangguan', 'permintaan', 'billing'];

const statusInfo = {
    pending:     { label: 'Pending',     icon: Clock,        color: '#f59e0b', cardKey: 'pending' },
    in_progress: { label: 'In Progress', icon: AlertCircle,  color: '#3b82f6', cardKey: 'in_progress' },
    completed:   { label: 'Completed',   icon: CheckCircle,  color: '#10b981', cardKey: 'completed' },
    rejected:    { label: 'Rejected',    icon: XCircle,      color: '#ef4444', cardKey: 'rejected' },
};

const priorityColors = {
    low: '#94a3b8', medium: '#f59e0b', high: '#f97316', critical: '#ef4444',
};

export default function InboxPage({ embedded = false }) {
    const toast = useToast();

    const [data, setData] = useState({ total: 0, items: [] });
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterLoading, setFilterLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [filterWitel, setFilterWitel] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const limit = 10;

    const [form, setForm] = useState({
        title: '', description: '', status: 'pending', priority: 'medium',
        witel: 'BALIKPAPAN', category: 'gangguan', assigned_to: '',
    });

    const isFirstLoad = useRef(true);

    // Debounced live search + reload saat filter/page berubah.
    useEffect(() => {
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            loadData(false);
            return;
        }
        const t = setTimeout(() => loadData(true), 300);
        return () => clearTimeout(t);
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [page, filterStatus, filterPriority, filterWitel, search]);

    // Auto-refresh bila ada upload file inbox baru.
    useDataUploadEvent((detail) => {
        if (detail?.target === 'inbox') {
            setPage(0);
            loadData(true);
        }
    });

    const loadData = async (isFilter = false) => {
        if (isFilter) setFilterLoading(true); else setLoading(true);
        try {
            const params = { skip: page * limit, limit, search: search || undefined };
            if (filterStatus) params.status = filterStatus;
            if (filterPriority) params.priority = filterPriority;
            if (filterWitel) params.witel = filterWitel;

            const [listRes, statsRes] = await Promise.all([
                inboxApi.list(params),
                inboxApi.stats(filterWitel ? { witel: filterWitel } : {}),
            ]);
            setData(listRes);
            setStats(statsRes);
        } catch (err) {
            toast.error('Gagal memuat inbox', extractErrorMessage(err));
        } finally {
            setLoading(false);
            setFilterLoading(false);
        }
    };

    const applyFilter = (setter) => (value) => {
        setter(value);
        setPage(0);
        setFilterLoading(true);
    };

    const handleSearch = (e) => {
        // Live search — cegah reload form, query sudah jalan via useEffect debounced.
        e.preventDefault();
    };

    const onSearchChange = (value) => {
        setSearch(value);
        setPage(0);
        setFilterLoading(true);
    };

    const handleExportCSV = async () => {
        setExporting(true);
        try {
            const params = { skip: 0, limit: 5000, search: search || undefined };
            if (filterStatus) params.status = filterStatus;
            if (filterPriority) params.priority = filterPriority;
            if (filterWitel) params.witel = filterWitel;
            const res = await inboxApi.list(params);
            const items = res?.items || [];
            if (!items.length) {
                toast.warning('Tidak ada tiket untuk diekspor', 'Ubah filter atau buat tiket terlebih dahulu.');
                return;
            }
            const headers = [
                'id', 'title', 'status', 'priority', 'witel', 'category',
                'assigned_to', 'description', 'created_at', 'resolved_at',
            ];
            const esc = (v) => {
                if (v === null || v === undefined) return '';
                const s = String(v).replace(/"/g, '""');
                return /[",\n]/.test(s) ? `"${s}"` : s;
            };
            const lines = [headers.join(',')];
            items.forEach((i) => {
                lines.push([
                    i.id, i.title, i.status, i.priority, i.witel,
                    i.category || '', i.assigned_to || '', i.description || '',
                    i.created_at || '', i.resolved_at || '',
                ].map(esc).join(','));
            });
            const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const fileName = `inbox_export_${new Date().toISOString().slice(0, 10)}.csv`;
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('Export berhasil', `${items.length} tiket diekspor sebagai ${fileName}`);
        } catch (err) {
            toast.error('Gagal ekspor CSV', extractErrorMessage(err));
        } finally {
            setExporting(false);
        }
    };

    const openCreate = () => {
        setEditItem(null);
        setForm({
            title: '', description: '', status: 'pending', priority: 'medium',
            witel: 'BALIKPAPAN', category: 'gangguan', assigned_to: '',
        });
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditItem(item);
        setForm({
            title: item.title, description: item.description || '',
            status: item.status, priority: item.priority,
            witel: item.witel, category: item.category || '',
            assigned_to: item.assigned_to || '',
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editItem) {
                await inboxApi.update(editItem.id, form);
                toast.success('Tiket diperbarui', form.title);
            } else {
                await inboxApi.create(form);
                toast.success('Tiket baru dibuat', form.title);
            }
            setShowModal(false);
            loadData();
        } catch (err) {
            toast.error('Gagal menyimpan tiket', extractErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        if (!confirm(`Hapus tiket "${item.title}"?`)) return;
        try {
            await inboxApi.delete(item.id);
            toast.success('Tiket dihapus', item.title);
            loadData();
        } catch (err) {
            toast.error('Gagal menghapus tiket', extractErrorMessage(err));
        }
    };

    const totalPages = Math.ceil(data.total / limit);

    return (
        <div className={embedded ? 'embedded-content' : 'page-content'}>
            {!embedded && (
                <div className="page-header">
                    <h2>Inbox Monitoring</h2>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary" onClick={handleExportCSV} disabled={exporting}>
                            <Download size={16} /> {exporting ? 'Mengekspor...' : 'Download CSV'}
                        </button>
                        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Buat Tiket</button>
                    </div>
                </div>
            )}
            {embedded && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 8 }}>
                    <button className="btn btn-secondary" onClick={handleExportCSV} disabled={exporting}>
                        <Download size={16} /> {exporting ? 'Mengekspor...' : 'Download CSV'}
                    </button>
                    <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Buat Tiket</button>
                </div>
            )}

            {/* Stats Cards (pastel filled) */}
            {stats && !embedded && (
                <div className="inbox-stats-grid">
                    {Object.entries(statusInfo).map(([key, info]) => (
                        <div key={key} className={`inbox-stat-card ${info.cardKey}`}>
                            <div className="stat-icon-wrap"><info.icon size={18} /></div>
                            <div>
                                <span className="stat-count">{stats[key] || 0}</span>
                                <span className="stat-label">{info.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Filters */}
            <div className="table-filters">
                <form onSubmit={handleSearch} className="search-form" role="search">
                    <input
                        type="text"
                        placeholder="Cari judul atau deskripsi tiket..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        autoComplete="off"
                    />
                    <button type="submit" title="Cari"><Search size={16} /></button>
                </form>
                <select value={filterStatus} onChange={(e) => applyFilter(setFilterStatus)(e.target.value)}>
                    <option value="">Semua Status</option>
                    {STATUSES.map((s) => <option key={s} value={s}>{statusInfo[s].label}</option>)}
                </select>
                <select value={filterPriority} onChange={(e) => applyFilter(setFilterPriority)(e.target.value)}>
                    <option value="">Semua Prioritas</option>
                    {PRIORITIES.map((p) => <option key={p} value={p}>{capitalize(p)}</option>)}
                </select>
                <select value={filterWitel} onChange={(e) => applyFilter(setFilterWitel)(e.target.value)}>
                    <option value="">Semua Witel</option>
                    {WITELS.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
            </div>

            {/* Table with filter loading overlay */}
            <div className={`filter-loading-overlay ${filterLoading ? 'is-loading' : ''}`}>
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th><th>Judul</th><th>Status</th><th>Prioritas</th>
                                <th>Witel</th><th>Kategori</th><th>Assigned</th><th>Dibuat</th><th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        {Array.from({ length: 9 }).map((__, j) => (
                                            <td key={j}><span className="skeleton skeleton-long" /></td>
                                        ))}
                                    </tr>
                                ))
                            ) : data.items.length === 0 ? (
                                <tr><td colSpan="9" className="table-empty">Tidak ada tiket untuk filter ini.</td></tr>
                            ) : data.items.map((item) => {
                                const si = statusInfo[item.status] || statusInfo.pending;
                                return (
                                    <tr key={item.id}>
                                        <td className="number">#{item.id}</td>
                                        <td className="title-cell">
                                            <span className="inbox-title">{item.title}</span>
                                            {item.description && (
                                                <span className="inbox-desc">{item.description.substring(0, 60)}...</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className="status-badge" style={{ background: `${si.color}22`, color: si.color }}>
                                                {si.label}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="priority-dot" style={{ background: priorityColors[item.priority] }} />
                                            {capitalize(item.priority)}
                                        </td>
                                        <td><span className="witel-badge">{item.witel}</span></td>
                                        <td>{item.category ? capitalize(item.category) : <span className="unassigned">-</span>}</td>
                                        <td>{item.assigned_to || <span className="unassigned">Belum</span>}</td>
                                        <td className="date-cell">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="btn-icon edit" onClick={() => openEdit(item)} title="Edit">
                                                    <Pencil size={14} />
                                                </button>
                                                <button className="btn-icon delete" onClick={() => handleDelete(item)} title="Hapus">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filterLoading && (
                    <div className="filter-loading-spinner">
                        <div className="mini-spinner" />
                        <span className="mini-spinner-label">Memuat...</span>
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="pagination">
                <span className="pagination-info">
                    Menampilkan {data.items.length ? page * limit + 1 : 0}-{Math.min((page + 1) * limit, data.total)} dari {data.total}
                </span>
                <div className="pagination-btns">
                    <button disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft size={16} /></button>
                    <span>Hal {page + 1} / {totalPages || 1}</span>
                    <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}><ChevronRight size={16} /></button>
                </div>
            </div>

            {/* Modal Form */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editItem ? 'Edit Tiket' : 'Buat Tiket Baru'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group full">
                                <label>Judul Tiket</label>
                                <input type="text" required
                                    placeholder="Contoh: Gangguan jaringan fiber Balikpapan Selatan"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })} />
                            </div>
                            <div className="form-group full">
                                <label>Deskripsi</label>
                                <textarea rows="3"
                                    placeholder="Contoh: Pelanggan melaporkan gangguan berulang sejak 3 hari, area terdampak 200 pelanggan."
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Status</label>
                                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                                        {STATUSES.map((s) => <option key={s} value={s}>{statusInfo[s].label}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Prioritas</label>
                                    <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                                        {PRIORITIES.map((p) => <option key={p} value={p}>{capitalize(p)}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Witel</label>
                                    <select value={form.witel} onChange={(e) => setForm({ ...form, witel: e.target.value })}>
                                        {WITELS.map((w) => <option key={w} value={w}>{w}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Kategori</label>
                                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                        {CATEGORIES.map((c) => <option key={c} value={c}>{capitalize(c)}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Assigned To</label>
                                    <input type="text"
                                        placeholder="Contoh: Teknisi Tim A / AM Kalbar"
                                        value={form.assigned_to}
                                        onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Menyimpan...' : (editItem ? 'Simpan' : 'Buat Tiket')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
