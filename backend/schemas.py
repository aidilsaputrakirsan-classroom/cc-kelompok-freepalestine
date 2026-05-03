from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime


# ============================================================
# AUTH SCHEMAS
# ============================================================

class UserCreate(BaseModel):
    email: EmailStr = Field(..., examples=["user@student.itk.ac.id"])
    name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=8)

class UserResponse(BaseModel):
    id: int; email: str; name: str; role: str; is_active: bool; created_at: datetime
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr; password: str

class TokenResponse(BaseModel):
    access_token: str; token_type: str = "bearer"; user: UserResponse

class ChangePasswordRequest(BaseModel):
    old_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8)

class UserAdminCreate(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=8)
    role: str = Field("viewer", pattern="^(admin|viewer)$")

class UserAdminUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    role: Optional[str] = Field(None, pattern="^(admin|viewer)$")
    is_active: Optional[bool] = None


# ============================================================
# SALES DATA SCHEMAS
# ============================================================

class SalesBase(BaseModel):
    witel: str = Field(..., min_length=1, max_length=50)
    telda: Optional[str] = Field(None, max_length=100)
    channel: str = Field(..., min_length=1, max_length=50)
    product: str = Field("HSI", max_length=50)
    revenue_target: float = Field(..., ge=0)
    revenue_actual: float = Field(..., ge=0)
    sales_target: int = Field(..., ge=0)
    sales_actual: int = Field(..., ge=0)
    period_month: int = Field(..., ge=1, le=12)
    period_year: int = Field(..., ge=2020, le=2030)
    flag: Optional[str] = None
    flag_2: Optional[str] = None
    flag_3: Optional[str] = None
    nama_pelanggan: Optional[str] = None
    layanan: Optional[str] = None
    nama_am: Optional[str] = None

class SalesCreate(SalesBase):
    pass

class SalesUpdate(BaseModel):
    witel: Optional[str] = Field(None, min_length=1, max_length=50)
    telda: Optional[str] = None
    channel: Optional[str] = None
    product: Optional[str] = None
    revenue_target: Optional[float] = Field(None, ge=0)
    revenue_actual: Optional[float] = Field(None, ge=0)
    sales_target: Optional[int] = Field(None, ge=0)
    sales_actual: Optional[int] = Field(None, ge=0)
    period_month: Optional[int] = Field(None, ge=1, le=12)
    period_year: Optional[int] = Field(None, ge=2020, le=2030)
    flag: Optional[str] = None
    flag_2: Optional[str] = None
    flag_3: Optional[str] = None
    nama_pelanggan: Optional[str] = None
    layanan: Optional[str] = None
    nama_am: Optional[str] = None

class SalesResponse(SalesBase):
    id: int
    datasource_id: Optional[int] = None
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class SalesListResponse(BaseModel):
    total: int; items: List[SalesResponse]


# ============================================================
# INBOX SCHEMAS
# ============================================================

class InboxBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    status: str = Field("pending")
    priority: str = Field("medium")
    witel: str = Field(..., min_length=1, max_length=50)
    category: Optional[str] = None
    assigned_to: Optional[str] = None

class InboxCreate(InboxBase):
    pass

class InboxUpdate(BaseModel):
    title: Optional[str] = None; description: Optional[str] = None
    status: Optional[str] = None; priority: Optional[str] = None
    witel: Optional[str] = None; category: Optional[str] = None
    assigned_to: Optional[str] = None

class InboxResponse(InboxBase):
    id: int
    datasource_id: Optional[int] = None
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class InboxListResponse(BaseModel):
    total: int; items: List[InboxResponse]


# ============================================================
# DATA SOURCE SCHEMAS
# ============================================================

class DataSourceResponse(BaseModel):
    id: int; name: str; file_type: str; row_count: int
    target_table: str; is_active: bool
    uploaded_by: Optional[int] = None; created_at: datetime
    class Config:
        from_attributes = True

class DataSourceListResponse(BaseModel):
    total: int; items: List[DataSourceResponse]


# ============================================================
# TELDA SCHEMAS
# ============================================================

class TeldaResponse(BaseModel):
    id: int; name: str; witel: str; branch_type: str
    class Config:
        from_attributes = True


# ============================================================
# NOTIFICATION SCHEMAS
# ============================================================

class NotificationItem(BaseModel):
    id: str  # generated
    type: str  # anomaly, warning, info
    title: str
    message: str
    severity: str  # low, medium, high, critical
    datasource_ids: Optional[List[int]] = None
    created_at: Optional[str] = None
