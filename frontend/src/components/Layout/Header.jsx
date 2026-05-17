import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Menu, Bell, User, Sun, Moon, LogOut, KeyRound, X, AlertTriangle,
} from 'lucide-react';
import { notificationApi, authApi } from '../../services/api';
import { useToast, extractErrorMessage } from '../Toast/ToastProvider';

export default function Header({ toggleSidebar }) {
    const navigate = useNavigate();
    const [user] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
    const [isDark, setIsDark] = useState(() => (localStorage.getItem('theme') || 'dark') === 'dark');

    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const notifRef = useRef(null);
    const profileRef = useRef(null);

    async function loadNotifications() {
        try {
            const data = await notificationApi.list();
            setNotifications(Array.isArray(data) ? data : []);
        } catch {
            // silent
        }
    }

    useEffect(() => {
        document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadNotifications();
        const timer = setInterval(loadNotifications, 60_000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const doLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('lastActivityTime');
        navigate('/login', { replace: true });
    };

    const severityColor = (sev) =>
        ({ critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#3b82f6' }[sev] || '#3b82f6');

    return (
        <>
            <header className="header">
                <div className="header-left">
                    <button className="header-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
                        <Menu size={20} />
                    </button>
                    <div className="header-title">
                        <h1>Dashboard Executive</h1>
                        <span className="header-subtitle">Telkom Regional 4 Kalimantan</span>
                    </div>
                </div>

                <div className="header-right">
                    {/* Dark mode toggle */}
                    <button
                        className="header-icon-btn"
                        onClick={() => setIsDark((d) => !d)}
                        aria-label="Toggle dark mode"
                        title={isDark ? 'Mode Terang' : 'Mode Gelap'}
                    >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    {/* Notifications */}
                    <div className="header-notification" ref={notifRef}>
                        <button className="header-icon-btn" onClick={() => setNotifOpen((o) => !o)} aria-label="Notifications">
                            <Bell size={18} />
                            {notifications.length > 0 && <span className="header-badge">{notifications.length}</span>}
                        </button>
                        {notifOpen && (
                            <div className="dropdown-panel notification-panel">
                                <div className="dropdown-head">
                                    <strong>Notifikasi</strong>
                                    <span className="dropdown-count">{notifications.length} peringatan</span>
                                </div>
                                <div className="dropdown-body">
                                    {notifications.length === 0 ? (
                                        <div className="dropdown-empty">Tidak ada peringatan aktif.</div>
                                    ) : (
                                        notifications.map((n) => (
                                            <div key={n.id} className="notif-item">
                                                <AlertTriangle size={16} style={{ color: severityColor(n.severity) }} />
                                                <div className="notif-body">
                                                    <div className="notif-title">{n.title}</div>
                                                    <div className="notif-msg">{n.message}</div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile dropdown */}
                    <div className="header-profile" ref={profileRef}>
                        <button className="header-user" onClick={() => setProfileOpen((o) => !o)}>
                            <div className="header-avatar"><User size={16} /></div>
                            <div className="header-user-info">
                                <span className="header-username">{user.name || 'User'}</span>
                                <span className="header-role">{user.role || 'viewer'}</span>
                            </div>
                        </button>
                        {profileOpen && (
                            <div className="dropdown-panel profile-panel">
                                <div className="dropdown-head">
                                    <strong>{user.name}</strong>
                                    <span className="dropdown-count">{user.email}</span>
                                </div>
                                <button className="dropdown-item" onClick={() => { setShowPasswordModal(true); setProfileOpen(false); }}>
                                    <KeyRound size={14} /> Ubah Password
                                </button>
                                <button className="dropdown-item danger" onClick={doLogout}>
                                    <LogOut size={14} /> Log Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {showPasswordModal && (
                <PasswordModal onClose={() => setShowPasswordModal(false)} />
            )}
        </>
    );
}

function PasswordModal({ onClose }) {
    const toast = useToast();
    const [oldPw, setOldPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [error, setError] = useState('');
    const [ok, setOk] = useState('');
    const [loading, setLoading] = useState(false);

    const save = async (e) => {
        e.preventDefault();
        setError(''); setOk('');
        if (newPw.length < 8) { setError('Password baru minimal 8 karakter'); return; }
        setLoading(true);
        try {
            await authApi.changePassword({ old_password: oldPw, new_password: newPw });
            setOk('Password berhasil diubah');
            toast.success('Password diubah', 'Gunakan password baru saat login berikutnya.');
            setOldPw(''); setNewPw('');
        } catch (err) {
            const msg = extractErrorMessage(err, 'Gagal mengubah password');
            setError(msg);
            toast.error('Gagal mengubah password', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Ubah Password</h3>
                    <button className="modal-close" onClick={onClose}><X size={18} /></button>
                </div>
                <form className="modal-form" onSubmit={save}>
                    <div className="form-group full">
                        <label>Password Lama</label>
                        <input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} required />
                    </div>
                    <div className="form-group full">
                        <label>Password Baru (min 8)</label>
                        <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required minLength={8} />
                    </div>
                    {error && <div className="inline-error">{error}</div>}
                    {ok && <div className="inline-success">{ok}</div>}
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Tutup</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Menyimpan...' : 'Ubah Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
