import os
import uuid
from typing import List
from datetime import datetime, timezone
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from sqlalchemy import or_

from database import engine, get_db
from models import Base, User, SalesData, InboxItem, DataSource, Telda, AuditLog
from schemas import (
    SalesCreate, SalesUpdate, SalesResponse, SalesListResponse,
    InboxCreate, InboxUpdate, InboxResponse, InboxListResponse,
    UserCreate, UserResponse, LoginRequest, TokenResponse,
    ChangePasswordRequest,
    UserAdminCreate, UserAdminUpdate,
    DataSourceResponse, DataSourceListResponse,
    TeldaResponse, NotificationItem,
    AuditLogResponse, AuditLogListResponse,
)
from auth import create_access_token, get_current_user, hash_password, verify_password
import crud
from upload import parse_file, map_sales_rows, map_inbox_rows


# ==================== ADMIN GUARD ====================
def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Akses ditolak: hanya admin")
    return current_user

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Dashboard Telkom API",
    description="REST API Dashboard Monitoring Revenue — Telkom Regional 4 Kalimantan",
    version="2.5.0",
)

# ==================== CORS ====================
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
origins_list = [origin.strip() for origin in allowed_origins.split(",")]
app.add_middleware(CORSMiddleware, allow_origins=origins_list, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


# ==================== HEALTH ====================
@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "2.5.0", "service": "dashboard-telkom-api"}


