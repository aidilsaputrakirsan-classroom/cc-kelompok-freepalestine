// Event bus ringan untuk sinkronisasi antar-halaman setelah
// user sukses meng-upload file di halaman "Upload Data Source".
// Pattern: CustomEvent pada window + mirror di localStorage
// (supaya juga ke-propagate ke tab lain via "storage" event).
//
// Payload event:
//   { target: 'sales' | 'inbox', year: number|null, fileName: string,
//     rowCount: number, ts: number }

import { useEffect, useRef } from 'react';

export const UPLOAD_EVENT = 'telkom:data-uploaded';
const STORAGE_KEY = 'telkom:last_upload';

// Ambil tahun (4 digit, 2000-2099) yang muncul paling akhir pada
// nama file. Contoh:
//   sample_revenue_2026.csv     -> 2026
//   laporan-inbox-2024-v2.xlsx  -> 2024
//   sales.csv                   -> null
export function extractYearFromFileName(name) {
    if (!name) return null;
    const base = String(name).replace(/\.[^.]+$/, '');
    const matches = base.match(/(20\d{2})/g);
    if (!matches || !matches.length) return null;
    const year = Number(matches[matches.length - 1]);
    return Number.isInteger(year) ? year : null;
}

export function emitUpload(detail) {
    const payload = {
        target: detail?.target || null,
        year: detail?.year ?? null,
        fileName: detail?.fileName || '',
        rowCount: detail?.rowCount ?? 0,
        ts: Date.now(),
    };
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
        // abaikan kalau localStorage diblokir
    }
    try {
        window.dispatchEvent(new CustomEvent(UPLOAD_EVENT, { detail: payload }));
    } catch {
        // CustomEvent selalu tersedia di browser modern; fallback no-op
    }
}

export function getLastUpload() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

// React hook: panggil `handler(detail)` setiap kali ada upload sukses.
// Handler disimpan via ref supaya listener tidak perlu di-pasang ulang
// di setiap render.
export function useDataUploadEvent(handler) {
    const ref = useRef(handler);
    useEffect(() => { ref.current = handler; }, [handler]);

    useEffect(() => {
        const onUpload = (e) => {
            try { ref.current?.(e.detail || {}); } catch (err) { console.error(err); }
        };
        const onStorage = (e) => {
            if (e.key !== STORAGE_KEY || !e.newValue) return;
            try { ref.current?.(JSON.parse(e.newValue)); } catch (err) { console.error(err); }
        };
        window.addEventListener(UPLOAD_EVENT, onUpload);
        window.addEventListener('storage', onStorage);
        return () => {
            window.removeEventListener(UPLOAD_EVENT, onUpload);
            window.removeEventListener('storage', onStorage);
        };
    }, []);
}
