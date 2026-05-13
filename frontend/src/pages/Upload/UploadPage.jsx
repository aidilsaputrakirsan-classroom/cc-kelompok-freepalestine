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
// (SALES_COLUMNS / INBOX_COLUMNS). Dipakai untuk preflight check di
// sisi klien supaya file yang tidak sesuai langsung ditolak tanpa
// perlu ke server.
const REQUIRED_HEADERS = {
    sales: ['witel', 'channel', 'product', 'revenue_target', 'revenue_actual',
        'sales_target', 'sales_actual', 'period_month', 'period_year'],
    inbox: ['title', 'witel', 'status', 'priority'],
};

// Label ramah pengguna untuk pesan error — user melihat "Target Revenue"
// bukan "revenue_target".
const COLUMN_LABELS = {
    witel: 'Witel',
    channel: 'Channel',
    product: 'Produk',
    revenue_target: 'Target Revenue',
    revenue_actual: 'Realisasi Revenue',
    sales_target: 'Target SSL',
    sales_actual: 'Realisasi SSL',
    period_month: 'Bulan',
    period_year: 'Tahun',
    title: 'Judul Tiket',
    status: 'Status',
    priority: 'Prioritas',
};

const prettify = (cols) => cols.map((c) => COLUMN_LABELS[c] || c).join(', ');

// Alias dipersempit — hanya nama spesifik domain Telkom, tidak ada
// alias generik seperti "revenue" / "target" / "month" / "year"
// yang bisa tidak sengaja cocok dengan spreadsheet bisnis umum.
const HEADER_ALIASES = {
    witel: ['witel', 'witel_billing'],
    channel: ['channel'],
    product: ['product', 'produk'],
    revenue_target: ['revenue_target', 'target_revenue'],
    revenue_actual: ['revenue_actual', 'actual_revenue'],
    sales_target: ['sales_target', 'ssl_target'],
    sales_actual: ['sales_actual', 'ssl_actual'],
    period_month: ['period_month'],
    period_year: ['period_year'],
    title: ['title', 'judul'],
    status: ['status'],
    priority: ['priority', 'prioritas'],
};

const MENU_TARGET = {
    sales: { label: 'Revenue Analytics', to: '/revenue' },
    inbox: { label: 'Customer Care & NPS', to: '/customer-care' },
};

const normalizeKey = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');

