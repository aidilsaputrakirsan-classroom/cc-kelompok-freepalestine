"""
Data Migration Script — Monolith → Microservices (Modul 13)

Migrasi data dari database monolith (telkom_dashboard) ke:
  - auth_db     → tabel users
  - dashboard_db → tabel sales_data, inbox_items

Usage:
    pip install sqlalchemy psycopg2-binary
    python scripts/migrate_data.py

Environment (override sesuai setup Anda):
    MONOLITH_DB_URL   — default localhost:5432/telkom_dashboard
    AUTH_DB_URL       — default localhost:5433/auth_db
    DASHBOARD_DB_URL  — default localhost:5434/dashboard_db

Prerequisite:
    - Monolith DB dapat diakses (docker compose monolith atau backup)
    - Microservices DB running; untuk akses dari host, jalankan dengan
      docker-compose.dev.yml (expose port 5433/5434) atau sesuaikan URL.
"""
from __future__ import annotations

import os
import sys

from sqlalchemy import create_engine, text

MONOLITH_DB_URL = os.getenv(
    "MONOLITH_DB_URL",
    "postgresql://postgres:postgres123@localhost:5432/telkom_dashboard",
)
AUTH_DB_URL = os.getenv(
    "AUTH_DB_URL",
    "postgresql://postgres:postgres123@localhost:5433/auth_db",
)
DASHBOARD_DB_URL = os.getenv(
    "DASHBOARD_DB_URL",
    "postgresql://postgres:postgres123@localhost:5434/dashboard_db",
)


def _table_exists(engine, table: str) -> bool:
    with engine.connect() as conn:
        row = conn.execute(
            text(
                "SELECT EXISTS ("
                "  SELECT FROM information_schema.tables "
                "  WHERE table_schema = 'public' AND table_name = :t"
                ")"
            ),
            {"t": table},
        ).scalar()
    return bool(row)


def migrate_users(monolith, auth_db) -> int:
    if not _table_exists(monolith, "users"):
        print("     ⚠️  Tabel users tidak ada di monolith — skip")
        return 0

    with monolith.connect() as src:
        users = src.execute(
            text(
                "SELECT id, email, name, hashed_password, role, is_active, created_at "
                "FROM users ORDER BY id"
            )
        ).fetchall()
    print(f"     Found {len(users)} users in monolith")

    if not users:
        return 0

    with auth_db.connect() as dst:
        for user in users:
            dst.execute(
                text(
                    """
                    INSERT INTO users (
                        id, email, name, hashed_password, role, is_active, created_at
                    )
                    VALUES (
                        :id, :email, :name, :hashed_password,
                        COALESCE(:role, 'viewer'), COALESCE(:is_active, true), :created_at
                    )
                    ON CONFLICT (email) DO NOTHING
                    """
                ),
                {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "hashed_password": user.hashed_password,
                    "role": user.role,
                    "is_active": user.is_active,
                    "created_at": user.created_at,
                },
            )
        dst.execute(
            text(
                "SELECT setval(pg_get_serial_sequence('users', 'id'), "
                "COALESCE((SELECT MAX(id) FROM users), 1))"
            )
        )
        dst.commit()

    print(f"     ✅ Migrated users (up to {len(users)} rows processed)")
    return len(users)


def migrate_sales(monolith, dashboard_db) -> int:
    if not _table_exists(monolith, "sales_data"):
        print("     ⚠️  Tabel sales_data tidak ada di monolith — skip")
        return 0

    with monolith.connect() as src:
        rows = src.execute(
            text(
                """
                SELECT id, witel, channel, product,
                       revenue_target, revenue_actual,
                       sales_target, sales_actual,
                       period_month, period_year, created_by,
                       created_at, updated_at
                FROM sales_data ORDER BY id
                """
            )
        ).fetchall()
    print(f"     Found {len(rows)} sales records in monolith")

    if not rows:
        return 0

    with dashboard_db.connect() as dst:
        for row in rows:
            dst.execute(
                text(
                    """
                    INSERT INTO sales_data (
                        id, witel, channel, product,
                        revenue_target, revenue_actual,
                        sales_target, sales_actual,
                        period_month, period_year, created_by,
                        created_at, updated_at
                    )
                    VALUES (
                        :id, :witel, :channel, :product,
                        :revenue_target, :revenue_actual,
                        :sales_target, :sales_actual,
                        :period_month, :period_year, :created_by,
                        :created_at, :updated_at
                    )
                    ON CONFLICT (id) DO NOTHING
                    """
                ),
                row._mapping,
            )
        dst.execute(
            text(
                "SELECT setval(pg_get_serial_sequence('sales_data', 'id'), "
                "COALESCE((SELECT MAX(id) FROM sales_data), 1))"
            )
        )
        dst.commit()

    print(f"     ✅ Migrated sales_data ({len(rows)} rows processed)")
    return len(rows)


def migrate_inbox(monolith, dashboard_db) -> int:
    if not _table_exists(monolith, "inbox_items"):
        print("     ⚠️  Tabel inbox_items tidak ada di monolith — skip")
        return 0

    with monolith.connect() as src:
        rows = src.execute(
            text(
                """
                SELECT id, title, description, status, priority, witel,
                       category, assigned_to, created_by, created_at, updated_at
                FROM inbox_items ORDER BY id
                """
            )
        ).fetchall()
    print(f"     Found {len(rows)} inbox items in monolith")

    if not rows:
        return 0

    with dashboard_db.connect() as dst:
        for row in rows:
            dst.execute(
                text(
                    """
                    INSERT INTO inbox_items (
                        id, title, description, status, priority, witel,
                        category, assigned_to, created_by, created_at, updated_at
                    )
                    VALUES (
                        :id, :title, :description, :status, :priority, :witel,
                        :category, :assigned_to, :created_by, :created_at, :updated_at
                    )
                    ON CONFLICT (id) DO NOTHING
                    """
                ),
                row._mapping,
            )
        dst.execute(
            text(
                "SELECT setval(pg_get_serial_sequence('inbox_items', 'id'), "
                "COALESCE((SELECT MAX(id) FROM inbox_items), 1))"
            )
        )
        dst.commit()

    print(f"     ✅ Migrated inbox_items ({len(rows)} rows processed)")
    return len(rows)


def migrate() -> None:
    print("=" * 55)
    print("DATA MIGRATION: Monolith → Microservices (Free Palestine)")
    print("=" * 55)

    monolith = create_engine(MONOLITH_DB_URL)
    auth_db = create_engine(AUTH_DB_URL)
    dashboard_db = create_engine(DASHBOARD_DB_URL)

    print("\n[1/3] Migrating users → auth_db...")
    migrate_users(monolith, auth_db)

    print("\n[2/3] Migrating sales_data → dashboard_db...")
    migrate_sales(monolith, dashboard_db)

    print("\n[3/3] Migrating inbox_items → dashboard_db...")
    migrate_inbox(monolith, dashboard_db)

    print("\n" + "=" * 55)
    print("MIGRATION COMPLETE!")
    print("=" * 55)


if __name__ == "__main__":
    try:
        migrate()
    except Exception as exc:
        print(f"\n❌ Migration failed: {exc}")
        print(
            "Pastikan database dapat diakses dan tabel sudah dibuat "
            "(jalankan microservices sekali agar create_all jalan)."
        )
        sys.exit(1)
