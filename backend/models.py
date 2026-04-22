from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.sql import func
from database import Base


class User(Base):
    """Model untuk tabel 'users' — Autentikasi dashboard."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="viewer")  # admin, viewer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Telda(Base):
    """Model untuk tabel 'telda' — Telkom Daerah per Witel."""
    __tablename__ = "telda"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    witel = Column(String(50), nullable=False, index=True)
    branch_type = Column(String(20), nullable=False)  # Inner, Type-1, Type-2


class SalesData(Base):
    """
    Model untuk tabel 'sales_data' — Data penjualan & revenue
    Telkom Regional 4 Kalimantan.
    """
    __tablename__ = "sales_data"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    witel = Column(String(50), nullable=False, index=True)
    telda = Column(String(100), nullable=True, index=True)        # Telkom Daerah
    channel = Column(String(50), nullable=False)
    product = Column(String(50), nullable=False, default="HSI")
    revenue_target = Column(Float, nullable=False, default=0)
    revenue_actual = Column(Float, nullable=False, default=0)
    sales_target = Column(Integer, nullable=False, default=0)
    sales_actual = Column(Integer, nullable=False, default=0)
    period_month = Column(Integer, nullable=False)
    period_year = Column(Integer, nullable=False)
    flag = Column(String(50), nullable=True)           # NONPOT/POT
    flag_2 = Column(String(100), nullable=True)        # REV SCALING NEW, etc
    flag_3 = Column(String(50), nullable=True)         # SCALLING/SUSTAIN
    nama_pelanggan = Column(String(200), nullable=True)
    layanan = Column(String(200), nullable=True)       # Enterprise Connectivity, etc
    nama_am = Column(String(100), nullable=True)       # Account Manager
    datasource_id = Column(Integer, ForeignKey("data_sources.id", ondelete="CASCADE"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class InboxItem(Base):
    """Model untuk tabel 'inbox_items' — Tiket monitoring & tindak lanjut."""
    __tablename__ = "inbox_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(30), nullable=False, default="pending")
    priority = Column(String(20), nullable=False, default="medium")
    witel = Column(String(50), nullable=False)
    category = Column(String(50), nullable=True)
    assigned_to = Column(String(100), nullable=True)
    datasource_id = Column(Integer, ForeignKey("data_sources.id", ondelete="CASCADE"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class DataSource(Base):
    """Model untuk tabel 'data_sources' — Tracking file upload CSV/XLSX."""
    __tablename__ = "data_sources"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(200), nullable=False)         # Nama file asli
    file_type = Column(String(10), nullable=False)     # csv, xlsx
    row_count = Column(Integer, nullable=False, default=0)
    target_table = Column(String(30), nullable=False)  # sales, inbox
    is_active = Column(Boolean, default=True)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AuditLog(Base):
    """Model untuk tabel 'audit_logs' — Riwayat aktivitas user (login, CRUD, upload)."""
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_email = Column(String(255), nullable=True)
    action = Column(String(50), nullable=False, index=True)  # login, logout, create_target, update_target, etc
    entity_type = Column(String(50), nullable=True)          # target, user, sales, inbox, file
    entity_id = Column(String(100), nullable=True)
    detail = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
