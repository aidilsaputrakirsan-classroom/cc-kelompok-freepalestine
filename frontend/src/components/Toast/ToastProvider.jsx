import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

function ToastItem({ toast, onClose }) {
    const Icon = ICONS[toast.type] || Info;
    useEffect(() => {
        if (toast.duration === 0) return;
        const t = setTimeout(onClose, toast.duration);
        return () => clearTimeout(t);
    }, [toast.duration, onClose]);

    return (
        <div className={`toast ${toast.type}`}>
            <Icon size={18} className="toast-icon" />
            <div className="toast-body">
                <div className="toast-title">{toast.title}</div>
                {toast.desc && <div className="toast-desc">{toast.desc}</div>}
            </div>
            <button className="toast-close" onClick={onClose} aria-label="Close">
                <X size={14} />
            </button>
        </div>
    );
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const push = useCallback((toast) => {
        const id = Date.now() + Math.random();
        const item = {
            id,
            type: toast.type || 'info',
            title: toast.title || '',
            desc: toast.desc,
            duration: toast.duration ?? 3500,
        };
        setToasts((prev) => [...prev, item]);
    }, []);

    const remove = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const api = {
        success: (title, desc, opts) => push({ type: 'success', title, desc, ...opts }),
        error:   (title, desc, opts) => push({ type: 'error',   title, desc, ...opts }),
        warning: (title, desc, opts) => push({ type: 'warning', title, desc, ...opts }),
        info:    (title, desc, opts) => push({ type: 'info',    title, desc, ...opts }),
    };

    return (
        <ToastContext.Provider value={api}>
            {children}
            <div className="toast-container" aria-live="polite">
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        // fallback no-op supaya komponen tidak crash saat di-render di luar provider
        return {
            success: () => {}, error: () => {}, warning: () => {}, info: () => {},
        };
    }
    return ctx;
}

// Helper: ambil pesan error yang aman untuk ditampilkan (axios / fetch / string).
export function extractErrorMessage(err, fallback = 'Terjadi kesalahan') {
    if (!err) return fallback;
    if (typeof err === 'string') return err;
    // Axios response
    const detail = err?.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail.length > 0) {
        // Pydantic validation errors: ambil message pertama
        const first = detail[0];
        if (typeof first === 'string') return first;
        if (first?.msg) return first.msg;
    }
    if (err.message && typeof err.message === 'string') return err.message;
    return fallback;
}
