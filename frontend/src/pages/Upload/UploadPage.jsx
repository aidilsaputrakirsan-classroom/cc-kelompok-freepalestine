import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import JSZip from 'jszip';
import {
    UploadCloud, FileSpreadsheet, Trash2, CheckCircle2, AlertCircle,
    ArrowRight,
} from 'lucide-react';
import { uploadApi } from '../../services/api';
import { useToast, extractErrorMessage } from '../../components/Toast/ToastProvider';
import { emitUpload, extractYearFromFileName } from '../../utils/uploadEvents';

// Skema header wajib — harus sinkron dengan backend/upload.py
const REQUIRED_HEADERS = {
    sales: ['witel', 'channel', 'product', 'revenue_target', 'revenue_actual',
        'sales_target', 'sales_actual', 'period_month', 'period_year'],
    inbox: ['title', 'witel', 'status', 'priority'],
};

const COLUMN_LABELS = {
    witel: 'Witel', channel: 'Channel', product: 'Produk',
    revenue_target: 'Target Revenue', revenue_actual: 'Realisasi Revenue',
    sales_target: 'Target SSL', sales_actual: 'Realisasi SSL',
    period_month: 'Bulan', period_year: 'Tahun',
    title: 'Judul Tiket', status: 'Status', priority: 'Prioritas',
};

const prettify = (cols) => cols.map((c) => COLUMN_LABELS[c] || c).join(', ');

const HEADER_ALIASES = {
    witel: ['witel', 'witel_billing'], channel: ['channel'],
    product: ['product', 'produk'],
    revenue_target: ['revenue_target', 'target_revenue'],
    revenue_actual: ['revenue_actual', 'actual_revenue'],
    sales_target: ['sales_target', 'ssl_target'],
    sales_actual: ['sales_actual', 'ssl_actual'],
    period_month: ['period_month'], period_year: ['period_year'],
    title: ['title', 'judul'], status: ['status'], priority: ['priority', 'prioritas'],
};

const TABS = [
    { key: 'sales', label: 'Revenue Data', target_table: 'sales' },
    { key: 'inbox', label: 'Customer Care / Gangguan', target_table: 'inbox' },
    { key: 'witel', label: 'Witel Leaderboard', target_table: 'witel' },
];

const MENU_TARGET = {
    sales: { label: 'Revenue Analytics', to: '/revenue' },
    inbox: { label: 'Customer Care & NPS', to: '/customer-care' },
    witel: { label: 'Witel Leaderboard', to: '/leaderboard' },
};

const normalizeKey = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');

function checkMissingHeaders(headerList, targetTable) {
    const required = REQUIRED_HEADERS[targetTable] || [];
    if (required.length === 0) return []; // witel has no client-side check
    const normalized = new Set(headerList.map(normalizeKey).filter(Boolean));
    const missing = [];
    for (const col of required) {
        const aliases = HEADER_ALIASES[col] || [col];
        const found = aliases.some((a) => normalized.has(normalizeKey(a)));
        if (!found) missing.push(col);
    }
    return missing;
}

