"""
Upload module — Parser CSV/XLSX untuk import data ke SalesData atau InboxItem.
"""
import io
import csv
from typing import List, Tuple
from openpyxl import load_workbook


def parse_file(file_bytes: bytes, filename: str) -> List[dict]:
    """Parse CSV or XLSX file and return list of row dicts."""
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext == "csv":
        return _parse_csv(file_bytes)
    elif ext in ("xlsx", "xls"):
        return _parse_xlsx(file_bytes)
    else:
        raise ValueError(f"Format file tidak didukung: .{ext}. Gunakan .csv atau .xlsx")


def _parse_csv(file_bytes: bytes) -> List[dict]:
    text = file_bytes.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))
    return [dict(row) for row in reader]


def _parse_xlsx(file_bytes: bytes) -> List[dict]:
    wb = load_workbook(filename=io.BytesIO(file_bytes), read_only=True, data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    if len(rows) < 2:
        return []
    headers = [str(h).strip() if h else f"col_{i}" for i, h in enumerate(rows[0])]
    result = []
    for row in rows[1:]:
        if all(v is None for v in row):
            continue
        result.append({headers[i]: row[i] for i in range(len(headers)) if i < len(row)})
    return result


def _safe_float(val, default=0.0):
    if val is None:
        return default
    try:
        s = str(val).replace(",", "").replace("(", "-").replace(")", "").strip()
        return float(s)
    except (ValueError, TypeError):
        return default


def _safe_int(val, default=0):
    return int(_safe_float(val, default))


def _safe_str(val, default=""):
    if val is None:
        return default
    return str(val).strip()


def _parse_periode_monthly(val) -> Tuple[int, int]:
    """Parse PERIODE_MONTHLY like 202503 -> (2025, 3)."""
    s = str(int(_safe_float(val))).strip()
    if len(s) == 6:
        return int(s[:4]), int(s[4:])
    return 2025, 1


def _detect_witel_from_billing(val: str) -> str:
    """Detect witel name from Witel_Billing column like 'Telkom BALIKPAPAN'."""
    s = _safe_str(val).upper()
    for w in ["BALIKPAPAN", "KALBAR", "KALSELTENG", "KALTIMTARA"]:
        if w in s:
            return w
    return _safe_str(val)


def map_sales_rows(rows: List[dict]) -> Tuple[List[dict], List[str]]:
    """
    Map parsed rows to SalesData format.
    Expected columns (from user's CSV format):
    YEAR, PERIODE_MONTHLY, REVENUE, FLAG, FLAG_2, FLAG_3,
    NAMA_PELANGGAN, LAYANAN, NAMA_AM, Witel_Billing
    """
    mapped = []
    errors = []

    # Detect column names (case-insensitive)
    if not rows:
        return [], ["File kosong"]

    sample_keys = {k.upper().strip(): k for k in rows[0].keys()}

    def find_col(names):
        for n in names:
            if n.upper() in sample_keys:
                return sample_keys[n.upper()]
        return None

    col_year = find_col(["YEAR", "TAHUN"])
    col_periode = find_col(["PERIODE_MONTHLY", "PERIODE MONTHLY", "PERIODE"])
    col_revenue = find_col(["REVENUE", "REVENUE_ACTUAL", "REVENUE ACTUAL"])
    col_flag = find_col(["FLAG"])
    col_flag2 = find_col(["FLAG_2", "FLAG 2"])
    col_flag3 = find_col(["FLAG_3", "FLAG 3"])
    col_pelanggan = find_col(["NAMA_PELANGGAN", "NAMA PELANGGAN", "PELANGGAN"])
    col_layanan = find_col(["LAYANAN", "LAYANAN_PRODUK"])
    col_am = find_col(["NAMA_AM", "NAMA AM", "AM"])
    col_witel = find_col(["WITEL_BILLING", "WITEL BILLING", "WITEL", "Witel Bill"])
    col_channel = find_col(["CHANNEL"])
    col_product = find_col(["PRODUCT", "PRODUK"])
    col_target = find_col(["REVENUE_TARGET", "TARGET"])
    col_ssl_target = find_col(["SSL_TARGET", "SALES_TARGET"])
    col_ssl_actual = find_col(["SSL_ACTUAL", "SALES_ACTUAL"])
    col_telda = find_col(["TELDA", "TELKOM_DAERAH"])

    for i, row in enumerate(rows):
        try:
            if col_periode:
                year, month = _parse_periode_monthly(row.get(col_periode))
            else:
                year = _safe_int(row.get(col_year), 2025)
                month = 1

            if col_year and row.get(col_year):
                year = _safe_int(row.get(col_year), year)

            witel = _detect_witel_from_billing(row.get(col_witel, "")) if col_witel else "BALIKPAPAN"

            mapped.append({
                "witel": witel,
                "telda": _safe_str(row.get(col_telda)) if col_telda else None,
                "channel": _safe_str(row.get(col_channel, "Direct")),
                "product": _safe_str(row.get(col_product, "HSI")),
                "revenue_target": _safe_float(row.get(col_target)) if col_target else 0,
                "revenue_actual": _safe_float(row.get(col_revenue)) if col_revenue else 0,
                "sales_target": _safe_int(row.get(col_ssl_target)) if col_ssl_target else 0,
                "sales_actual": _safe_int(row.get(col_ssl_actual)) if col_ssl_actual else 0,
                "period_month": month,
                "period_year": year,
                "flag": _safe_str(row.get(col_flag)) if col_flag else None,
                "flag_2": _safe_str(row.get(col_flag2)) if col_flag2 else None,
                "flag_3": _safe_str(row.get(col_flag3)) if col_flag3 else None,
                "nama_pelanggan": _safe_str(row.get(col_pelanggan)) if col_pelanggan else None,
                "layanan": _safe_str(row.get(col_layanan)) if col_layanan else None,
                "nama_am": _safe_str(row.get(col_am)) if col_am else None,
            })
        except Exception as e:
            errors.append(f"Baris {i+2}: {str(e)}")

    return mapped, errors


def map_inbox_rows(rows: List[dict]) -> Tuple[List[dict], List[str]]:
    """Map parsed rows to InboxItem format."""
    mapped = []
    errors = []

    if not rows:
        return [], ["File kosong"]

    sample_keys = {k.upper().strip(): k for k in rows[0].keys()}

    def find_col(names):
        for n in names:
            if n.upper() in sample_keys:
                return sample_keys[n.upper()]
        return None

    col_title = find_col(["TITLE", "JUDUL", "NAMA"])
    col_desc = find_col(["DESCRIPTION", "DESKRIPSI", "KETERANGAN"])
    col_status = find_col(["STATUS"])
    col_priority = find_col(["PRIORITY", "PRIORITAS"])
    col_witel = find_col(["WITEL"])
    col_category = find_col(["CATEGORY", "KATEGORI"])
    col_assigned = find_col(["ASSIGNED_TO", "ASSIGNED", "TEKNISI"])

    if not col_title:
        return [], ["Kolom 'TITLE' atau 'JUDUL' tidak ditemukan di file"]

    for i, row in enumerate(rows):
        try:
            mapped.append({
                "title": _safe_str(row.get(col_title, f"Tiket #{i+1}")),
                "description": _safe_str(row.get(col_desc)) if col_desc else None,
                "status": _safe_str(row.get(col_status, "pending")),
                "priority": _safe_str(row.get(col_priority, "medium")),
                "witel": _safe_str(row.get(col_witel, "BALIKPAPAN")),
                "category": _safe_str(row.get(col_category)) if col_category else None,
                "assigned_to": _safe_str(row.get(col_assigned)) if col_assigned else None,
            })
        except Exception as e:
            errors.append(f"Baris {i+2}: {str(e)}")

    return mapped, errors
