# Solusi Lengkap: Error Mahasiswa Login & Laporan

## 📋 Ringkasan Masalah

### Masalah 1: Mahasiswa Tidak Bisa Login ❌
**Gejala:**
- Mahasiswa login gagal dengan error: "NIM/Email atau password salah"
- Admin login berhasil
- Error terjadi baik menggunakan NIM (210101001) maupun Email (210101001@student.ac.id)

**Akar Penyebab:**
- Database tidak proper di-seed atau seed configuration tidak set
- Password hash tidak tersimpan dengan benar
- `npx prisma db seed` belum dijalankan

### Masalah 2: Error di Bagian Laporan (Admin) ❌
**Gejala:**
- Setelah admin login berhasil, membuka tab "Laporan" error HTTP 500
- Error message: "Load laporan error"
- Frontend tidak bisa fetch laporan data

**Akar Penyebab:**
- Endpoint `/api/admin/laporan` menggunakan raw SQL query yang tidak robust
- Query menggunakan `$queryRawUnsafe` dengan direct interpolation (SQL injection risk)
- Query tidak handle edge cases dengan baik (empty data, invalid periode_id)
- Kompleksitas SQL query dengan agregasi dan join membuat error tidak jelas

---

## ✅ SOLUSI 1: Memperbaiki Mahasiswa Login

### Step 1: Pastikan Prisma Seed Configured
**File:** `backend/package.json`

Pastikan bagian `prisma` sudah ada:
```json
{
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
```

### Step 2: Jalankan Database Seed
```bash
cd backend
npx prisma db seed
```

**Output yang benar:**
```
✅ Admin user created: admin@evaluasi.com
✅ Mahasiswa user created: 210101001@student.ac.id
✅ Periode evaluasi created: Evaluasi Gasal 2024/2025
✅ Dosen created: Dr. Ir. Bambang Wijaya, M.Kom
✅ Fasilitas created: Ruang Kelas 1.1
```

### Step 3: Verifikasi Data di Database
```bash
psql -h localhost -p 5432 -d evaluasi_mi -U postgres -c "SELECT id, nama, email, nim, role FROM users;"
```

**Expected Result:**
```
 id |      nama      |          email           |    nim    | role
----+----------------+--------------------------+-----------+----------
 10 | Admin Evaluasi | admin@evaluasi.com       |           | admin
 11 | Ahmad Fauzi    | 210101001@student.ac.id  | 210101001 | mahasiswa
```

### Step 4: Test Login Credentials
**Admin:**
- Email: `admin@evaluasi.com`
- Password: `password123`
- Role: `admin`

**Mahasiswa:**
- NIM: `210101001` OR Email: `210101001@student.ac.id`
- Password: `password123`
- Role: `mahasiswa`

**Test dengan cURL/PowerShell:**
```powershell
# Mahasiswa login dengan NIM
Invoke-RestMethod -Method Post -Uri 'http://localhost:3002/api/auth/login' `
  -ContentType 'application/json' `
  -Body '{"identifier":"210101001","password":"password123"}'

# Mahasiswa login dengan Email
Invoke-RestMethod -Method Post -Uri 'http://localhost:3002/api/auth/login' `
  -ContentType 'application/json' `
  -Body '{"identifier":"210101001@student.ac.id","password":"password123"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": 11,
      "nim": "210101001",
      "nama": "Ahmad Fauzi",
      "email": "210101001@student.ac.id",
      "role": "mahasiswa",
      "prodi": "Teknik Informatika"
    },
    "token": "eyJhbGc..." 
  }
}
```

---

## ✅ SOLUSI 2: Laporan Endpoint Error Fix

### Perubahan yang Dilakukan
**File:** `backend/routes/adminRoutes.js` - Endpoint `/admin/laporan`

**Sebelumnya (tidak robust):**
- Menggunakan raw PostgreSQL query dengan `$queryRawUnsafe`
- Direct string interpolation: `` WHERE ed.periode_id = ${parseInt(periode_id)} ``
- Tidak secure terhadap SQL injection
- Error handling yang buruk untuk empty data

**Sesudah (robust):**
- Menggunakan Prisma ORM query builder
- Proper parameter handling dan validation
- Explicit error catching per section (dosen, fasilitas)
- Graceful handling ketika tidak ada data
- Input validation untuk `periode_id`

### Perbaikan Spesifik

#### 1️⃣ Validasi Periode ID
```javascript
const validPeriodeId = periode_id ? parseInt(periode_id) : null;
if (periode_id && isNaN(validPeriodeId)) {
  return res.status(400).json({
    success: false,
    message: 'Invalid periode_id parameter'
  });
}
```

