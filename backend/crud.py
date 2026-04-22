from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional
from models import User, SalesData, InboxItem, AuditLog
from schemas import (
    SalesCreate, SalesUpdate, UserCreate, InboxCreate, InboxUpdate,
    UserAdminCreate, UserAdminUpdate,
)
from auth import hash_password, verify_password


# ==================== USER CRUD ====================

def create_user(db: Session, user_data: UserCreate) -> User:
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        return None
    db_user = User(email=user_data.email, name=user_data.name, hashed_password=hash_password(user_data.password))
    db.add(db_user); db.commit(); db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


# ==================== SALES DATA CRUD ====================

def create_sales(db: Session, data: SalesCreate, user_id: int = None) -> SalesData:
    db_sales = SalesData(**data.model_dump(), created_by=user_id)
    db.add(db_sales); db.commit(); db.refresh(db_sales)
    return db_sales

def get_sales_list(db: Session, skip=0, limit=20, witel=None, product=None,
                   year=None, month=None, search=None, datasource_id=None):
    query = db.query(SalesData)
    if witel:
        query = query.filter(SalesData.witel == witel)
    if product:
        query = query.filter(SalesData.product == product)
    if year:
        query = query.filter(SalesData.period_year == year)
    if month:
        query = query.filter(SalesData.period_month == month)
    if datasource_id:
        query = query.filter(SalesData.datasource_id == datasource_id)
    if search:
        query = query.filter(or_(
            SalesData.witel.ilike(f"%{search}%"),
            SalesData.channel.ilike(f"%{search}%"),
            SalesData.telda.ilike(f"%{search}%"),
            SalesData.nama_pelanggan.ilike(f"%{search}%"),
        ))
    total = query.count()
    items = query.order_by(SalesData.period_year.desc(), SalesData.period_month.desc()).offset(skip).limit(limit).all()
    return {"total": total, "items": items}

def get_sales(db: Session, sales_id: int) -> SalesData | None:
    return db.query(SalesData).filter(SalesData.id == sales_id).first()

def update_sales(db: Session, sales_id: int, data: SalesUpdate) -> SalesData | None:
    db_sales = db.query(SalesData).filter(SalesData.id == sales_id).first()
    if not db_sales:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(db_sales, field, value)
    db.commit(); db.refresh(db_sales)
    return db_sales

def delete_sales(db: Session, sales_id: int) -> bool:
    db_sales = db.query(SalesData).filter(SalesData.id == sales_id).first()
    if not db_sales:
        return False
    db.delete(db_sales); db.commit()
    return True

def _apply_datasource_filter(query, datasource_ids: Optional[List[int]] = None):
    """Apply datasource_ids filter to a query."""
    if datasource_ids:
        query = query.filter(SalesData.datasource_id.in_(datasource_ids))
    return query

def get_sales_summary(db: Session, year=None, witel=None, datasource_ids: Optional[List[int]] = None):
    query = db.query(SalesData)
    if year:
        query = query.filter(SalesData.period_year == year)
    if witel:
        query = query.filter(SalesData.witel == witel)
    query = _apply_datasource_filter(query, datasource_ids)

    result = query.with_entities(
        func.sum(SalesData.revenue_target).label("total_target"),
        func.sum(SalesData.revenue_actual).label("total_actual"),
        func.sum(SalesData.sales_target).label("total_ssl_target"),
        func.sum(SalesData.sales_actual).label("total_ssl_actual"),
        func.count(SalesData.id).label("total_records"),
    ).first()

    return {
        "total_target": float(result.total_target or 0),
        "total_actual": float(result.total_actual or 0),
        "total_ssl_target": int(result.total_ssl_target or 0),
        "total_ssl_actual": int(result.total_ssl_actual or 0),
        "total_records": result.total_records,
        "achievement": round((float(result.total_actual or 0) / float(result.total_target or 1)) * 100, 1),
    }

def get_monthly_revenue(db: Session, year=None, witel=None, datasource_ids: Optional[List[int]] = None):
    query = db.query(SalesData.period_month, SalesData.witel, func.sum(SalesData.revenue_actual).label("revenue"))
    if year:
        query = query.filter(SalesData.period_year == year)
    if witel:
        query = query.filter(SalesData.witel == witel)
    if datasource_ids:
        query = query.filter(SalesData.datasource_id.in_(datasource_ids))
    results = query.group_by(SalesData.period_month, SalesData.witel).order_by(SalesData.period_month).all()
    return [{"month": r.period_month, "witel": r.witel, "revenue": float(r.revenue)} for r in results]

