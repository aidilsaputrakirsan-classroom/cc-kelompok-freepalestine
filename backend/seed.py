"""
Seed script — Mengisi database dengan data awal Telkom Regional 4 Kalimantan.
Jalankan sekali: python seed.py
"""
import os
from dotenv import load_dotenv
load_dotenv()

from database import engine, SessionLocal, Base
from models import User, SalesData, InboxItem, Telda
from auth import hash_password

TELDA_DATA = [
    ("Inner Witel Balikpapan", "BALIKPAPAN", "Inner"),
    ("Paser", "BALIKPAPAN", "Type-2"),
    ("Penajam", "BALIKPAPAN", "Type-2"),
    ("Pontianak", "KALBAR", "Inner"),
    ("Ketapang", "KALBAR", "Type-2"),
    ("Mempawah", "KALBAR", "Type-2"),
    ("Sanggau", "KALBAR", "Type-2"),
    ("Singkawang", "KALBAR", "Type-1"),
    ("Sintang", "KALBAR", "Type-2"),
    ("Buntok", "KALSELTENG", "Type-2"),
    ("Muara Teweh", "KALSELTENG", "Type-2"),
    ("Palangkaraya", "KALSELTENG", "Type-1"),
    ("Pangkalan Bun", "KALSELTENG", "Type-1"),
    ("Sampit", "KALSELTENG", "Type-1"),
    ("Inner Witel Kalsel", "KALSELTENG", "Inner"),
    ("Banjarbaru", "KALSELTENG", "Type-1"),
    ("Batulicin", "KALSELTENG", "Type-1"),
    ("Kandangan", "KALSELTENG", "Type-1"),
    ("Kotabaru", "KALSELTENG", "Type-1"),
    ("Pelaihari", "KALSELTENG", "Type-1"),
    ("Tanjung Tabalong", "KALSELTENG", "Type-1"),
    ("Inner Witel Samarinda", "KALTIMTARA", "Inner"),
    ("Bontang", "KALTIMTARA", "Type-1"),
    ("Tenggarong", "KALTIMTARA", "Type-1"),
    ("Melak", "KALTIMTARA", "Type-2"),
    ("Malinau", "KALTIMTARA", "Type-2"),
    ("Nunukan", "KALTIMTARA", "Type-2"),
    ("Tanjung Redeb", "KALTIMTARA", "Type-1"),
    ("Tanjung Selor", "KALTIMTARA", "Type-1"),
    ("Tarakan", "KALTIMTARA", "Type-1"),
]

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # ==================== SEED USERS ====================
        if db.query(User).count() == 0:
            users = [
                User(email="admin@telkom.co.id", name="Admin Dashboard", hashed_password=hash_password("admin123"), role="admin"),
                User(email="ariel@student.itk.ac.id", name="Ariel Itsbat Nurhaq", hashed_password=hash_password("password123"), role="admin"),
                User(email="viewer@telkom.co.id", name="Viewer Telkom", hashed_password=hash_password("viewer123"), role="viewer"),
            ]
            db.add_all(users); db.commit()
            print(f"✅ Seeded {len(users)} users")

        # ==================== SEED TELDA ====================
        if db.query(Telda).count() == 0:
            for name, witel, branch in TELDA_DATA:
                db.add(Telda(name=name, witel=witel, branch_type=branch))
            db.commit()
            print(f"✅ Seeded {len(TELDA_DATA)} telda entries")

        # ==================== SEED SALES DATA ====================
        if db.query(SalesData).count() == 0:
            # Mapping witel -> list telda names
            witel_teldas = {}
            for name, witel, _ in TELDA_DATA:
                witel_teldas.setdefault(witel, []).append(name)

            channels = ["Direct", "Mitra", "Online"]
            products = ["HSI", "B2B", "WMS"]

            # Base revenue per witel (2025 sebagai basis utama).
            # Tahun 2024 dibuat lebih rendah ~12% sebagai baseline pertumbuhan YoY.
            revenue_data = {
                "BALIKPAPAN": {"target_base": 4.5, "actual_mult": 1.05, "ssl_base": 225},
                "KALBAR":     {"target_base": 6.5, "actual_mult": 0.97, "ssl_base": 350},
                "KALSELTENG": {"target_base": 8.0, "actual_mult": 1.03, "ssl_base": 430},
                "KALTIMTARA": {"target_base": 8.3, "actual_mult": 1.11, "ssl_base": 475},
            }

            # Konfigurasi multiplier per tahun (berpengaruh ke target & actual).
            # 2024 lebih kecil (baseline), 2025 full (target yang sekarang berjalan).
            year_configs = {
                2024: {"scale": 0.88, "actual_noise": 0.94},
                2025: {"scale": 1.00, "actual_noise": 1.00},
            }

            sales_records = []
            for year, ycfg in year_configs.items():
                for witel, info in revenue_data.items():
                    teldas = witel_teldas.get(witel, [witel])
                    for month in range(1, 13):
                        for product in products:
                            prod_factor = 1.0 if product == "HSI" else (0.6 if product == "B2B" else 0.3)
                            month_factor = 1 + (month - 1) * 0.02

                            target_base = info["target_base"] * ycfg["scale"]
                            target = round(target_base * prod_factor * month_factor, 2)
                            actual = round(
                                target * info["actual_mult"] * ycfg["actual_noise"] *
                                (0.95 + (month % 3) * 0.03),
                                2,
                            )

                            for channel in channels:
                                ch_factor = 0.5 if channel == "Direct" else (0.3 if channel == "Mitra" else 0.2)
                                telda_name = teldas[(month + products.index(product)) % len(teldas)]
                                ssl_base = info["ssl_base"] * ycfg["scale"]
                                sales_records.append(SalesData(
                                    witel=witel, telda=telda_name, channel=channel, product=product,
                                    revenue_target=round(target * ch_factor, 2),
                                    revenue_actual=round(actual * ch_factor, 2),
                                    sales_target=int(ssl_base * prod_factor * ch_factor),
                                    sales_actual=int(ssl_base * prod_factor * ch_factor * info["actual_mult"] * ycfg["actual_noise"]),
                                    period_month=month, period_year=year, created_by=1,
                                ))

            db.add_all(sales_records); db.commit()
            print(f"✅ Seeded {len(sales_records)} sales records (tahun 2024 & 2025)")

        # ==================== SEED INBOX ====================
        if db.query(InboxItem).count() == 0:
            inbox_items = [
                InboxItem(title="Gangguan jaringan fiber Balikpapan Selatan", description="Pelanggan melaporkan gangguan berulang sejak 3 hari. Area terdampak: Balikpapan Selatan, estimasi 200 pelanggan.", status="in_progress", priority="critical", witel="BALIKPAPAN", category="gangguan", assigned_to="Teknisi Tim A", created_by=1),
                InboxItem(title="Permintaan upgrade paket Pontianak", description="10 pelanggan enterprise request upgrade bandwidth dari 100 Mbps ke 300 Mbps.", status="pending", priority="high", witel="KALBAR", category="permintaan", assigned_to="AM Kalbar", created_by=1),
                InboxItem(title="Billing dispute pelanggan Kalselteng", description="Pelanggan melaporkan tagihan ganda bulan Maret. Perlu investigasi billing system.", status="pending", priority="medium", witel="KALSELTENG", category="billing", assigned_to=None, created_by=1),
                InboxItem(title="Instalasi baru area Tarakan", description="20 order baru PSB area Tarakan menunggu jadwal instalasi.", status="in_progress", priority="medium", witel="KALTIMTARA", category="permintaan", assigned_to="Tim Instalasi", created_by=1),
                InboxItem(title="Maintenance rutin ODP Balikpapan", description="Scheduled maintenance untuk 50 ODP di area Balikpapan Kota.", status="completed", priority="low", witel="BALIKPAPAN", category="gangguan", assigned_to="Teknisi Tim B", created_by=1),
                InboxItem(title="Keluhan internet lambat Kalselteng", description="Area Banjarmasin Utara melaporkan kecepatan internet di bawah SLA.", status="pending", priority="high", witel="KALSELTENG", category="gangguan", assigned_to=None, created_by=1),
                InboxItem(title="Request site survey B2B Samarinda", description="Calon pelanggan B2B membutuhkan site survey untuk gedung baru.", status="pending", priority="medium", witel="KALTIMTARA", category="permintaan", assigned_to="AM B2B Kaltimtara", created_by=1),
                InboxItem(title="Gangguan massal Singkawang setelah hujan", description="Putus kabel FO akibat pohon tumbang. Estimasi 500 pelanggan terdampak.", status="in_progress", priority="critical", witel="KALBAR", category="gangguan", assigned_to="Tim Emergency Kalbar", created_by=1),
                InboxItem(title="Laporan NPS rendah area Kaltimtara", description="Survey NPS Q1 menunjukkan skor 45 di area Kaltimtara, perlu action plan.", status="pending", priority="high", witel="KALTIMTARA", category="billing", assigned_to="Manager CC", created_by=1),
                InboxItem(title="Migrasi pelanggan copper to fiber Kalbar", description="Batch migrasi 100 pelanggan dari copper ke fiber optic area Pontianak.", status="completed", priority="medium", witel="KALBAR", category="permintaan", assigned_to="Tim Migrasi", created_by=1),
            ]
            db.add_all(inbox_items); db.commit()
            print(f"✅ Seeded {len(inbox_items)} inbox items")

        print("\n🎉 Seeding selesai!")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
