"""
Dashboard Service — Microservice untuk Sales & Inbox data (Week 12)
Port: 8002
Database: dashboard_db
Includes: Retry + Circuit Breaker (Week 13), Structured Logging + Metrics (Week 14)
"""
import os
import json
import uuid
import time
import logging
import httpx
from enum import Enum
from datetime import datetime, timezone
from typing import Optional
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, ForeignKey, or_
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.sql import func
from pydantic import BaseModel, Field
load_dotenv()

# ==================== CONFIG ====================
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres123@localhost:5432/dashboard_db")
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8001")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
SERVICE_NAME = "dashboard-service"

# ==================== LOGGING (Week 14) ====================
class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "service": SERVICE_NAME,
            "message": record.getMessage(),
            "module": record.module,
        }
        if hasattr(record, 'correlation_id'):
            log_data["correlation_id"] = record.correlation_id
        return json.dumps(log_data)

logger = logging.getLogger(SERVICE_NAME)
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)

# ==================== CIRCUIT BREAKER (Week 13) ====================
class CircuitState(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"

class CircuitBreaker:
    def __init__(self, failure_threshold=3, recovery_timeout=30):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.state = CircuitState.CLOSED
        self.last_failure_time = 0

    def can_execute(self) -> bool:
        if self.state == CircuitState.CLOSED:
            return True
        if self.state == CircuitState.OPEN:
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = CircuitState.HALF_OPEN
                logger.info("Circuit breaker: HALF_OPEN — attempting recovery")
                return True
            return False
        return True  # HALF_OPEN

    def on_success(self):
        self.failure_count = 0
        if self.state == CircuitState.HALF_OPEN:
            self.state = CircuitState.CLOSED
            logger.info("Circuit breaker: CLOSED — service recovered")

    def on_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN
            logger.warning(f"Circuit breaker: OPEN — {self.failure_count} consecutive failures")

    def get_state(self) -> dict:
        return {"state": self.state.value, "failure_count": self.failure_count, "threshold": self.failure_threshold}

auth_circuit = CircuitBreaker(failure_threshold=3, recovery_timeout=30)

# ==================== RETRY (Week 13) ====================
async def verify_token_with_retry(token: str, max_retries=3) -> dict:
    """Verify token via Auth Service with exponential backoff retry."""
    if not auth_circuit.can_execute():
        logger.warning("Circuit OPEN — using degraded mode (skipping auth verification)")
        return {"valid": True, "user_id": 0, "email": "degraded@mode", "role": "viewer"}

    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(
                    f"{AUTH_SERVICE_URL}/auth/verify",
                    headers={"Authorization": f"Bearer {token}"}
                )
                if response.status_code == 200:
                    auth_circuit.on_success()
                    return response.json()
                else:
                    raise Exception(f"Auth returned {response.status_code}")
        except Exception as e:
            wait_time = (2 ** attempt) * 0.5  # 0.5s, 1s, 2s
            logger.warning(f"Auth verify attempt {attempt+1}/{max_retries} failed: {e}. Retry in {wait_time}s")
            if attempt < max_retries - 1:
                time.sleep(wait_time)

    auth_circuit.on_failure()
    logger.error("All auth verify retries exhausted")
    raise HTTPException(status_code=503, detail="Auth service tidak tersedia")

# ==================== DATABASE ====================
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class SalesData(Base):
    __tablename__ = "sales_data"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    witel = Column(String(50), nullable=False, index=True)
    channel = Column(String(50), nullable=False)
    product = Column(String(50), nullable=False, default="HSI")
    revenue_target = Column(Float, nullable=False, default=0)
    revenue_actual = Column(Float, nullable=False, default=0)
    sales_target = Column(Integer, nullable=False, default=0)
    sales_actual = Column(Integer, nullable=False, default=0)
    period_month = Column(Integer, nullable=False)
    period_year = Column(Integer, nullable=False)
    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class InboxItem(Base):
    __tablename__ = "inbox_items"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(30), nullable=False, default="pending")
    priority = Column(String(20), nullable=False, default="medium")
    witel = Column(String(50), nullable=False)
    category = Column(String(50), nullable=True)
    assigned_to = Column(String(100), nullable=True)
    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==================== SCHEMAS ====================
class SalesCreate(BaseModel):
    witel: str; channel: str; product: str = "HSI"
    revenue_target: float = Field(ge=0); revenue_actual: float = Field(ge=0)
    sales_target: int = Field(ge=0); sales_actual: int = Field(ge=0)
    period_month: int = Field(ge=1, le=12); period_year: int = Field(ge=2020, le=2030)