# ==================== AUTH ====================
@app.post("/auth/register", response_model=UserResponse, status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    user = crud.create_user(db=db, user_data=user_data)
    if not user:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")
    return user

@app.post("/auth/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = crud.authenticate_user(db=db, email=login_data.email, password=login_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Email atau password salah")
    token = create_access_token(data={"sub": str(user.id)})
    crud.log_audit(db, user, "login", detail=f"User '{user.email}' berhasil login")
    return {"access_token": token, "token_type": "bearer", "user": user}

@app.get("/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.put("/auth/change-password")
def change_password(data: ChangePasswordRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not verify_password(data.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Password lama salah")
    current_user.hashed_password = hash_password(data.new_password)
    db.commit()
    crud.log_audit(db, current_user, "change_password", detail="User mengubah password")
    return {"message": "Password berhasil diubah"}

# ==================== SALES / REVENUE ====================
@app.post("/sales", response_model=SalesResponse, status_code=201)
def create_sales(data: SalesCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.create_sales(db=db, data=data, user_id=current_user.id)

@app.get("/sales", response_model=SalesListResponse)
def list_sales(skip: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=10000),
               witel: str = Query(None), product: str = Query(None),
               year: int = Query(None), month: int = Query(None),
               search: str = Query(None), datasource_id: int = Query(None),
               db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.get_sales_list(db=db, skip=skip, limit=limit, witel=witel, product=product,
                               year=year, month=month, search=search, datasource_id=datasource_id)

@app.get("/sales/summary")
def sales_summary(year: int = Query(None), witel: str = Query(None),
                   datasource_ids: str = Query(None),
                   db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ds_ids = [int(x) for x in datasource_ids.split(",")] if datasource_ids else None
    return crud.get_sales_summary(db=db, year=year, witel=witel, datasource_ids=ds_ids)

@app.get("/sales/monthly")
def sales_monthly(year: int = Query(None), witel: str = Query(None),
                   datasource_ids: str = Query(None),
                   db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ds_ids = [int(x) for x in datasource_ids.split(",")] if datasource_ids else None
    return crud.get_monthly_revenue(db=db, year=year, witel=witel, datasource_ids=ds_ids)

@app.get("/sales/by-telda")
def sales_by_telda(year: int = Query(None), witel: str = Query(None),
                    datasource_ids: str = Query(None),
                    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ds_ids = [int(x) for x in datasource_ids.split(",")] if datasource_ids else None
    return crud.get_sales_by_telda(db=db, year=year, witel=witel, datasource_ids=ds_ids)

@app.get("/sales/trend")
def sales_trend(witel: str = Query(None), datasource_ids: str = Query(None),
                db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ds_ids = [int(x) for x in datasource_ids.split(",")] if datasource_ids else None
    return crud.get_sales_trend(db=db, witel=witel, datasource_ids=ds_ids)

@app.get("/sales/{sales_id}", response_model=SalesResponse)
def get_sales(sales_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = crud.get_sales(db=db, sales_id=sales_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return item

@app.put("/sales/{sales_id}", response_model=SalesResponse)
def update_sales(sales_id: int, data: SalesUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    updated = crud.update_sales(db=db, sales_id=sales_id, data=data)
    if not updated:
        raise HTTPException(status_code=404, detail="Not found")
    return updated

@app.delete("/sales/{sales_id}", status_code=204)
def delete_sales(sales_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not crud.delete_sales(db=db, sales_id=sales_id):
        raise HTTPException(status_code=404, detail="Not found")


# ==================== INBOX ====================
@app.post("/inbox", response_model=InboxResponse, status_code=201)
def create_inbox(data: InboxCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.create_inbox(db=db, data=data, user_id=current_user.id)

@app.get("/inbox", response_model=InboxListResponse)
def list_inbox(skip: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=10000),
               status: str = Query(None), priority: str = Query(None),
               witel: str = Query(None), search: str = Query(None),
               datasource_id: int = Query(None),
               db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.get_inbox_list(db=db, skip=skip, limit=limit, status=status,
                               priority=priority, witel=witel, search=search, datasource_id=datasource_id)

@app.get("/inbox/stats")
def inbox_stats(witel: str = Query(None), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.get_inbox_stats(db=db, witel=witel)

@app.get("/inbox/{inbox_id}", response_model=InboxResponse)
def get_inbox(inbox_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = crud.get_inbox(db=db, inbox_id=inbox_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return item

@app.put("/inbox/{inbox_id}", response_model=InboxResponse)
def update_inbox(inbox_id: int, data: InboxUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    updated = crud.update_inbox(db=db, inbox_id=inbox_id, data=data)
    if not updated:
        raise HTTPException(status_code=404, detail="Not found")
    return updated

@app.delete("/inbox/{inbox_id}", status_code=204)
def delete_inbox(inbox_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not crud.delete_inbox(db=db, inbox_id=inbox_id):
        raise HTTPException(status_code=404, detail="Not found")


# ==================== UPLOAD / DATA SOURCES ====================
@app.post("/upload/sales")
async def upload_sales(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    content = await file.read()
    try:
        rows = parse_file(content, file.filename)
        mapped, errors = map_sales_rows(rows)
    except ValueError as e:
        # Header/format tidak sesuai skema Revenue Analytics.
        raise HTTPException(status_code=400, detail=str(e))

    if not mapped:
        raise HTTPException(
            status_code=400,
            detail=(
                "Tidak ada baris data yang valid. File tidak akan disimpan. "
                "Detail per baris: " + "; ".join(errors[:5])
                + ("..." if len(errors) > 5 else "")
            ),
        )

    ds = DataSource(name=file.filename, file_type=file.filename.rsplit(".", 1)[-1].lower(),
                    row_count=len(mapped), target_table="sales", uploaded_by=current_user.id)
    db.add(ds); db.commit(); db.refresh(ds)

    for m in mapped:
        item = SalesData(**m, datasource_id=ds.id, created_by=current_user.id)
        db.add(item)
    db.commit()

    crud.log_audit(db, current_user, "upload_sales", entity_type="file", entity_id=ds.id,
                   detail=f"Upload file revenue '{file.filename}' ({len(mapped)} baris valid)")

    return {
        "message": f"Berhasil import {len(mapped)} data revenue. Data otomatis tampil di menu Revenue Analytics.",
        "datasource_id": ds.id,
        "row_count": len(mapped),
        "errors": errors,
        "target": "revenue",
    }

@app.post("/upload/inbox")
async def upload_inbox(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    content = await file.read()
    try:
        rows = parse_file(content, file.filename)
        mapped, errors = map_inbox_rows(rows)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not mapped:
        raise HTTPException(
            status_code=400,
            detail=(
                "Tidak ada baris data yang valid. File tidak akan disimpan. "
                "Detail per baris: " + "; ".join(errors[:5])
                + ("..." if len(errors) > 5 else "")
            ),
        )

    ds = DataSource(name=file.filename, file_type=file.filename.rsplit(".", 1)[-1].lower(),
                    row_count=len(mapped), target_table="inbox", uploaded_by=current_user.id)
    db.add(ds); db.commit(); db.refresh(ds)

    for m in mapped:
        item = InboxItem(**m, datasource_id=ds.id, created_by=current_user.id)
        db.add(item)
    db.commit()

    crud.log_audit(db, current_user, "upload_inbox", entity_type="file", entity_id=ds.id,
                   detail=f"Upload file inbox '{file.filename}' ({len(mapped)} baris valid)")

    return {
        "message": f"Berhasil import {len(mapped)} tiket. Data otomatis tampil di menu Customer Care & NPS.",
        "datasource_id": ds.id,
        "row_count": len(mapped),
        "errors": errors,
        "target": "inbox",
    }

@app.get("/datasources", response_model=DataSourceListResponse)
def list_datasources(target_table: str = Query(None), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(DataSource)
    if target_table:
        q = q.filter(DataSource.target_table == target_table)
    items = q.order_by(DataSource.created_at.desc()).all()
    return {"total": len(items), "items": items}

@app.delete("/datasources/{ds_id}", status_code=204)
def delete_datasource(ds_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ds = db.query(DataSource).filter(DataSource.id == ds_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="DataSource not found")
    if ds.target_table == "sales":
        db.query(SalesData).filter(SalesData.datasource_id == ds_id).delete()
    elif ds.target_table == "inbox":
        db.query(InboxItem).filter(InboxItem.datasource_id == ds_id).delete()
    db.delete(ds); db.commit()


# ==================== TELDA ====================
@app.get("/telda")
def list_telda(witel: str = Query(None), db: Session = Depends(get_db)):
    q = db.query(Telda)
    if witel:
        q = q.filter(Telda.witel == witel)
    return q.order_by(Telda.witel, Telda.name).all()


# ==================== NOTIFICATIONS ====================
@app.get("/notifications")
def get_notifications(datasource_ids: str = Query(None), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notifications = []
    ds_ids = [int(x) for x in datasource_ids.split(",")] if datasource_ids else None

    if ds_ids and len(ds_ids) >= 2:
        for i in range(len(ds_ids)):
            for j in range(i + 1, len(ds_ids)):
                ds1 = db.query(DataSource).filter(DataSource.id == ds_ids[i]).first()
                ds2 = db.query(DataSource).filter(DataSource.id == ds_ids[j]).first()
                if not ds1 or not ds2:
                    continue

                rev1 = db.query(func.sum(SalesData.revenue_actual)).filter(SalesData.datasource_id == ds_ids[i]).scalar() or 0
                rev2 = db.query(func.sum(SalesData.revenue_actual)).filter(SalesData.datasource_id == ds_ids[j]).scalar() or 0

                if rev1 > 0 and rev2 > 0:
                    diff_pct = abs(rev1 - rev2) / max(rev1, rev2) * 100
                    if diff_pct > 20:
                        higher = ds1.name if rev1 > rev2 else ds2.name
                        lower = ds2.name if rev1 > rev2 else ds1.name
                        notifications.append({
                            "id": str(uuid.uuid4())[:8],
                            "type": "anomaly",
                            "title": f"Perbedaan signifikan ({diff_pct:.1f}%)",
                            "message": f"Revenue di '{higher}' lebih tinggi {diff_pct:.1f}% dibanding '{lower}'",
                            "severity": "high" if diff_pct > 50 else "medium",
                            "datasource_ids": [ds_ids[i], ds_ids[j]],
                            "created_at": datetime.now(timezone.utc).isoformat(),
                        })

    # Also check for low achievement
    summary = crud.get_sales_summary(db=db, datasource_ids=ds_ids)
    if summary and summary.get("achievement", 100) < 80:
        notifications.append({
            "id": str(uuid.uuid4())[:8], "type": "warning",
            "title": f"Achievement rendah ({summary['achievement']}%)",
            "message": f"Total realisasi baru {summary['achievement']}% dari target",
            "severity": "high", "datasource_ids": ds_ids,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    # Check critical inbox tickets
    critical_count = db.query(InboxItem).filter(InboxItem.priority == "critical", InboxItem.status.in_(["pending", "in_progress"])).count()
    if critical_count > 0:
        notifications.append({
            "id": str(uuid.uuid4())[:8], "type": "warning",
            "title": f"{critical_count} tiket kritis belum selesai",
            "message": "Ada tiket dengan prioritas critical yang masih menunggu",
            "severity": "critical", "datasource_ids": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    return notifications


# ==================== MONITORING (CUSTOMER CARE) ====================
@app.get("/monitoring/summary")
def monitoring_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total = db.query(InboxItem).count()
    resolved = db.query(InboxItem).filter(InboxItem.status == "completed").count()
    critical = db.query(InboxItem).filter(InboxItem.priority == "critical").count()
    resolution_rate = round((resolved / max(total, 1)) * 100, 1)

    by_witel = db.query(InboxItem.witel, func.count(InboxItem.id)).group_by(InboxItem.witel).all()
    by_category = db.query(InboxItem.category, func.count(InboxItem.id)).filter(InboxItem.category.isnot(None)).group_by(InboxItem.category).all()

    nps = max(0, min(100, round(resolution_rate * 0.8 + (100 - (critical / max(total, 1) * 100)) * 0.2, 1)))

    return {
        "nps_score": nps,
        "total_tickets": total,
        "resolved": resolved,
        "critical": critical,
        "resolution_rate": resolution_rate,
        "churn_indicator": round(100 - resolution_rate, 1),
        "by_witel": {w: c for w, c in by_witel},
        "by_category": {c: n for c, n in by_category},
    }


# ==================== TEAM ====================
@app.get("/team")
def team_info():
    return {
        "team": "cloud-team-freepalestine",
        "project": "Dashboard Revenue Telkom Regional 4 Kalimantan",
        "architecture": {
            "current": "Monolith (FastAPI + PostgreSQL + React)",
            "evolution": [
                {"phase": "Phase 1", "name": "Monolith", "desc": "Satu backend FastAPI + PostgreSQL + satu SPA React."},
                {"phase": "Phase 2", "name": "Microservices", "desc": "Pisahkan modul: Auth Service, Sales Service, Inbox Service, Upload Service."},
                {"phase": "Phase 3", "name": "Cloud Deployment", "desc": "Containerize dengan Docker, deploy ke AWS/GCP dengan K8s + managed PostgreSQL."},
            ],
            "tech_stack": {
                "backend": ["Python 3.11", "FastAPI", "SQLAlchemy", "Pydantic", "PostgreSQL", "python-jose (JWT)", "bcrypt"],
                "frontend": ["React 18", "Vite", "React Router", "Recharts", "Axios", "Lucide Icons", "Native CSS"],
                "infra": ["Docker", "Nginx (reverse-proxy)", "GitHub Actions (CI/CD)"],
            },
        },
        "members": [
            {"name": "Ariel Itsbat Nurhaq", "nim": "10231018", "role": "Lead Backend & Lead Frontend"},
            {"name": "Raditya Yudianto", "nim": "10231076", "role": "Lead QA & Docs"},
            {"name": "Muhammad Khoiruddin Marzuq", "nim": "10231065", "role": "Lead DevOps"},
        ],
    }


# ==================== LEADERBOARD ====================
@app.get("/leaderboard")
def leaderboard(year: int = Query(None), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.get_leaderboard(db=db, year=year)


# ==================== USER MANAGEMENT (ADMIN) ====================
@app.get("/users", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    return crud.list_users(db=db)

@app.post("/users", response_model=UserResponse, status_code=201)
def admin_create_user(data: UserAdminCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    u = crud.admin_create_user(db=db, data=data)
    if not u:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")
    crud.log_audit(db, admin, "create_user", entity_type="user", entity_id=u.id,
                   detail=f"Admin membuat user '{u.email}' (role={u.role})")
    return u

@app.put("/users/{user_id}", response_model=UserResponse)
def admin_update_user(user_id: int, data: UserAdminUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    u = crud.admin_update_user(db=db, user_id=user_id, data=data)
    if not u:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    crud.log_audit(db, admin, "update_user", entity_type="user", entity_id=u.id,
                   detail=f"Admin mengupdate user '{u.email}'")
    return u

@app.delete("/users/{user_id}", status_code=204)
def admin_delete_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    if admin.id == user_id:
        raise HTTPException(status_code=400, detail="Tidak bisa menghapus akun sendiri")
    if not crud.admin_delete_user(db=db, user_id=user_id):
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    crud.log_audit(db, admin, "delete_user", entity_type="user", entity_id=user_id)


# ==================== AUDIT LOGS ====================
@app.get("/audit-logs", response_model=AuditLogListResponse)
def list_audit_logs(skip: int = Query(0, ge=0), limit: int = Query(50, ge=1, le=200),
                    action: str = Query(None), user_id: int = Query(None),
                    db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    return crud.get_audit_logs(db=db, skip=skip, limit=limit, action=action, user_id=user_id)