function readCsvHeader(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Tidak bisa membaca file CSV'));
        reader.onload = () => {
            const text = String(reader.result || '').replace(/^\uFEFF/, '');
            const firstLine = text.split(/\r?\n/)[0] || '';
            const sep = firstLine.includes(';') && !firstLine.includes(',') ? ';' : ',';
            const cols = firstLine.split(sep).map((c) => c.replace(/^["']|["']$/g, '').trim());
            resolve(cols);
        };
        reader.readAsText(file.slice(0, 65536));
    });
}

async function readXlsxHeader(file) {
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    let sheetFile =
        zip.file('xl/worksheets/sheet1.xml') ||
        zip.file(/xl\/worksheets\/sheet\d+\.xml/)[0];
    if (!sheetFile) throw new Error('XLSX tidak memiliki worksheet');

    const sheetXml = await sheetFile.async('string');
    const parser = new DOMParser();
    const sheetDoc = parser.parseFromString(sheetXml, 'application/xml');

    let sharedStrings = [];
    const ssFile = zip.file('xl/sharedStrings.xml');
    if (ssFile) {
        const ssXml = await ssFile.async('string');
        const ssDoc = parser.parseFromString(ssXml, 'application/xml');
        sharedStrings = Array.from(ssDoc.getElementsByTagName('si')).map((si) => {
            const ts = si.getElementsByTagName('t');
            let out = '';
            for (const t of ts) out += t.textContent || '';
            return out;
        });
    }

    const rows = sheetDoc.getElementsByTagName('row');
    if (rows.length === 0) throw new Error('Worksheet kosong');
    const firstRow = rows[0];

    const cells = firstRow.getElementsByTagName('c');
    const headers = [];
    for (const c of cells) {
        const t = c.getAttribute('t');
        let value = '';
        if (t === 's') {
            const vEl = c.getElementsByTagName('v')[0];
            const idx = vEl ? parseInt(vEl.textContent, 10) : NaN;
            value = Number.isInteger(idx) ? (sharedStrings[idx] || '') : '';
        } else if (t === 'inlineStr') {
            const isEl = c.getElementsByTagName('is')[0];
            const ts = isEl ? isEl.getElementsByTagName('t') : [];
            for (const tEl of ts) value += tEl.textContent || '';
        } else {
            const vEl = c.getElementsByTagName('v')[0];
            value = vEl ? (vEl.textContent || '') : '';
        }
        headers.push(String(value).trim());
    }
    return headers;
}

async function readHeaders(file) {
    const name = file.name.toLowerCase();
    if (name.endsWith('.csv')) return await readCsvHeader(file);
    if (name.endsWith('.xlsx')) return await readXlsxHeader(file);
    return null;
}

export default function UploadPage() {
    const toast = useToast();
    const [activeTab, setActiveTab] = useState('sales');
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [datasources, setDatasources] = useState([]);
    const [loading, setLoading] = useState(true);
    const fileRef = useRef(null);

    const currentTab = useMemo(() => TABS.find((t) => t.key === activeTab), [activeTab]);
    const menu = useMemo(() => MENU_TARGET[activeTab], [activeTab]);

    useEffect(() => { loadDatasources(); }, []);

    const loadDatasources = async () => {
        setLoading(true);
        try {
            const res = await uploadApi.listDatasources();
            setDatasources(res.items || []);
        } catch (err) {
            toast.error('Gagal memuat riwayat upload', extractErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const filteredDatasources = useMemo(
        () => datasources.filter((d) => d.target_table === activeTab),
        [datasources, activeTab]
    );

    const uploadFile = async (file) => {
        if (!file) return;
        const allowed = ['.csv', '.xlsx', '.xls'];
        const lowered = file.name.toLowerCase();
        if (!allowed.some((ext) => lowered.endsWith(ext))) {
            const msg = 'Format tidak didukung. Gunakan CSV (.csv) atau Excel (.xlsx).';
            setResult({ ok: false, message: msg });
            toast.error('Upload dibatalkan', msg);
            return;
        }

        // Preflight header check (only for sales/inbox)
        if (activeTab !== 'witel') {
            try {
                const headers = await readHeaders(file);
                if (Array.isArray(headers)) {
                    if (headers.length === 0) {
                        const msg = `File ditolak: tidak ada header kolom yang terbaca. Skema ${currentTab.label} mewajibkan kolom: ${prettify(REQUIRED_HEADERS[activeTab])}.`;
                        setResult({ ok: false, message: msg });
                        toast.error('Upload ditolak', msg);
                        if (fileRef.current) fileRef.current.value = '';
                        return;
                    }
                    const missing = checkMissingHeaders(headers, activeTab);
                    if (missing.length > 0) {
                        const msg = `File ditolak: format tidak sesuai skema ${currentTab.label}. Kolom wajib yang hilang: ${prettify(missing)}.`;
                        setResult({ ok: false, message: msg });
                        toast.error('Upload ditolak', msg);
                        if (fileRef.current) fileRef.current.value = '';
                        return;
                    }
                }
            } catch (e) {
                const msg = `File ditolak: tidak bisa membaca header (${e?.message || 'format rusak'}).`;
                setResult({ ok: false, message: msg });
                toast.error('Upload ditolak', msg);
                if (fileRef.current) fileRef.current.value = '';
                return;
            }
        }

        setUploading(true); setResult(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            let res;
            if (activeTab === 'sales') res = await uploadApi.salesFile(formData);
            else if (activeTab === 'inbox') res = await uploadApi.inboxFile(formData);
            else res = await uploadApi.witelFile(formData);

            setResult({
                ok: true, message: res.message,
                rowCount: res.row_count, errors: res.errors, target: res.target,
            });
            const detectedYear = extractYearFromFileName(file.name);
            const yearInfo = detectedYear ? ` · tahun ${detectedYear} terdeteksi dari nama file` : '';
            toast.success('Upload berhasil', `${res.row_count} baris disimpan dari "${file.name}"${yearInfo}.`);
            emitUpload({ target: activeTab, year: detectedYear, fileName: file.name, rowCount: res.row_count });
            loadDatasources();
        } catch (err) {
            const msg = extractErrorMessage(err, 'Upload gagal: format tidak sesuai skema.');
            setResult({ ok: false, message: msg });
            toast.error('Upload ditolak', msg);
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const handleDrop = (e) => {
        e.preventDefault(); setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        uploadFile(file);
    };

    const handleToggle = async (d) => {
        try {
            const res = await uploadApi.toggleDatasource(d.id);
            setDatasources((prev) =>
                prev.map((item) => item.id === d.id ? { ...item, is_active: res.is_active } : item)
            );
            toast.success(res.is_active ? 'Datasource diaktifkan' : 'Datasource dinonaktifkan', d.name);
        } catch (err) {
            toast.error('Gagal toggle datasource', extractErrorMessage(err));
        }
    };

    const handleDelete = async (d) => {
        if (!confirm(`Hapus datasource "${d.name}" beserta seluruh barisnya?`)) return;
        try {
            await uploadApi.deleteDatasource(d.id);
            toast.success('Datasource dihapus', d.name);
            loadDatasources();
        } catch (err) {
            toast.error('Gagal menghapus datasource', extractErrorMessage(err));
        }
    };

    return (
        <div className="page-content">
            <div className="page-header">
                <h2><UploadCloud size={18} style={{ verticalAlign: 'middle' }} /> Upload Data Source</h2>
            </div>

            <p className="page-description">
                Unggah data massal dalam format CSV atau XLSX. Pilih kategori data, lalu{' '}
                <em>drag &amp; drop</em> atau klik area di bawah.
            </p>

            {/* Tab selector */}
            <div className="upload-tabs">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        className={`upload-tab ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => { setActiveTab(tab.key); setResult(null); }}
                        type="button"
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Drop zone */}
            <div
                className={`upload-dropzone ${dragOver ? 'dragover' : ''} ${uploading ? 'is-uploading' : ''}`}
                onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !uploading && fileRef.current?.click()}
                role="button"
                tabIndex={0}
            >
                <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    style={{ display: 'none' }}
                    onChange={(e) => uploadFile(e.target.files?.[0])}
                />
                <UploadCloud size={42} style={{ color: 'var(--accent-blue)', marginBottom: 8 }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {uploading ? 'Mengunggah & memvalidasi...' : 'Klik di sini atau seret file CSV / XLSX'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    Format: CSV, XLSX · Target: <strong>{currentTab.label}</strong>
                </div>
            </div>

            {/* Result banner */}
            {result && (
                <div className={`upload-result ${result.ok ? 'ok' : 'err'}`} style={{ marginTop: 16 }}>
                    {result.ok ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <div style={{ flex: 1 }}>
                        <strong>{result.message}</strong>
                        {result.rowCount !== undefined && (
                            <div>{result.rowCount} baris berhasil diimport.</div>
                        )}
                        {result.ok && menu && (
                            <div style={{ marginTop: 6 }}>
                                <Link className="inline-link" to={menu.to}>
                                    Lihat di {menu.label} <ArrowRight size={12} />
                                </Link>
                            </div>
                        )}
                        {result.errors && result.errors.length > 0 && (
                            <details style={{ marginTop: 6 }}>
                                <summary>{result.errors.length} baris dilewati / warning</summary>
                                <ul style={{ marginTop: 4, paddingLeft: 18 }}>
                                    {result.errors.slice(0, 10).map((err, i) => <li key={i}>{err}</li>)}
                                    {result.errors.length > 10 && <li>...dan {result.errors.length - 10} lainnya</li>}
                                </ul>
                            </details>
                        )}
                    </div>
                </div>
            )}

            {/* Datasource list */}
            <h3 className="section-subtitle" style={{ marginTop: 24 }}>
                Datasource — {currentTab.label}
            </h3>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Memuat...</div>
            ) : filteredDatasources.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    Belum ada file terunggah untuk kategori ini
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {filteredDatasources.map((d) => (
                        <div key={d.id} className="ds-item">
                            <FileSpreadsheet size={18} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {d.name}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                    {d.row_count.toLocaleString('id-ID')} baris · {new Date(d.created_at).toLocaleString('id-ID')}
                                </div>
                            </div>
                            <div
                                className={`toggle-switch ${d.is_active !== false ? 'active' : ''}`}
                                onClick={(e) => { e.stopPropagation(); handleToggle(d); }}
                                title={d.is_active !== false ? 'Aktif — klik untuk nonaktifkan' : 'Nonaktif — klik untuk aktifkan'}
                            />
                            <button
                                className="btn-icon delete"
                                onClick={() => handleDelete(d)}
                                title="Hapus"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
