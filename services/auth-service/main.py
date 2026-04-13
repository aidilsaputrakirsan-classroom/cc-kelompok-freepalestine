"""
Auth Service — Microservice untuk autentikasi (Week 12)
Port: 8001
Database: auth_db
"""
import os
import json
import uuid
import time
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, status, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.sql import func
from pydantic import BaseModel, Field, EmailStr
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer

load_dotenv()

# ==================== CONFIG ====================
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres123@localhost:5432/auth_db")
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key-for-development-min-32")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
SERVICE_NAME = "auth-service"

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

# ==================== DATABASE ====================
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="viewer")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==================== SCHEMAS ====================
class UserCreate(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=8)

class UserResponse(BaseModel):
    id: int; email: str; name: str; role: str; is_active: bool; created_at: datetime
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str; token_type: str = "bearer"; user: UserResponse

class VerifyResponse(BaseModel):
    valid: bool; user_id: Optional[int] = None; email: Optional[str] = None; role: Optional[str] = None

# ==================== AUTH UTILS ====================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token tidak valid")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expired atau tidak valid")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User tidak ditemukan")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Akun tidak aktif")
    return user

# ==================== METRICS (Week 14) ====================
metrics = {"requests_total": 0, "requests_by_status": {}, "request_latency_sum": 0, "errors_total": 0}

# ==================== APP ====================
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    logger.info("Auth Service started")
    yield
    logger.info("Auth Service stopped")

app = FastAPI(title="Auth Service", version="2.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=[o.strip() for o in ALLOWED_ORIGINS], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# ==================== MIDDLEWARE (Week 14: Correlation ID) ====================
@app.middleware("http")
async def add_correlation_id(request: Request, call_next):
    correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
    start = time.time()
    response = await call_next(request)
    latency = time.time() - start
    response.headers["X-Correlation-ID"] = correlation_id
    # Metrics
    metrics["requests_total"] += 1
    status_key = str(response.status_code)
    metrics["requests_by_status"][status_key] = metrics["requests_by_status"].get(status_key, 0) + 1
    metrics["request_latency_sum"] += latency
    if response.status_code >= 400:
        metrics["errors_total"] += 1
    logger.info(f"{request.method} {request.url.path} -> {response.status_code} ({latency:.3f}s)", extra={"correlation_id": correlation_id})
    return response

# ==================== ENDPOINTS ====================
@app.get("/health")
def health():
    return {"status": "healthy", "service": SERVICE_NAME, "version": "2.0.0"}

@app.get("/metrics")
def get_metrics():
    avg_latency = metrics["request_latency_sum"] / max(metrics["requests_total"], 1)
    return {**metrics, "avg_latency_seconds": round(avg_latency, 4)}

@app.post("/auth/register", response_model=UserResponse, status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")
    user = User(email=user_data.email, name=user_data.name, hashed_password=hash_password(user_data.password))
    db.add(user); db.commit(); db.refresh(user)
    logger.info(f"User registered: {user.email}")
    return user

@app.post("/auth/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email atau password salah")
    token = create_access_token(data={"sub": str(user.id)})
    logger.info(f"User logged in: {user.email}")
    return {"access_token": token, "token_type": "bearer", "user": user}

@app.get("/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/auth/verify", response_model=VerifyResponse)
def verify_token(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Endpoint untuk inter-service communication — Dashboard Service memanggil ini untuk validasi token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == int(user_id)).first()
        if user:
            return {"valid": True, "user_id": user.id, "email": user.email, "role": user.role}
    except JWTError:
        pass
    return {"valid": False}
