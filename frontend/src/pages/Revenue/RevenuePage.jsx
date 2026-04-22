import { useState, useEffect, useRef } from 'react';
import { salesApi } from '../../services/api';
import { useToast, extractErrorMessage } from '../../components/Toast/ToastProvider';
import { useDataUploadEvent } from '../../utils/uploadEvents';
import { Plus, Search, Pencil, Trash2, X, ChevronLeft, ChevronRight, Download } from 'lucide-react';

const WITELS = ['BALIKPAPAN', 'KALBAR', 'KALSELTENG', 'KALTIMTARA'];
const CHANNELS = ['Direct', 'Mitra', 'Online'];
const PRODUCTS = ['HSI', 'B2B', 'WMS'];

export default function RevenuePage() {
    const toast = useToast();

    const [data, setData] = useState({ total: 0, items: [] });
    const [loading, setLoading] = useState(true);
    const [filterLoading, setFilterLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const [filterWitel, setFilterWitel] = useState('');
    const [filterProduct, setFilterProduct] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const limit = 15;

    const [form, setForm] = useState({
        witel: 'BALIKPAPAN', channel: 'Direct', product: 'HSI',
        revenue_target: '', revenue_actual: '', sales_target: '', sales_actual: '',
        period_month: new Date().getMonth() + 1, period_year: 2025,
    });

    const isFirstLoad = useRef(true);

    // Debounced live search: setiap kali user mengetik, tunggu 300 ms
    // sebelum memanggil API. Initial mount dijalankan tanpa delay.
    useEffect(() => {
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            loadData(false);
            return;
        }
        const t = setTimeout(() => loadData(true), 300);
        return () => clearTimeout(t);
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [page, filterWitel, filterProduct, search]);

    // Auto-refresh kalau ada file revenue baru di-upload.
    useDataUploadEvent((detail) => {
        if (detail?.target === 'sales') {
            setPage(0);
            loadData(true);
        }
    });

    const loadData = async (isFilter = false) => {
        if (isFilter) setFilterLoading(true); else setLoading(true);
        try {
            const params = { skip: page * limit, limit, search: search || undefined };
            if (filterWitel) params.witel = filterWitel;
            if (filterProduct) params.product = filterProduct;
            const res = await salesApi.list(params);
            setData(res);
        } catch (err) {
            toast.error('Gagal memuat data', extractErrorMessage(err));
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
        // Live search — submit form hanya ditahan supaya Enter tidak
        // me-reload halaman. Query tetap mengalir lewat useEffect debounced.
        e.preventDefault();
    };

    const onSearchChange = (value) => {
        setSearch(value);
        setPage(0);
        setFilterLoading(true);
    };

    const openCreate = () => {
        setEditItem(null);
        setForm({
            witel: 'BALIKPAPAN', channel: 'Direct', product: 'HSI',
            revenue_target: '', revenue_actual: '', sales_target: '', sales_actual: '',
            period_month: new Date().getMonth() + 1, period_year: 2025,
        });
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditItem(item);
        setForm({
            witel: item.witel, channel: item.channel, product: item.product,
            revenue_target: item.revenue_target, revenue_actual: item.revenue_actual,
            sales_target: item.sales_target, sales_actual: item.sales_actual,
            period_month: item.period_month, period_year: item.period_year,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                revenue_target: Number(form.revenue_target),
                revenue_actual: Number(form.revenue_actual),
                sales_target: Number(form.sales_target),
                sales_actual: Number(form.sales_actual),
                period_month: Number(form.period_month),
                period_year: Number(form.period_year),
            };
            if (editItem) {
                await salesApi.update(editItem.id, payload);
                toast.success('Data revenue diperbarui', `${payload.witel} · ${payload.product} · bulan ${payload.period_month}/${payload.period_year}`);
            } else {
                await salesApi.create(payload);
                toast.success('Data revenue ditambahkan', `${payload.witel} · ${payload.product} · bulan ${payload.period_month}/${payload.period_year}`);
            }
            setShowModal(false);
            loadData();
        } catch (err) {
            toast.error('Gagal menyimpan data', extractErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        if (!confirm(`Hapus data revenue ${item.witel} · ${item.product} (${item.period_month}/${item.period_year})?`)) return;
        try {
            await salesApi.delete(item.id);
            toast.success('Data dihapus', `${item.witel} · ${item.product}`);
            loadData();
        } catch (err) {
            toast.error('Gagal menghapus', extractErrorMessage(err));
        }
    };

    const handleExportCSV = async () => {
        setExporting(true);
        try {
            const params = { skip: 0, limit: 1000, search: search || undefined };
            if (filterWitel) params.witel = filterWitel;
            if (filterProduct) params.product = filterProduct;
            const res = await salesApi.list(params);
            const items = res?.items || [];
            if (!items.length) {
                toast.warning('Tidak ada data untuk diekspor', 'Coba ubah filter atau tambahkan data terlebih dahulu.');
                return;
            }

            const headers = [
                'id', 'witel', 'telda', 'channel', 'product',
                'revenue_target', 'revenue_actual', 'achievement_pct',
                'sales_target', 'sales_actual', 'period_month', 'period_year',
                'nama_pelanggan', 'layanan', 'nama_am',
            ];
            const esc = (v) => {
                if (v === null || v === undefined) return '';
                const s = String(v).replace(/"/g, '""');
                return /[",\n]/.test(s) ? `"${s}"` : s;
            };
            const lines = [headers.join(',')];
            items.forEach((i) => {
                const ach = i.revenue_target > 0 ? ((i.revenue_actual / i.revenue_target) * 100).toFixed(2) : '0.00';
                lines.push([
                    i.id, i.witel, i.telda || '', i.channel, i.product,
                    Number(i.revenue_target).toFixed(2), Number(i.revenue_actual).toFixed(2), ach,
                    i.sales_target, i.sales_actual, i.period_month, i.period_year,
                    i.nama_pelanggan || '', i.layanan || '', i.nama_am || '',
                ].map(esc).join(','));
            });
            const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const fileName = `revenue_export_${new Date().toISOString().slice(0, 10)}.csv`;
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success('Export berhasil', `${items.length} baris diekspor sebagai ${fileName}`);
        } catch (err) {
            toast.error('Gagal ekspor CSV', extractErrorMessage(err));
        } finally {
            setExporting(false);
        }
    };

    const totalPages = Math.ceil(data.total / limit);

    return (
        <div className="page-content">
            <div className="page-header">
                <h2>Revenue Analytics</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary" onClick={handleExportCSV} disabled={exporting}>
                        <Download size={16} /> {exporting ? 'Mengekspor...' : 'Export CSV'}
                    </button>
                    <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Tambah Data</button>
                </div>
            </div>

            {/* Filters */}
            <div className="table-filters">
                <form onSubmit={handleSearch} className="search-form" role="search">
                    <input
                        type="text"
                        placeholder="Cari witel, channel, atau pelanggan..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        autoComplete="off"
                    />
                    <button type="submit" title="Cari"><Search size={16} /></button>
                </form>
                <select value={filterWitel} onChange={(e) => applyFilter(setFilterWitel)(e.target.value)}>
                    <option value="">Semua Witel</option>
                    {WITELS.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
                <select value={filterProduct} onChange={(e) => applyFilter(setFilterProduct)(e.target.value)}>
                    <option value="">Semua Produk</option>
                    {PRODUCTS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>

            {/* Table with filter overlay */}
            <div className={`filter-loading-overlay ${filterLoading ? 'is-loading' : ''}`}>
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Witel</th><th>Channel</th><th>Produk</th>
                                <th>Target (M)</th><th>Actual (M)</th><th>Ach%</th>
                                <th>SSL Target</th><th>SSL Actual</th>
                                <th>Bulan</th><th>Tahun</th><th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        {Array.from({ length: 11 }).map((__, j) => (
                                            <td key={j}><span className="skeleton skeleton-long" /></td>
                                        ))}
                                    </tr>
                                ))
                            ) : data.items.length === 0 ? (
                                <tr><td colSpan="11" className="table-empty">Tidak ada data untuk filter ini.</td></tr>
                            ) : data.items.map((item) => {
                                const ach = item.revenue_target > 0 ? ((item.revenue_actual / item.revenue_target) * 100).toFixed(1) : '0.0';
                                return (
                                    <tr key={item.id}>
                                        <td><span className="witel-badge">{item.witel}</span></td>
                                        <td>{item.channel}</td>
                                        <td><span className="product-badge">{item.product}</span></td>
                                        <td className="number">{Number(item.revenue_target).toFixed(2)}</td>
                                        <td className="number">{Number(item.revenue_actual).toFixed(2)}</td>
                                        <td><span className={`ach-badge ${parseFloat(ach) >= 100 ? 'good' : 'warning'}`}>{ach}%</span></td>
                                        <td className="number">{item.sales_target.toLocaleString('id-ID')}</td>
                                        <td className="number">{item.sales_actual.toLocaleString('id-ID')}</td>
                                        <td>{item.period_month}</td>
                                        <td>{item.period_year}</td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="btn-icon edit" onClick={() => openEdit(item)} title="Edit"><Pencil size={14} /></button>
                                                <button className="btn-icon delete" onClick={() => handleDelete(item)} title="Hapus"><Trash2 size={14} /></button>
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
                        <span className="mini-spinner-label">Memuat data...</span>
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
                            <h3>{editItem ? 'Edit Data Revenue' : 'Tambah Data Revenue'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Witel</label>
                                    <select value={form.witel} onChange={(e) => setForm({ ...form, witel: e.target.value })}>
                                        {WITELS.map((w) => <option key={w} value={w}>{w}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Channel</label>
                                    <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
                                        {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Produk</label>
                                    <select value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })}>
                                        {PRODUCTS.map((p) => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Revenue Target (Miliar)</label>
                                    <input type="number" step="0.01" required
                                        placeholder="Contoh: 12.50"
                                        value={form.revenue_target}
                                        onChange={(e) => setForm({ ...form, revenue_target: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Revenue Actual (Miliar)</label>
                                    <input type="number" step="0.01" required
                                        placeholder="Contoh: 11.85"
                                        value={form.revenue_actual}
                                        onChange={(e) => setForm({ ...form, revenue_actual: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>SSL Target (jumlah pelanggan)</label>
                                    <input type="number" required
                                        placeholder="Contoh: 250"
                                        value={form.sales_target}
                                        onChange={(e) => setForm({ ...form, sales_target: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>SSL Actual (jumlah pelanggan)</label>
                                    <input type="number" required
                                        placeholder="Contoh: 238"
                                        value={form.sales_actual}
                                        onChange={(e) => setForm({ ...form, sales_actual: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Bulan (1-12)</label>
                                    <input type="number" min="1" max="12" required
                                        placeholder="Contoh: 4"
                                        value={form.period_month}
                                        onChange={(e) => setForm({ ...form, period_month: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Tahun</label>
                                    <input type="number" min="2020" max="2030" required
                                        placeholder="Contoh: 2025"
                                        value={form.period_year}
                                        onChange={(e) => setForm({ ...form, period_year: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Menyimpan...' : (editItem ? 'Simpan' : 'Tambah')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
