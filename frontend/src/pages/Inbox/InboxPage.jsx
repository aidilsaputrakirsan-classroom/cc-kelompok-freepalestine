import { useState, useEffect } from 'react';
import { inboxApi } from '../../services/api';
import { Plus, Search, Pencil, Trash2, X, ChevronLeft, ChevronRight, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';

const WITELS = ['BALIKPAPAN', 'KALBAR', 'KALSELTENG', 'KALTIMTARA'];
const STATUSES = ['pending', 'in_progress', 'completed', 'rejected'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const CATEGORIES = ['gangguan', 'permintaan', 'billing'];

const statusInfo = {
    pending: { label: 'Pending', icon: Clock, color: '#f59e0b' },
    in_progress: { label: 'In Progress', icon: AlertCircle, color: '#3b82f6' },
    completed: { label: 'Completed', icon: CheckCircle, color: '#10b981' },
    rejected: { label: 'Rejected', icon: XCircle, color: '#ef4444' },
};

const priorityColors = {
    low: '#94a3b8', medium: '#f59e0b', high: '#f97316', critical: '#ef4444',
};

export default function InboxPage() {
    const [data, setData] = useState({ total: 0, items: [] });
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [filterWitel, setFilterWitel] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const limit = 10;

    const [form, setForm] = useState({
        title: '', description: '', status: 'pending', priority: 'medium',
        witel: 'BALIKPAPAN', category: 'gangguan', assigned_to: '',
    });

    useEffect(() => { loadData(); }, [page, filterStatus, filterPriority, filterWitel]);

    const loadData = async () => {
        setLoading(true);
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
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSearch = (e) => { e.preventDefault(); setPage(0); loadData(); };

    const openCreate = () => {
        setEditItem(null);
        setForm({ title: '', description: '', status: 'pending', priority: 'medium', witel: 'BALIKPAPAN', category: 'gangguan', assigned_to: '' });
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditItem(item);
        setForm({ title: item.title, description: item.description || '', status: item.status, priority: item.priority, witel: item.witel, category: item.category || '', assigned_to: item.assigned_to || '' });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editItem) {
                await inboxApi.update(editItem.id, form);
            } else {
                await inboxApi.create(form);
            }
            setShowModal(false);
            loadData();
        } catch (err) { alert('Gagal menyimpan: ' + (err.response?.data?.detail || err.message)); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus tiket ini?')) return;
        try { await inboxApi.delete(id); loadData(); } catch (err) { alert('Gagal menghapus'); }
    };

    const totalPages = Math.ceil(data.total / limit);

    return (
        <div className="page-content">
            <div className="page-header">
                <h2>Inbox Monitoring</h2>
                <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Buat Tiket</button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="inbox-stats-grid">
                    {Object.entries(statusInfo).map(([key, info]) => (
                        <div key={key} className="inbox-stat-card" style={{ borderLeftColor: info.color }}>
                            <info.icon size={20} style={{ color: info.color }} />
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
                <form onSubmit={handleSearch} className="search-form">
                    <input type="text" placeholder="Cari judul tiket..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    <button type="submit"><Search size={16} /></button>
                </form>
                <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}>
                    <option value="">Semua Status</option>
                    {STATUSES.map((s) => <option key={s} value={s}>{statusInfo[s].label}</option>)}
                </select>
                <select value={filterPriority} onChange={(e) => { setFilterPriority(e.target.value); setPage(0); }}>
                    <option value="">Semua Prioritas</option>
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
                <select value={filterWitel} onChange={(e) => { setFilterWitel(e.target.value); setPage(0); }}>
                    <option value="">Semua Witel</option>
                    {WITELS.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
            </div>

            {/* Table */}
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
                            <tr><td colSpan="9" className="table-loading">Memuat data...</td></tr>
                        ) : data.items.length === 0 ? (
                            <tr><td colSpan="9" className="table-empty">Tidak ada tiket</td></tr>
                        ) : data.items.map((item) => {
                            const si = statusInfo[item.status] || statusInfo.pending;
                            return (
                                <tr key={item.id}>
                                    <td className="number">#{item.id}</td>
                                    <td className="title-cell">
                                        <span className="inbox-title">{item.title}</span>
                                        {item.description && <span className="inbox-desc">{item.description.substring(0, 60)}...</span>}
                                    </td>
                                    <td><span className="status-badge" style={{ background: `${si.color}22`, color: si.color }}>{si.label}</span></td>
                                    <td><span className="priority-dot" style={{ background: priorityColors[item.priority] }} />{item.priority}</td>
                                    <td><span className="witel-badge">{item.witel}</span></td>
                                    <td>{item.category || '-'}</td>
                                    <td>{item.assigned_to || <span className="unassigned">Belum</span>}</td>
                                    <td className="date-cell">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="btn-icon edit" onClick={() => openEdit(item)}><Pencil size={14} /></button>
                                            <button className="btn-icon delete" onClick={() => handleDelete(item.id)}><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
                <span className="pagination-info">Menampilkan {page * limit + 1}-{Math.min((page + 1) * limit, data.total)} dari {data.total}</span>
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
                            <div className="form-group full"><label>Judul</label><input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                            <div className="form-group full"><label>Deskripsi</label><textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                            <div className="form-row">
                                <div className="form-group"><label>Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{STATUSES.map((s) => <option key={s} value={s}>{statusInfo[s].label}</option>)}</select></div>
                                <div className="form-group"><label>Prioritas</label><select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}</select></div>
                                <div className="form-group"><label>Witel</label><select value={form.witel} onChange={(e) => setForm({ ...form, witel: e.target.value })}>{WITELS.map((w) => <option key={w} value={w}>{w}</option>)}</select></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Kategori</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
                                <div className="form-group"><label>Assigned To</label><input type="text" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} placeholder="Nama teknisi/AM" /></div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary">{editItem ? 'Simpan' : 'Buat Tiket'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