def get_sales_by_telda(db: Session, year=None, witel=None, datasource_ids: Optional[List[int]] = None):
    """Get revenue aggregated by telda (Telkom Daerah)."""
    query = db.query(
        SalesData.telda,
        SalesData.witel,
        func.sum(SalesData.revenue_actual).label("revenue"),
        func.sum(SalesData.revenue_target).label("target"),
        func.count(SalesData.id).label("count"),
    )
    if year:
        query = query.filter(SalesData.period_year == year)
    if witel:
        query = query.filter(SalesData.witel == witel)
    if datasource_ids:
        query = query.filter(SalesData.datasource_id.in_(datasource_ids))

    results = query.group_by(SalesData.telda, SalesData.witel).order_by(func.sum(SalesData.revenue_actual).desc()).all()

    return [{
        "telda": r.telda or r.witel,
        "witel": r.witel,
        "revenue": round(float(r.revenue), 2),
        "target": round(float(r.target), 2),
        "count": r.count,
        "achievement": round((float(r.revenue) / float(r.target)) * 100, 1) if r.target else 0,
    } for r in results]

def get_sales_trend(db: Session, witel=None, datasource_ids: Optional[List[int]] = None):
    """Get yearly sales trend data for Trend Sales page."""
    query = db.query(
        SalesData.period_year,
        SalesData.period_month,
        SalesData.witel,
        func.sum(SalesData.revenue_actual).label("revenue"),
        func.sum(SalesData.revenue_target).label("target"),
        func.sum(SalesData.sales_actual).label("ssl"),
    )
    if witel:
        query = query.filter(SalesData.witel == witel)
    if datasource_ids:
        query = query.filter(SalesData.datasource_id.in_(datasource_ids))

    results = query.group_by(SalesData.period_year, SalesData.period_month, SalesData.witel)\
        .order_by(SalesData.period_year, SalesData.period_month).all()

    return [{
        "year": r.period_year, "month": r.period_month, "witel": r.witel,
        "revenue": round(float(r.revenue), 2), "target": round(float(r.target), 2),
        "ssl": int(r.ssl),
    } for r in results]


# ==================== INBOX CRUD ====================

def create_inbox(db: Session, data: InboxCreate, user_id: int = None) -> InboxItem:
    db_inbox = InboxItem(**data.model_dump(), created_by=user_id)
    db.add(db_inbox); db.commit(); db.refresh(db_inbox)
    return db_inbox

def get_inbox_list(db: Session, skip=0, limit=20, status=None, priority=None,
                   witel=None, search=None, category=None, datasource_id=None):
    query = db.query(InboxItem)
    if status:
        query = query.filter(InboxItem.status == status)
    if priority:
        query = query.filter(InboxItem.priority == priority)
    if witel:
        query = query.filter(InboxItem.witel == witel)
    if category:
        query = query.filter(InboxItem.category == category)
    if datasource_id:
        query = query.filter(InboxItem.datasource_id == datasource_id)
    if search:
        query = query.filter(or_(
            InboxItem.title.ilike(f"%{search}%"),
            InboxItem.description.ilike(f"%{search}%"),
        ))
    total = query.count()
    items = query.order_by(InboxItem.created_at.desc()).offset(skip).limit(limit).all()
    return {"total": total, "items": items}

def get_inbox(db: Session, inbox_id: int) -> InboxItem | None:
    return db.query(InboxItem).filter(InboxItem.id == inbox_id).first()

def update_inbox(db: Session, inbox_id: int, data: InboxUpdate) -> InboxItem | None:
    db_inbox = db.query(InboxItem).filter(InboxItem.id == inbox_id).first()
    if not db_inbox:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(db_inbox, field, value)
    db.commit(); db.refresh(db_inbox)
    return db_inbox

def delete_inbox(db: Session, inbox_id: int) -> bool:
    db_inbox = db.query(InboxItem).filter(InboxItem.id == inbox_id).first()
    if not db_inbox:
        return False
    db.delete(db_inbox); db.commit()
    return True