class SalesUpdate(BaseModel):
    witel: Optional[str] = None; channel: Optional[str] = None; product: Optional[str] = None
    revenue_target: Optional[float] = None; revenue_actual: Optional[float] = None
    sales_target: Optional[int] = None; sales_actual: Optional[int] = None
    period_month: Optional[int] = None; period_year: Optional[int] = None

class InboxCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200); description: Optional[str] = None
    status: str = "pending"; priority: str = "medium"
    witel: str; category: Optional[str] = None; assigned_to: Optional[str] = None

class InboxUpdate(BaseModel):
    title: Optional[str] = None; description: Optional[str] = None
    status: Optional[str] = None; priority: Optional[str] = None
    witel: Optional[str] = None; category: Optional[str] = None; assigned_to: Optional[str] = None

# ==================== AUTH DEPENDENCY ====================
from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{AUTH_SERVICE_URL}/auth/login")

async def get_current_user_info(token: str = Depends(oauth2_scheme)):
    result = await verify_token_with_retry(token)
    if not result.get("valid"):
        raise HTTPException(status_code=401, detail="Token tidak valid")
    return result

# ==================== METRICS (Week 14) ====================
metrics = {"requests_total": 0, "requests_by_status": {}, "request_latency_sum": 0, "errors_total": 0, "auth_retries": 0}

# ==================== APP ====================
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    logger.info("Dashboard Service started")
    yield
    logger.info("Dashboard Service stopped")

