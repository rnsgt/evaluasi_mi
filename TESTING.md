# Testing Login & Registration - Aplikasi Evaluasi MI

## Mock User Credentials (Development Mode)

> **Note:** Ini adalah mock data untuk testing. Setelah backend ready, ganti dengan API endpoint yang sebenarnya di `src/services/authService.js`

### 🆕 Registrasi Mahasiswa Baru

Klik **"Daftar disini"** di halaman login untuk membuat akun baru.

**Form yang harus diisi:**
- NIM (minimal 6 digit, numeric)
- Nama Lengkap (minimal 3 karakter)
- Email (format email valid)
- Program Studi (contoh: Manajemen Informatika)
- Angkatan (4 digit tahun, contoh: 2023)
- Password (minimal 6 karakter)
- Konfirmasi Password (harus sama dengan password)

**Setelah registrasi berhasil:**
- Akun otomatis disimpan di MOCK_USERS
- Redirect ke halaman Login
- Login dengan NIM dan password yang baru dibuat

---

### 🎓 Login sebagai Mahasiswa

```
NIM: 2301010001
Password: 123456
```

**Data Mahasiswa:**
- Nama: Ahmad Rizki
- Prodi: Manajemen Informatika
- Angkatan: 2023
- Semester: 3
- IPK: 3.75
- Status: Aktif

**Halaman yang ditampilkan setelah login:**
- Home (Beranda) - Dashboard mahasiswa dengan IPK, evaluasi
- Riwayat - History evaluasi yang sudah dilakukan
- Statistik - Statistik evaluasi (placeholder)
- Profil - Profile mahasiswa

---

### 👨‍💼 Login sebagai Admin

```
NIM: admin
Password: admin123
```

**Data Admin:**
- Nama: Administrator
- Role: Admin

**Halaman yang ditampilkan setelah login:**
- Beranda - Dashboard admin dengan statistik
- Laporan - Laporan evaluasi (placeholder)
- Periode - Manajemen periode evaluasi (placeholder)
- Pengaturan - Settings aplikasi (placeholder)

---

## Cara Testing

1. **Registrasi (Opsional):** Klik "Daftar disini" dan isi form registrasi
2. **Login:** Input credentials di halaman login
3. **Klik tombol "MASUK"**
4. Aplikasi akan redirect ke halaman utama sesuai role:
   - Mahasiswa → Student Navigator (4 bottom tabs)
   - Admin → Admin Navigator (4 bottom tabs)
5. **Ganti Mode Tampilan:** Buka menu Profil → Pilih Mode Terang atau Mode Gelap
6. **Logout:** Buka menu Profil/Pengaturan → Klik "Keluar Akun"

---

## Status Implementasi

### ✅ Completed
- [x] Login screen UI with link to registration
- [x] Registration screen with validation
- [x] Mock authentication service (login & register)
- [x] Role-based navigation (mahasiswa/admin)
- [x] Student screens (Home without NIM/Status/IPK, Riwayat, Statistik, Profil)
- [x] Admin screens (Dashboard, Laporan, Periode, Settings)
- [x] Logout functionality (fixed - no API call error)
- [x] Token & user storage (AsyncStorage)
- [x] Light/Dark mode selector in profile
- [x] Profile data from registration

### 🚧 Todo
- [ ] Form Evaluasi Dosen
- [ ] Form Evaluasi Fasilitas
- [ ] Pilih Dosen screen
- [ ] Pilih Fasilitas screen
- [ ] Backend API integration
- [ ] Change password functionality
- [ ] Admin CRUD features
- [ ] Real data from API

---

## Debug Mode

Jika ingin menambah user baru untuk testing, edit file:
```
src/services/authService.js
```

Tambahkan objek baru di `MOCK_USERS`:
```javascript
'NIM_BARU': {
  password: 'password123',
  user: {
    id: 3,
    nim: 'NIM_BARU',
    nama: 'Nama User',
    email: 'user@email.com',
    // ... data lainnya
    role: 'mahasiswa', // atau 'admin'
  },
},
```

---

**Version:** 1.0.0  
**Last Updated:** 14 Februari 2026
