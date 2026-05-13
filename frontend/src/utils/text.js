// Utilities for text display formatting

/** Kapitalisasi huruf pertama saja. "medium" -> "Medium" */
export function capitalize(str) {
    if (str === null || str === undefined) return '';
    const s = String(str).trim();
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/** Kapitalisasi tiap kata. "in_progress" -> "In Progress" */
export function capitalizeWords(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/[_-]+/g, ' ')
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}

/** Format angka 1.85 -> "1.85 M"; 12.53000001 -> "12.53 M" */
export function formatDecimal(v, decimals = 2) {
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v ?? '');
    return n.toFixed(decimals);
}
