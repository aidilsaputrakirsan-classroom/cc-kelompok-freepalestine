import { useState, useEffect } from 'react';
import { salesApi } from '../../services/api';
import { Plus, Search, Pencil, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';

const WITELS = ['BALIKPAPAN', 'KALBAR', 'KALSELTENG', 'KALTIMTARA'];
const CHANNELS = ['Direct', 'Mitra', 'Online'];
const PRODUCTS = ['HSI', 'B2B', 'WMS'];

export default function RevenuePage() {
    const [data, setData] = useState({ total: 0, items: [] });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const [filterWitel, setFilterWitel] = useState('');
    const [filterProduct, setFilterProduct] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const limit = 15;

    const [form, setForm] = useState({
        witel: 'BALIKPAPAN', channel: 'Direct', product: 'HSI',
        revenue_target: '', revenue_actual: '', sales_target: '', sales_actual: '',
        period_month: new Date().getMonth() + 1, period_year: 2025,
    });

    useEffect(() => { loadData(); }, [page, filterWitel, filterProduct]);

    const loadData = async () => {
        setLoading(true);
        try {
            const params = { skip: page * limit, limit, search: search || undefined };
            if (filterWitel) params.witel = filterWitel;
            if (filterProduct) params.product = filterProduct;
            const res = await salesApi.list(params);
            setData(res);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0);
        loadData();
    };

    const openCreate = () => {
        setEditItem(null);
        setForm({ witel: 'BALIKPAPAN', channel: 'Direct', product: 'HSI', revenue_target: '', revenue_actual: '', sales_target: '', sales_actual: '', period_month: new Date().getMonth() + 1, period_year: 2025 });
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditItem(item);
        setForm({ witel: item.witel, channel: item.channel, product: item.product, revenue_target: item.revenue_target, revenue_actual: item.revenue_actual, sales_target: item.sales_target, sales_actual: item.sales_actual, period_month: item.period_month, period_year: item.period_year });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form, revenue_target: Number(form.revenue_target), revenue_actual: Number(form.revenue_actual), sales_target: Number(form.sales_target), sales_actual: Number(form.sales_actual), period_month: Number(form.period_month), period_year: Number(form.period_year) };
            if (editItem) {
                await salesApi.update(editItem.id, payload);
            } else {
                await salesApi.create(payload);
            }
            setShowModal(false);
            loadData();
        } catch (err) { alert('Gagal menyimpan: ' + (err.response?.data?.detail || err.message)); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus data ini?')) return;
        try {
            await salesApi.delete(id);
            loadData();
        } catch (err) { alert('Gagal menghapus'); }
    };

    const totalPages = Math.ceil(data.total / limit);

    return (
        <div className="page-content">
            <div className="page-header">
                <h2>Data Revenue</h2>
                <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Tambah Data</button>
            </div>

            {/* Filters */}
            <div className="table-filters">
                <form onSubmit={handleSearch} className="search-form">
                    <input type="text" placeholder="Cari witel atau channel..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    <button type="submit"><Search size={16} /></button>
                </form>
                <select value={filterWitel} onChange={(e) => { setFilterWitel(e.target.value); setPage(0); }}>
                    <option value="">Semua Witel</option>
                    {WITELS.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
                <select value={filterProduct} onChange={(e) => { setFilterProduct(e.target.value); setPage(0); }}>
                    <option value="">Semua Produk</option>
                    {PRODUCTS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>

            {/* Table */}
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
                            <tr><td colSpan="11" className="table-loading">Memuat data...</td></tr>
                        ) : data.items.length === 0 ? (
                            <tr><td colSpan="11" className="table-empty">Tidak ada data</td></tr>
                        ) : data.items.map((item) => {
                            const ach = item.revenue_target > 0 ? ((item.revenue_actual / item.revenue_target) * 100).toFixed(1) : '0.0';
                            return (
                                <tr key={item.id}>
                                    <td><span className="witel-badge">{item.witel}</span></td>
                                    <td>{item.channel}</td>
                                    <td><span className="product-badge">{item.product}</span></td>
                                    <td className="number">{item.revenue_target.toFixed(2)}</td>
                                    <td className="number">{item.revenue_actual.toFixed(2)}</td>
                                    <td><span className={`ach-badge ${parseFloat(ach) >= 100 ? 'good' : 'warning'}`}>{ach}%</span></td>
                                    <td className="number">{item.sales_target.toLocaleString()}</td>
                                    <td className="number">{item.sales_actual.toLocaleString()}</td>
                                    <td>{item.period_month}</td>
                                    <td>{item.period_year}</td>
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
                                <div className="form-group"><label>Revenue Target (M)</label><input type="number" step="0.01" required value={form.revenue_target} onChange={(e) => setForm({ ...form, revenue_target: e.target.value })} /></div>
                                <div className="form-group"><label>Revenue Actual (M)</label><input type="number" step="0.01" required value={form.revenue_actual} onChange={(e) => setForm({ ...form, revenue_actual: e.target.value })} /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>SSL Target</label><input type="number" required value={form.sales_target} onChange={(e) => setForm({ ...form, sales_target: e.target.value })} /></div>
                                <div className="form-group"><label>SSL Actual</label><input type="number" required value={form.sales_actual} onChange={(e) => setForm({ ...form, sales_actual: e.target.value })} /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Bulan</label><input type="number" min="1" max="12" required value={form.period_month} onChange={(e) => setForm({ ...form, period_month: e.target.value })} /></div>
                                <div className="form-group"><label>Tahun</label><input type="number" min="2020" max="2030" required value={form.period_year} onChange={(e) => setForm({ ...form, period_year: e.target.value })} /></div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary">{editItem ? 'Simpan' : 'Tambah'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
