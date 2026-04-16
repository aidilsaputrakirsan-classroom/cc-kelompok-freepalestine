import os
from dotenv import load_dotenv
load_dotenv()

from database import engine, Base
import models

# Hapus semua tabel yang lama
Base.metadata.drop_all(bind=engine)
print("Berhasil menghapus tabel-tabel versi lama!")