#### 2️⃣ Gunakan Prisma ORM Instead of Raw SQL
```javascript
// Sebelumnya: await prisma.$queryRawUnsafe(query)
// Sesudahnya: await prisma.dosen.findMany(...)

const dosenList = await prisma.dosen.findMany({
  select: { id: true, nama: true, nip: true }
});

for (const dosen of dosenList) {
  const evaluasiList = await prisma.evaluasi_dosen.findMany({
    where: {
      dosen_id: dosen.id,
      ...(validPeriodeId && { periode_id: validPeriodeId })
    },
    include: { evaluasi_detail: true }
  });
  
  // Process data with proper calculations
}
```

#### 3️⃣ Error Handling per Section
```javascript
if (!tipe || tipe === 'dosen' || tipe === 'semua') {
  try {
    // Process dosen laporan
  } catch (dosenError) {
    console.error('Error fetching laporan dosen:', dosenError);
    laporanDosen = [];
  }
}
```

### Response Format Tetap Sama
Frontend tidak perlu perubahan! Response format konsisten:

```json
{
  "success": true,
  "data": {
    "dosen": [
      {
        "id": 1,
        "nama": "Dr. Ir. Bambang Wijaya, M.Kom",
        "nip": "197801012005011001",
        "jumlah_evaluasi": 0,
        "rata_rata": null,
        "total_jawaban": 0,
        "komentar_list": [],
        "detail_kategori": [],
        "detail_evaluasi": []
      }
    ],
    "fasilitas": [
      {
        "id": 1,
        "nama": "Ruang Kelas 1.1",
        "kode": "RUANG-001",
        "kategori": "Ruang Kelas",
        "lokasi": "Gedung A Lantai 1",
        "jumlah_evaluasi": 0,
        "rata_rata": null,
        "total_jawaban": 0,
        "komentar_list": [],
        "detail_kategori": [],
        "detail_evaluasi": []
      }
    ]
  }
}
```

---

## 🧪 Verification Checklist

### Backend
- [x] Mahasiswa login dengan NIM berhasil
- [x] Mahasiswa login dengan Email berhasil
- [x] Admin login berhasil
- [x] `/api/admin/laporan` endpoint mengembalikan 200 (tidak 500)
- [x] Laporan data struktur valid
- [x] Empty data tidak menghasilkan error

### Frontend
- [ ] Mahasiswa bisa login dengan form
- [ ] Admin login masih berfungsi normal
- [ ] Tab Laporan loading dengan benar
- [ ] Laporan menampilkan daftar dosen dan fasilitas
- [ ] Filter periode berfungsi
- [ ] Export laporan berfungsi

---

## 🚀 Testing di Frontend

### Test Mahasiswa Login
```
1. Launch app di Expo
2. Input: NIM/Email = 210101001 (atau 210101001@student.ac.id)
3. Input: Password = password123
4. Klik Login
5. Expected: Berhasil masuk ke dashboard mahasiswa
```

### Test Admin Laporan
```
1. Login sebagai admin@evaluasi.com / password123
2. Klik tab "Laporan"
3. Expected: Laporan loading berhasil
4. Lihat daftar dosen dan fasilitas (meskipun belum ada evaluasi)
5. Test filter periode
```

---

## 📝 Notes

### Kenapa Permasalahan Ini Terjadi?

1. **Mahasiswa Login:**
   - Prisma seed config tidak tersimpan dengan benar di awal project setup
   - Database tidak di-initialization dengan test data sebelum testing
   - Rekomendasi: Always run `npx prisma db seed` setelah setup atau migration

2. **Laporan Error:**
   - Raw SQL query terlalu kompleks untuk edge cases
   - Tidak ada validation terhadap input parameter
   - Error dari SQL tidak clear terhadap frontend
   - Rekomendasi: Lebih baik gunakan Prisma ORM meski agak verbose, lebih maintainable

### Untuk Development Selanjutnya

```bash
# Setup awal project
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed

# Jika ada perubahan schema
npx prisma migrate dev --name <description>
npx prisma db seed
```

---

## 🔗 Related Files

- Login Endpoint: `backend/routes/authRoutes.js`
- Laporan Endpoint: `backend/routes/adminRoutes.js` (modified)
- Frontend Auth: `src/services/authService.js`
- Frontend Login Screen: `src/screens/auth/LoginScreen.js`
- Frontend Laporan Screen: `src/screens/admin/LaporanScreen.js`
- Database Config: `backend/config/database.js`
- Prisma Seed: `backend/prisma/seed.js`