// Cek preflight header: kembalikan array nama kolom yang masih kurang.
function checkMissingHeaders(headerList, targetTable) {
    const required = REQUIRED_HEADERS[targetTable] || [];
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

// Baca header XLSX dengan benar: buka arsip ZIP → ambil sheet1.xml +
// sharedStrings.xml → parse DOM untuk row pertama.
async function readXlsxHeader(file) {
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    // Cari file worksheet pertama. Beberapa xlsx punya nama berbeda.
    let sheetFile =
        zip.file('xl/worksheets/sheet1.xml') ||
        zip.file(/xl\/worksheets\/sheet\d+\.xml/)[0];
    if (!sheetFile) throw new Error('XLSX tidak memiliki worksheet');

    const sheetXml = await sheetFile.async('string');
    const parser = new DOMParser();
    const sheetDoc = parser.parseFromString(sheetXml, 'application/xml');

    // Ambil sharedStrings sekali saja (jika ada).
    let sharedStrings = [];
    const ssFile = zip.file('xl/sharedStrings.xml');
    if (ssFile) {
        const ssXml = await ssFile.async('string');
        const ssDoc = parser.parseFromString(ssXml, 'application/xml');
        sharedStrings = Array.from(ssDoc.getElementsByTagName('si')).map((si) => {
            // Bisa berupa <t> langsung atau kumpulan <r><t>...
            const ts = si.getElementsByTagName('t');
            let out = '';
            for (const t of ts) out += t.textContent || '';
            return out;
        });
    }

    // Cari row pertama yang ada isinya.
    const rows = sheetDoc.getElementsByTagName('row');
    if (rows.length === 0) throw new Error('Worksheet kosong');
    const firstRow = rows[0];

    const cells = firstRow.getElementsByTagName('c');
    const headers = [];
    for (const c of cells) {
        const t = c.getAttribute('t'); // tipe: s, str, inlineStr, b, e, atau null (numeric)
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
    return null; // .xls biner (BIFF lama) — server yang memvalidasi
}

export default function UploadPage() {
    const toast = useToast();
    const [targetTable, setTargetTable] = useState('sales');
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [datasources, setDatasources] = useState([]);
    const [loading, setLoading] = useState(true);
    const fileRef = useRef(null);

    const menu = useMemo(() => MENU_TARGET[targetTable], [targetTable]);

    useEffect(() => { loadDatasources(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

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

        // Preflight — cek header di sisi klien supaya file yang jelas
        // tidak cocok (mis. Studi Kelayakan / laporan keuangan umum)
        // langsung ditolak tanpa perlu ke server.
        const menuLabel = targetTable === 'sales' ? 'Revenue Analytics' : 'Customer Care & NPS';
        try {
            const headers = await readHeaders(file);
            if (Array.isArray(headers)) {
                if (headers.length === 0) {
                    const msg = `File ditolak: tidak ada header kolom yang terbaca. Skema ${menuLabel} mewajibkan kolom: ${prettify(REQUIRED_HEADERS[targetTable])}.`;
                    setResult({ ok: false, message: msg });
                    toast.error('Upload ditolak', msg);
                    if (fileRef.current) fileRef.current.value = '';
                    return;
                }
                const missing = checkMissingHeaders(headers, targetTable);
                if (missing.length > 0) {
                    const msg = `File ditolak: format tidak sesuai skema ${menuLabel}. Kolom wajib yang hilang: ${prettify(missing)}.`;
                    setResult({ ok: false, message: msg });
                    toast.error('Upload ditolak', msg);
                    if (fileRef.current) fileRef.current.value = '';
                    return;
                }
            }
            // headers === null → .xls lama, biar server yang memvalidasi
        } catch (e) {
            const msg = `File ditolak: tidak bisa membaca header (${e?.message || 'format rusak'}). Pastikan file berupa spreadsheet standar dengan header di baris pertama.`;
            setResult({ ok: false, message: msg });
            toast.error('Upload ditolak', msg);
            if (fileRef.current) fileRef.current.value = '';
            return;
        }

        setUploading(true); setResult(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = targetTable === 'sales'
                ? await uploadApi.salesFile(formData)
                : await uploadApi.inboxFile(formData);
            setResult({
                ok: true,
                message: res.message,
                rowCount: res.row_count,
                errors: res.errors,
                target: res.target,
            });
            const detectedYear = extractYearFromFileName(file.name);
            const yearInfo = detectedYear ? ` · tahun ${detectedYear} terdeteksi dari nama file` : '';
            toast.success('Upload berhasil',
                `${res.row_count} baris disimpan dari "${file.name}"${yearInfo}.`);
            // Broadcast ke halaman lain (Home Dashboard, Revenue, Inbox,
            // Customer Care, Leaderboard) supaya ikut auto-refresh.
            emitUpload({
                target: targetTable,
                year: detectedYear,
                fileName: file.name,
                rowCount: res.row_count,
            });
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
                Unggah data massal dalam format CSV atau XLSX. Pilih jenis data terlebih dahulu,
                lalu <em>drag &amp; drop</em> atau klik area di bawah. File yang formatnya tidak cocok
                dengan skema akan ditolak secara otomatis.
            </p>

            {/* Type selector */}
            <div className="upload-type-selector">
                <button
                    className={`upload-type-btn ${targetTable === 'sales' ? 'active' : ''}`}
                    onClick={() => { setTargetTable('sales'); setResult(null); }}
                    type="button"
                >
                    <FileSpreadsheet size={16} /> Data Revenue / Sales
                </button>
                <button
                    className={`upload-type-btn ${targetTable === 'inbox' ? 'active' : ''}`}
                    onClick={() => { setTargetTable('inbox'); setResult(null); }}
                    type="button"
                >
                    <FileSpreadsheet size={16} /> Data Gangguan / Inbox
                </button>
            </div>

            {/* Drop zone */}
            <div
                className={`dropzone ${dragOver ? 'drag-over' : ''} ${uploading ? 'is-uploading' : ''}`}
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
                <UploadCloud size={42} />
                <div className="dropzone-text">
                    {uploading ? 'Mengunggah & memvalidasi...' : 'Klik di sini atau seret file CSV / XLSX ke area ini'}
                </div>
                <div className="dropzone-subtext">
                    Target tabel: <strong>{targetTable === 'sales' ? 'SALES_DATA' : 'INBOX_ITEMS'}</strong>
                </div>
            </div>

            {/* Result banner */}
            {result && (
                <div className={`upload-result ${result.ok ? 'ok' : 'err'}`}>
                    {result.ok ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <div style={{ flex: 1 }}>
                        <strong>{result.message}</strong>
                        {result.rowCount !== undefined && (
                            <div>{result.rowCount} baris berhasil diimport.</div>
                        )}
                        {result.ok && (
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

            {/* History */}
            <h3 className="section-subtitle">Riwayat Upload</h3>
            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th><th>Nama File</th><th>Tipe</th><th>Baris</th>
                            <th>Target Tabel</th><th>Tanggal Upload</th><th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" className="table-loading">Memuat...</td></tr>
                        ) : datasources.length === 0 ? (
                            <tr><td colSpan="7" className="table-empty">Belum ada file terunggah</td></tr>
                        ) : datasources.map((d) => (
                            <tr key={d.id}>
                                <td className="number">#{d.id}</td>
                                <td>{d.name}</td>
                                <td><span className="product-badge">{d.file_type.toUpperCase()}</span></td>
                                <td className="number">{d.row_count.toLocaleString('id-ID')}</td>
                                <td><span className="witel-badge">{d.target_table}</span></td>
                                <td className="date-cell">{new Date(d.created_at).toLocaleString('id-ID')}</td>
                                <td>
                                    <div className="table-actions">
                                        <button className="btn-icon delete" onClick={() => handleDelete(d)} title="Hapus">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
