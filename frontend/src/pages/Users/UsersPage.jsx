import { useEffect, useState } from 'react';
import { ShieldCheck, Plus, Trash2, Pencil, X, Activity, Users as UsersIcon } from 'lucide-react';
import { userApi, auditApi } from '../../services/api';
import { useToast, extractErrorMessage } from '../../components/Toast/ToastProvider';

export default function UsersPage() {
    const [tab, setTab] = useState('users');
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    if (currentUser.role !== 'admin') {
        return (
            <div className="page-content">
                <div className="empty-state">
                    <ShieldCheck size={32} />
                    <h3>Akses ditolak</h3>
                    <p>Halaman ini hanya untuk role Admin.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-content">
            <div className="page-header">
                <h2><ShieldCheck size={18} style={{ verticalAlign: 'middle' }} /> User Management &amp; Audit Log</h2>
            </div>

            <div className="tab-bar">
                <button className={`tab-btn ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
                    <UsersIcon size={15} /> Daftar Staf
                </button>
                <button className={`tab-btn ${tab === 'audit' ? 'active' : ''}`} onClick={() => setTab('audit')}>
                    <Activity size={15} /> Audit Log
                </button>
            </div>

            {tab === 'users' ? <UsersTab /> : <AuditTab />}
        </div>
    );
}

function UsersTab() {
    const toast = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState({ email: '', name: '', password: '', role: 'viewer', is_active: true });

    useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

    const load = async () => {
        setLoading(true);
        try {
            const data = await userApi.list();
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error('Gagal memuat daftar user', extractErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditItem(null);
        setForm({ email: '', name: '', password: '', role: 'viewer', is_active: true });
        setShowModal(true);
    };

    const openEdit = (u) => {
        setEditItem(u);
        setForm({ email: u.email, name: u.name, password: '', role: u.role, is_active: u.is_active });
        setShowModal(true);
    };

    const save = async (e) => {
        e.preventDefault();
        if (!editItem && (form.password || '').length < 8) {
            toast.warning('Password terlalu pendek', 'Minimal 8 karakter.');
            return;
        }
        setSaving(true);
        try {
            if (editItem) {
                await userApi.update(editItem.id, {
                    name: form.name, role: form.role, is_active: form.is_active,
                });
                toast.success('Staf diperbarui', form.email);
            } else {
                await userApi.create({
                    email: form.email, name: form.name,
                    password: form.password, role: form.role,
                });
                toast.success('Staf baru ditambahkan', `${form.email} (${form.role})`);
            }
            setShowModal(false);
            load();
        } catch (err) {
            toast.error('Gagal menyimpan staf', extractErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (u) => {
        if (!confirm(`Hapus user "${u.email}"?`)) return;
        try {
            await userApi.delete(u.id);
            toast.success('User dihapus', u.email);
            load();
        } catch (err) {
            toast.error('Gagal menghapus user', extractErrorMessage(err));
        }
    };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> Tambah Staf</button>
            </div>

            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr><th>ID</th><th>Email</th><th>Nama</th><th>Role</th><th>Status</th><th>Dibuat</th><th>Aksi</th></tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" className="table-loading">Memuat...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan="7" className="table-empty">Tidak ada user</td></tr>
                        ) : users.map((u) => (
                            <tr key={u.id}>
                                <td className="number">#{u.id}</td>
                                <td>{u.email}</td>
                                <td>{u.name}</td>
                                <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                                <td>
                                    <span className={`status-badge ${u.is_active ? 'active' : 'inactive'}`}>
                                        {u.is_active ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </td>
                                <td className="date-cell">{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
                                <td>
                                    <div className="table-actions">
                                        <button className="btn-icon edit" onClick={() => openEdit(u)} title="Edit"><Pencil size={14} /></button>
                                        <button className="btn-icon delete" onClick={() => handleDelete(u)} title="Hapus"><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editItem ? 'Edit Staf' : 'Tambah Staf'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={save} className="modal-form">
                            <div className="form-group full">
                                <label>Email</label>
                                <input type="email" required disabled={!!editItem}
                                    placeholder="Contoh: staf@telkom.co.id"
                                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div className="form-group full">
                                <label>Nama Lengkap</label>
                                <input required
                                    placeholder="Contoh: Budi Santoso"
                                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </div>
                            {!editItem && (
                                <div className="form-group full">
                                    <label>Password (minimal 8 karakter)</label>
                                    <input type="password" required minLength={8}
                                        placeholder="Minimal 8 karakter, contoh: Telkom2026"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })} />
                                </div>
                            )}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Role</label>
                                    <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                                        <option value="viewer">Viewer</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                {editItem && (
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select value={String(form.is_active)}
                                            onChange={(e) => setForm({ ...form, is_active: e.target.value === 'true' })}>
                                            <option value="true">Aktif</option>
                                            <option value="false">Nonaktif</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Menyimpan...' : (editItem ? 'Simpan' : 'Tambah Staf')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

const actionLabels = {
    login: { label: 'Login', color: '#10b981' },
    change_password: { label: 'Ubah Password', color: '#8b5cf6' },
    upload_sales: { label: 'Upload Revenue', color: '#06b6d4' },
    upload_inbox: { label: 'Upload Inbox', color: '#06b6d4' },
    create_user: { label: 'Tambah User', color: '#10b981' },
    update_user: { label: 'Update User', color: '#3b82f6' },
    delete_user: { label: 'Hapus User', color: '#ef4444' },
};

function AuditTab() {
    const [data, setData] = useState({ total: 0, items: [] });
    const [loading, setLoading] = useState(true);
    const [filterAction, setFilterAction] = useState('');
    const [page, setPage] = useState(0);
    const limit = 20;

    useEffect(() => { load(); }, [filterAction, page]);

    const load = async () => {
        setLoading(true);
        try {
            const params = { skip: page * limit, limit };
            if (filterAction) params.action = filterAction;
            const res = await auditApi.list(params);
            setData(res);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(data.total / limit) || 1;

    return (
        <>
            <div className="table-filters">
                <div className="filter-group">
                    <label>Filter Aksi</label>
                    <select value={filterAction} onChange={(e) => { setFilterAction(e.target.value); setPage(0); }}>
                        <option value="">Semua Aksi</option>
                        {Object.entries(actionLabels).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Waktu</th><th>User</th><th>Aksi</th><th>Entity</th><th>Detail</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="table-loading">Memuat...</td></tr>
                        ) : data.items.length === 0 ? (
                            <tr><td colSpan="5" className="table-empty">Tidak ada log</td></tr>
                        ) : data.items.map((l) => {
                            const info = actionLabels[l.action] || { label: l.action, color: '#64748b' };
                            return (
                                <tr key={l.id}>
                                    <td className="date-cell">{new Date(l.created_at).toLocaleString('id-ID')}</td>
                                    <td>{l.user_email || <span className="unassigned">-</span>}</td>
                                    <td>
                                        <span className="status-badge" style={{
                                            background: `${info.color}22`, color: info.color,
                                        }}>{info.label}</span>
                                    </td>
                                    <td>
                                        {l.entity_type ? (
                                            <span className="product-badge">{l.entity_type}{l.entity_id ? `#${l.entity_id}` : ''}</span>
                                        ) : <span className="unassigned">-</span>}
                                    </td>
                                    <td>{l.detail || <span className="unassigned">-</span>}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <span className="pagination-info">
                    Menampilkan {data.items.length ? page * limit + 1 : 0}-{Math.min((page + 1) * limit, data.total)} dari {data.total}
                </span>
                <div className="pagination-btns">
                    <button disabled={page === 0} onClick={() => setPage(page - 1)}>&lt;</button>
                    <span>Hal {page + 1} / {totalPages}</span>
                    <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>&gt;</button>
                </div>
            </div>
        </>
    );
}
