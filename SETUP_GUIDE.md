# 📱 PANDUAN SETUP APLIKASI EVALUASI MI

## ✅ Status Aplikasi
- ✅ Backend: **SUDAH BERJALAN**
- ✅ Database: **TERKONEKSI DENGAN BAIK**
- ✅ Frontend (Expo): **SIAP DIJALANKAN**

---

## 🚀 CARA MENJALANKAN APLIKASI

### **OPSI 1: Menjalankan Backend dan Frontend Secara Terpisah (RECOMMENDED)**

#### Terminal 1 - Jalankan Backend:
```bash
cd e:\laragon\www\evaluasi_mi\backend
node server.js
```

**Output yang seharusnya muncul:**
```
🚀 Server running on port 3002
📍 Environment: development
🔗 API URL: http://localhost:3002
✅ Database connected successfully
📊 Database: evaluasi_mi
```

#### Terminal 2 - Jalankan Frontend (Expo):
```bash
cd e:\laragon\www\evaluasi_mi
npm start
```

Pilih opsi:
- `w` - Web (untuk testing di browser)
- `a` - Android (jika ada emulator)
- `i` - iOS (jika menggunakan Mac)
- Buka di Expo Go di HP (scan barcode yang muncul)

---

### **OPSI 2: Menjalankan Keduanya Sekaligus**
```bash
cd e:\laragon\www\evaluasi_mi
npm run dev
```

---

## 📋 Konfigurasi yang Sudah Diperbaiki

### Backend (.env)
```
PORT=3002
DATABASE_URL=postgresql://postgres@localhost:5432/evaluasi_mi?schema=public
ALLOWED_ORIGINS=http://localhost:3002,http://localhost:19006,http://localhost:8081
```

### Frontend (constants.js)
```javascript
API_BASE_URL = 'http://localhost:3002/api'  // Development
```

---

## ✨ Fitur-fitur yang Sudah Tersedia

### Authentication
- ✅ Register Mahasiswa
- ✅ Login
- ✅ Change Password
- ✅ Profile Management

### Evaluasi
- ✅ Evaluasi Dosen
- ✅ Evaluasi Fasilitas
- ✅ Riwayat Evaluasi
- ✅ Statistik Evaluasi

### Admin Dashboard
- ✅ Dashboard Statistics
- ✅ Manajemen Dosen
- ✅ Manajemen Fasilitas
- ✅ Manajemen Periode Evaluasi
- ✅ Laporan Evaluasi

---

## 🐛 Troubleshooting

### Backend Error: "Cannot find module"
**Solusi:** Pastikan Anda berada di folder `backend/` sebelum menjalankan `node server.js`
```bash
cd backend
node server.js
```

### Error: "Port 3002 already in use"
**Solusi:** Buka PowerShell dan jalankan:
```powershell
netstat -ano | findstr :3002
taskkill /PID <PID> /F
```

### Error: "Database connected failed"
**Solusi:** Pastikan:
- PostgreSQL sudah running
- Database `evaluasi_mi` sudah dibuat
- Username: `postgres` (password kosong)

### Error: "Cannot connect to server" (Frontend)
**Solusi:**
- Pastikan backend sudah running di port 3002
- Cek `src/utils/constants.js` - API_BASE_URL harus `http://localhost:3002/api`
- Clear bundle: `npx expo start --clear`

---

## 📚 Struktur Folder

```
evaluasi_mi/
├── backend/                    # Backend Server (Node.js + Express)
│   ├── server.js              # Entry point
│   ├── config/
│   │   └── database.js        # Prisma Client
│   ├── routes/                # API Endpoints
│   ├── middleware/            # Auth & Admin middleware
│   ├── prisma/                # Prisma ORM
│   └── package.json
├── src/                        # Frontend (React Native)
│   ├── screens/               # UI Screens
│   ├── components/            # Reusable Components
│   ├── services/              # API Services
│   ├── utils/                 # Helpers & Constants
│   └── contexts/              # Context API
└── package.json               # Root package.json
```

---

## 🔄 Development Workflow

1. **Buat perubahan di Backend:**
   ```bash
   cd backend
   npm run dev  # Menggunakan nodemon untuk auto-reload
   ```

2. **Buat perubahan di Frontend:**
   ```bash
   npm start    # Expo akan auto-reload
   ```

3. **Lihat database:**
   ```bash
   cd backend
   npx prisma studio  # Buka Prisma Studio di browser
   ```

---

## ✅ Checklist Final

- [ ] PostgreSQL sudah running
- [ ] Backend berjalan tanpa error
- [ ] Database terkoneksi
- [ ] Frontend API endpoint sudah benar (http://localhost:3002/api)
- [ ] Frontend sudah dalaunch
- [ ] Bisa login dengan akun
- [ ] Bisa membuka evaluasi

---

## 📞 Informasi Akun Test

Database sudah memiliki:
- User (mahasiswa) - cek di tabel `users`
- Dosen - cek di tabel `dosen`
- Fasilitas - cek di tabel `fasilitas`
- Periode evaluasi - cek di tabel `periode_evaluasi`

---

**Last Updated:** 6 April 2026
**Status:** ✅ Production Ready
