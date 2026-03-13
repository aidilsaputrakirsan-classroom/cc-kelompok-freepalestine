#!/bin/bash
# ============================================
# Setup Script — Cloud App (Modul 2)
# Tim: cloud-team-freepalestine
# ============================================

echo "🚀 Setting up Cloud App..."

# 1. Masuk ke folder backend
cd backend || { echo "❌ Folder 'backend/' tidak ditemukan!"; exit 1; }

# 2. Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# 3. Cek file .env
if [ ! -f .env ]; then
    echo "⚠️  File .env tidak ditemukan!"
    echo "📝 Membuat .env dari .env.example..."
    cp .env.example .env
    echo "✏️  Silakan edit backend/.env dan ganti 'yourpassword' dengan password PostgreSQL Anda."
else
    echo "✅ File .env sudah ada."
fi

# 4. Kembali ke root dan setup frontend
cd ..
cd frontend || { echo "⚠️  Folder 'frontend/' tidak ditemukan, skip frontend setup."; exit 0; }

# 5. Cek file .env frontend
if [ ! -f .env ]; then
    echo "⚠️  File frontend/.env tidak ditemukan!"
    echo "📝 Membuat .env dari .env.example..."
    cp .env.example .env
    echo "✅ frontend/.env dibuat. Sesuaikan VITE_API_URL jika backend di URL lain."
else
    echo "✅ File frontend/.env sudah ada."
fi

echo "📦 Installing Node.js dependencies..."
npm install

echo ""
echo "✅ Setup selesai!"
echo ""
echo "Cara menjalankan:"
echo "  Backend:  cd backend && uvicorn main:app --reload --port 8000"
echo "  Frontend: cd frontend && npm run dev"
