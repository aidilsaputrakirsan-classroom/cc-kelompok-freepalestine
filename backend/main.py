import os
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, get_db
from models import Base, SalesData, InboxItem
from schemas import (
    SalesCreate, SalesUpdate, SalesResponse, SalesListResponse,
    InboxCreate, InboxUpdate, InboxResponse, InboxListResponse,
)
import crud

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Dashboard Telkom API",
    description="REST API Dashboard Monitoring Revenue - Telkom Regional 4 Kalimantan",
    version="0.2.0",
)

# CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
origins_list = [origin.strip() for origin in allowed_origins.split(",")]
app.add_middleware(CORSMiddleware, allow_origins=origins_list, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


# ==================== HEALTH ====================
@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "0.2.0", "service": "dashboard-telkom-api"}


# ==================== SALES / REVENUE CRUD ====================
@app.post("/sales", response_model=SalesResponse, status_code=201)
def create_sales(data: SalesCreate, db: Session = Depends(get_db)):
    return crud.create_sales(db=db, data=data)

@app.get("/sales", response_model=SalesListResponse)
def list_sales(skip: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100),
               witel: str = Query(None), product: str = Query(None),
               year: int = Query(None), month: int = Query(None),
               search: str = Query(None),
               db: Session = Depends(get_db)):
    return crud.get_sales_list(db=db, skip=skip, limit=limit, witel=witel,
                               product=product, year=year, month=month, search=search)

@app.get("/sales/summary")
def sales_summary(year: int = Query(None), witel: str = Query(None),
                   db: Session = Depends(get_db)):
    return crud.get_sales_summary(db=db, year=year, witel=witel)

@app.get("/sales/monthly")
def sales_monthly(year: int = Query(None), witel: str = Query(None),
                   db: Session = Depends(get_db)):
    return crud.get_monthly_revenue(db=db, year=year, witel=witel)

@app.get("/sales/{sales_id}", response_model=SalesResponse)
def get_sales(sales_id: int, db: Session = Depends(get_db)):
    item = crud.get_sales(db=db, sales_id=sales_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return item

@app.put("/sales/{sales_id}", response_model=SalesResponse)
def update_sales(sales_id: int, data: SalesUpdate, db: Session = Depends(get_db)):
    updated = crud.update_sales(db=db, sales_id=sales_id, data=data)
    if not updated:
        raise HTTPException(status_code=404, detail="Not found")
    return updated

@app.delete("/sales/{sales_id}", status_code=204)
def delete_sales(sales_id: int, db: Session = Depends(get_db)):
    if not crud.delete_sales(db=db, sales_id=sales_id):
        raise HTTPException(status_code=404, detail="Not found")


# ==================== INBOX CRUD ====================
@app.post("/inbox", response_model=InboxResponse, status_code=201)
def create_inbox(data: InboxCreate, db: Session = Depends(get_db)):
    return crud.create_inbox(db=db, data=data)

@app.get("/inbox", response_model=InboxListResponse)
def list_inbox(skip: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100),
               status: str = Query(None), priority: str = Query(None),
               witel: str = Query(None), search: str = Query(None),
               db: Session = Depends(get_db)):
    return crud.get_inbox_list(db=db, skip=skip, limit=limit, status=status,
                               priority=priority, witel=witel, search=search)

@app.get("/inbox/stats")
def inbox_stats(witel: str = Query(None), db: Session = Depends(get_db)):
    return crud.get_inbox_stats(db=db, witel=witel)

@app.get("/inbox/{inbox_id}", response_model=InboxResponse)
def get_inbox(inbox_id: int, db: Session = Depends(get_db)):
    item = crud.get_inbox(db=db, inbox_id=inbox_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return item

@app.put("/inbox/{inbox_id}", response_model=InboxResponse)
def update_inbox(inbox_id: int, data: InboxUpdate, db: Session = Depends(get_db)):
    updated = crud.update_inbox(db=db, inbox_id=inbox_id, data=data)
    if not updated:
        raise HTTPException(status_code=404, detail="Not found")
    return updated

@app.delete("/inbox/{inbox_id}", status_code=204)
def delete_inbox(inbox_id: int, db: Session = Depends(get_db)):
    if not crud.delete_inbox(db=db, inbox_id=inbox_id):
        raise HTTPException(status_code=404, detail="Not found")


# ==================== TEAM ====================
@app.get("/team")
def team_info():
    return {
        "team": "cloud-team-freepalestine",
        "project": "Dashboard Revenue Telkom Regional 4 Kalimantan",
        "members": [
            {"name": "Ariel Itsbat Nurhaq", "nim": "10231018", "role": "Lead Backend"},
            {"name": "Raditya Yudianto", "nim": "10231076", "role": "Lead QA & Docs"},
            {"name": "Muhammad Khoiruddin Marzuq", "nim": "10231065", "role": "Lead DevOps"},
        ],
    }