app = FastAPI(title="Dashboard Service", version="2.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=[o.strip() for o in ALLOWED_ORIGINS], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.middleware("http")
async def observability_middleware(request: Request, call_next):
    correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
    start = time.time()
    response = await call_next(request)
    latency = time.time() - start
    response.headers["X-Correlation-ID"] = correlation_id
    metrics["requests_total"] += 1
    sk = str(response.status_code)
    metrics["requests_by_status"][sk] = metrics["requests_by_status"].get(sk, 0) + 1
    metrics["request_latency_sum"] += latency
    if response.status_code >= 400:
        metrics["errors_total"] += 1
    logger.info(f"{request.method} {request.url.path} -> {response.status_code} ({latency:.3f}s)", extra={"correlation_id": correlation_id})
    return response

# ==================== ENDPOINTS ====================
@app.get("/health")
def health():
    return {"status": "healthy", "service": SERVICE_NAME, "version": "2.0.0",
            "circuit_breaker": auth_circuit.get_state()}

@app.get("/metrics")
def get_metrics_endpoint():
    avg = metrics["request_latency_sum"] / max(metrics["requests_total"], 1)
    return {**metrics, "avg_latency_seconds": round(avg, 4), "circuit_breaker": auth_circuit.get_state()}

# ==================== SALES ENDPOINTS ====================
@app.post("/sales", status_code=201)
async def create_sales(data: SalesCreate, db: Session = Depends(get_db), user=Depends(get_current_user_info)):
    item = SalesData(**data.model_dump(), created_by=user.get("user_id"))
    db.add(item); db.commit(); db.refresh(item)
    return item

@app.get("/sales")
async def list_sales(skip: int = 0, limit: int = 20, witel: str = None, product: str = None,
                     year: int = None, month: int = None, search: str = None,
                     db: Session = Depends(get_db), user=Depends(get_current_user_info)):
    q = db.query(SalesData)
    if witel: q = q.filter(SalesData.witel == witel)
    if product: q = q.filter(SalesData.product == product)
    if year: q = q.filter(SalesData.period_year == year)
    if month: q = q.filter(SalesData.period_month == month)
    if search: q = q.filter(or_(SalesData.witel.ilike(f"%{search}%"), SalesData.channel.ilike(f"%{search}%")))
    total = q.count()
    items = q.order_by(SalesData.period_year.desc(), SalesData.period_month.desc()).offset(skip).limit(limit).all()
    return {"total": total, "items": items}

@app.get("/sales/summary")
async def sales_summary(year: int = None, witel: str = None, db: Session = Depends(get_db), user=Depends(get_current_user_info)):
    q = db.query(SalesData)
    if year: q = q.filter(SalesData.period_year == year)
    if witel: q = q.filter(SalesData.witel == witel)
    r = q.with_entities(func.sum(SalesData.revenue_target).label("tt"), func.sum(SalesData.revenue_actual).label("ta"),
                        func.sum(SalesData.sales_target).label("st"), func.sum(SalesData.sales_actual).label("sa"), func.count(SalesData.id).label("c")).first()
    tt = float(r.tt or 0); ta = float(r.ta or 0)
    return {"total_target": tt, "total_actual": ta, "total_ssl_target": int(r.st or 0), "total_ssl_actual": int(r.sa or 0),
            "total_records": r.c, "achievement": round((ta / max(tt, 0.01)) * 100, 1)}

@app.get("/sales/monthly")
async def sales_monthly(year: int = None, witel: str = None, db: Session = Depends(get_db), user=Depends(get_current_user_info)):
    q = db.query(SalesData.period_month, SalesData.witel, func.sum(SalesData.revenue_actual).label("rev"))
    if year: q = q.filter(SalesData.period_year == year)
    if witel: q = q.filter(SalesData.witel == witel)
    results = q.group_by(SalesData.period_month, SalesData.witel).order_by(SalesData.period_month).all()
    return [{"month": r.period_month, "witel": r.witel, "revenue": float(r.rev)} for r in results]

@app.get("/sales/{sales_id}")
async def get_sales(sales_id: int, db: Session = Depends(get_db), user=Depends(get_current_user_info)):
    item = db.query(SalesData).filter(SalesData.id == sales_id).first()
    if not item: raise HTTPException(status_code=404, detail="Not found")
    return item

@app.put("/sales/{sales_id}")
async def update_sales(sales_id: int, data: SalesUpdate, db: Session = Depends(get_db), user=Depends(get_current_user_info)):
    item = db.query(SalesData).filter(SalesData.id == sales_id).first()
    if not item: raise HTTPException(status_code=404, detail="Not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(item, k, v)
    db.commit(); db.refresh(item)
    return item

@app.delete("/sales/{sales_id}", status_code=204)
async def delete_sales(sales_id: int, db: Session = Depends(get_db), user=Depends(get_current_user_info)):
    item = db.query(SalesData).filter(SalesData.id == sales_id).first()
    if not item: raise HTTPException(status_code=404, detail="Not found")
    db.delete(item); db.commit()

# ==================== INBOX ENDPOINTS ====================
@app.post("/inbox", status_code=201)
async def create_inbox(data: InboxCreate, db: Session = Depends(get_db), user=Depends(get_current_user_info)):
    item = InboxItem(**data.model_dump(), created_by=user.get("user_id"))
    db.add(item); db.commit(); db.refresh(item)
    return item

@app.get("/inbox")
async def list_inbox(skip: int = 0, limit: int = 20, status: str = None, priority: str = None,
                     witel: str = None, search: str = None,
                     db: Session = Depends(get_db), user=Depends(get_current_user_info)):
    q = db.query(InboxItem)
    if status: q = q.filter(InboxItem.status == status)
    if priority: q = q.filter(InboxItem.priority == priority)
    if witel: q = q.filter(InboxItem.witel == witel)
    if search: q = q.filter(or_(InboxItem.title.ilike(f"%{search}%"), InboxItem.description.ilike(f"%{search}%")))
    total = q.count()
    items = q.order_by(InboxItem.created_at.desc()).offset(skip).limit(limit).all()
    return {"total": total, "items": items}

@app.get("/inbox/stats")
async def inbox_stats(witel: str = None, db: Session = Depends(get_db), user=Depends(get_current_user_info)):
    q = db.query(InboxItem.status, func.count(InboxItem.id).label("c"))
    if witel: q = q.filter(InboxItem.witel == witel)
    results = q.group_by(InboxItem.status).all()
    stats = {r.status: r.c for r in results}
    return {"total": sum(stats.values()), "by_status": stats, "pending": stats.get("pending", 0),
            "in_progress": stats.get("in_progress", 0), "completed": stats.get("completed", 0), "rejected": stats.get("rejected", 0)}

@app.get("/inbox/{inbox_id}")
async def get_inbox(inbox_id: int, db: Session = Depends(get_db), user=Depends(get_current_user_info)):
    item = db.query(InboxItem).filter(InboxItem.id == inbox_id).first()
    if not item: raise HTTPException(status_code=404, detail="Not found")
    return item

@app.put("/inbox/{inbox_id}")
async def update_inbox(inbox_id: int, data: InboxUpdate, db: Session = Depends(get_db), user=Depends(get_current_user_info)):
    item = db.query(InboxItem).filter(InboxItem.id == inbox_id).first()
    if not item: raise HTTPException(status_code=404, detail="Not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(item, k, v)
    db.commit(); db.refresh(item)
    return item

@app.delete("/inbox/{inbox_id}", status_code=204)
async def delete_inbox(inbox_id: int, db: Session = Depends(get_db), user=Depends(get_current_user_info)):
    item = db.query(InboxItem).filter(InboxItem.id == inbox_id).first()
    if not item: raise HTTPException(status_code=404, detail="Not found")
    db.delete(item); db.commit()