def get_inbox_stats(db: Session, witel: str = None):
    query = db.query(InboxItem.status, func.count(InboxItem.id).label("count"))
    if witel:
        query = query.filter(InboxItem.witel == witel)
    results = query.group_by(InboxItem.status).all()
    stats = {r.status: r.count for r in results}
    total = sum(stats.values())
    return {
        "total": total, "by_status": stats,
        "pending": stats.get("pending", 0), "in_progress": stats.get("in_progress", 0),
        "completed": stats.get("completed", 0), "rejected": stats.get("rejected", 0),
    }


# ==================== AUDIT LOG ====================

def log_audit(db: Session, user: Optional[User], action: str,
              entity_type: str = None, entity_id=None, detail: str = None):
    """Catat aktivitas user ke audit_logs. Aman dipanggil dari mana saja."""
    try:
        log = AuditLog(
            user_id=user.id if user else None,
            user_email=user.email if user else None,
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id is not None else None,
            detail=detail,
        )
        db.add(log); db.commit()
    except Exception:
        db.rollback()

def get_audit_logs(db: Session, skip=0, limit=50, action=None, user_id=None):
    q = db.query(AuditLog)
    if action:
        q = q.filter(AuditLog.action == action)
    if user_id:
        q = q.filter(AuditLog.user_id == user_id)
    total = q.count()
    items = q.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    return {"total": total, "items": items}


# ==================== LEADERBOARD ====================

def get_leaderboard(db: Session, year: int = None):
    """
    Peringkat per Witel: berdasarkan achievement revenue (dari SalesData)
    + resolution rate tiket (InboxItem).
    Target murni diambil dari SalesData.revenue_target (tidak ada override manual).
    """
    sales_q = db.query(
        SalesData.witel,
        func.sum(SalesData.revenue_actual).label("rev_actual"),
        func.sum(SalesData.revenue_target).label("rev_target"),
    )
    if year:
        sales_q = sales_q.filter(SalesData.period_year == year)
    sales_rows = sales_q.group_by(SalesData.witel).all()

    # Tickets per witel
    inbox_rows = db.query(
        InboxItem.witel, InboxItem.status, func.count(InboxItem.id)
    ).group_by(InboxItem.witel, InboxItem.status).all()
    t_map: dict[str, dict] = {}
    for w, st, cnt in inbox_rows:
        t_map.setdefault(w, {"total": 0, "resolved": 0})
        t_map[w]["total"] += cnt
        if st == "completed":
            t_map[w]["resolved"] += cnt

    result = []
    for s in sales_rows:
        witel = s.witel
        actual = float(s.rev_actual or 0)
        target = float(s.rev_target or 0)
        ach = round((actual / target) * 100, 1) if target > 0 else 0.0
        tstat = t_map.get(witel, {"total": 0, "resolved": 0})
        res_rate = round((tstat["resolved"] / tstat["total"]) * 100, 1) if tstat["total"] else 0.0
        # Skor gabungan: 70% revenue ach + 30% tiket
        score = round(ach * 0.7 + res_rate * 0.3, 2)
        result.append({
            "witel": witel,
            "revenue_actual": round(actual, 2),
            "revenue_target": round(target, 2),
            "achievement": ach,
            "tickets_total": tstat["total"],
            "tickets_resolved": tstat["resolved"],
            "resolution_rate": res_rate,
            "score": score,
        })
    result.sort(key=lambda x: x["score"], reverse=True)
    for i, row in enumerate(result, start=1):
        row["rank"] = i
    return result


# ==================== ADMIN USER MANAGEMENT ====================

def admin_create_user(db: Session, data: UserAdminCreate):
    if db.query(User).filter(User.email == data.email).first():
        return None
    u = User(email=data.email, name=data.name, role=data.role,
             hashed_password=hash_password(data.password))
    db.add(u); db.commit(); db.refresh(u)
    return u

def admin_update_user(db: Session, user_id: int, data: UserAdminUpdate):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(u, field, value)
    db.commit(); db.refresh(u)
    return u

def admin_delete_user(db: Session, user_id: int) -> bool:
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        return False
    db.delete(u); db.commit()
    return True

def list_users(db: Session):
    return db.query(User).order_by(User.created_at.desc()).all()
