# Testing Login - Aplikasi Evaluasi MI

## Mock User Credentials (Development Mode)

> **Note:** Ini adalah mock data untuk testing. Setelah backend ready, ganti dengan API endpoint yang sebenarnya di `src/services/authService.js`

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

1. **Buka aplikasi** di Expo Go atau Android device
2. **Input credentials** di halaman login
3. **Klik tombol "MASUK"**
4. Aplikasi akan redirect ke halaman utama sesuai role:
   - Mahasiswa → Student Navigator (4 bottom tabs)
   - Admin → Admin Navigator (4 bottom tabs)
5. **Logout:** Buka menu Profil/Pengaturan → Klik "Keluar Akun"

---

## Status Implementasi

### ✅ Completed
- [x] Login screen UI
- [x] Mock authentication service
- [x] Role-based navigation (mahasiswa/admin)
- [x] Student screens (Home, Riwayat, Statistik, Profil)
- [x] Admin screens (Dashboard, Laporan, Periode, Settings)
- [x] Logout functionality
- [x] Token & user storage (AsyncStorage)

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
