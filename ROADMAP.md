# Roadmap Pengembangan Aplikasi Evaluasi Akademik MI

**Target Penyelesaian:** Akhir Maret 2026  
**Waktu Tersedia:** ~6 minggu (2-4 jam/hari)  
**Status Saat Ini:** Fase 8 - Admin Laporan & Periode Complete ✅

---

## 📊 Status Keseluruhan: 80% Selesai

### ✅ Yang Sudah Selesai (80%)

#### Fase 1: Project Setup & Infrastructure (100%)
- [x] Inisialisasi project Expo + React Native
- [x] Install dependencies (React Navigation, AsyncStorage, Axios, Vector Icons)
- [x] Struktur folder project
- [x] Theme system (colors, typography, spacing)
- [x] Helper utilities (validation, formatting)
- [x] Constants & configuration

#### Fase 2: Authentication & Navigation (100%)
- [x] Login screen dengan validasi
- [x] Registration screen dengan form lengkap
- [x] Mock authentication service
- [x] AuthContext dengan state management
- [x] Token & user persistence (AsyncStorage)
- [x] Role-based navigation (Mahasiswa/Admin)
- [x] Auth Navigator dengan Login & Register
- [x] Student Navigator (4 bottom tabs)
- [x] Admin Navigator (4 bottom tabs)
- [x] Logout functionality

#### Fase 3: Student Screens - Basic UI (100%)
- [x] Home Screen - Dashboard mahasiswa (tanpa NIM/Status/IPK)
- [x] Riwayat Screen - Timeline placeholder
- [x] Statistik Screen - Placeholder
- [x] Profile Screen - Info akademik + theme selector (Light/Dark)

#### Fase 4: Admin Screens - Basic UI (100%)
- [x] Admin Dashboard - Stats cards placeholder
- [x] Laporan Screen - Placeholder
- [x] Periode Screen - Placeholder
- [x] Settings Screen - Logout button

#### Fase 5: Evaluasi Dosen (100%) ✅
- [x] dosenService.js - Mock data dengan 10 dosen sample
- [x] PilihDosenScreen - Search & filter by mata kuliah
- [x] LikertScale Component - Reusable 5-point scale dengan icons & colors
- [x] pertanyaanDosen.js - 16 pertanyaan dalam 5 kategori
- [x] FormEvaluasiDosenScreen - Form evaluasi lengkap dengan validasi
- [x] evaluasiService.js - AsyncStorage mock API dengan duplicate prevention
- [x] Navigation updates & HomeScreen connection

#### Fase 6: Evaluasi Fasilitas (100%) ✅
- [x] fasilitasService.js - Mock data dengan 12 fasilitas
- [x] PilihFasilitasScreen - Search & filter by kategori
- [x] pertanyaanFasilitas.js - 12 pertanyaan dalam 4 kategori
- [x] FormEvaluasiFasilitasScreen - Form evaluasi fasilitas
- [x] RiwayatScreen - Real implementation dengan AsyncStorage integration
- [x] Navigation updates & HomeScreen connection

#### Fase 7: Statistik & Data Visualization (100%) ✅
- [x] statsService.js - Helper untuk kalkulasi statistik dari mock data
- [x] StatistikScreen - Student view dengan real data dari evaluasiService
- [x] Achievement badges berdasarkan jumlah evaluasi
- [x] Progress bars untuk Dosen & Fasilitas
- [x] Simple bar chart untuk visual representation
- [x] AdminDashboardScreen - Real stats implementation
- [x] Total evaluasi (hari ini, minggu ini, bulan ini)
- [x] Tingkat partisipasi mahasiswa dengan persentase
- [x] Top 5 dosen dengan rating tertinggi
- [x] Fasilitas yang perlu perbaikan (rating < 3.5)

#### Fase 8: Admin Laporan & Periode (100%) ✅
- [x] periodeService.js - CRUD operations untuk periode management
- [x] LaporanScreen - Report viewing dengan filter (periode, tipe, statistik)
- [x] PeriodeScreen - List periode dengan activate/deactivate/edit/delete
- [x] FormPeriodeScreen - Create/Edit periode dengan validation
- [x] AdminNavigator - Stack + Tab navigation integration
- [x] Mock data periode dengan business rules (only 1 active periode)

---

## 🚀 Rencana Pengerjaan (20% Remaining)

---

### **FASE 6: Evaluasi Fasilitas** (Minggu 2-3) - ✅ SELESAI
**Estimasi: 10-14 jam kerja**

#### Week 2-3: Form & Selection
- [x] **Pilih Fasilitas Screen** (3 jam)
  - List fasilitas kampus (Lab, Ruang Kelas)
  - Kategori fasilitas
  - Icon/gambar untuk setiap fasilitas
  - Mock data: 12 fasilitas (Lab, Ruang Kelas, Perpustakaan, Aula, Fasilitas Umum)
  - Navigate ke Form Evaluasi setelah pilih

- [x] **Form Evaluasi Fasilitas Screen** (5 jam)
  - Header dengan info fasilitas
  - List 12 pernyataan evaluasi fasilitas
  - Reuse LikertScale component
  - Kategori: Kebersihan (3), Kelengkapan (3), Kenyamanan (4), Aksesibilitas (2)
  - Kolom komentar/saran (optional)
  - Validasi & Submit

- [x] **Riwayat Screen - Implementation** (3 jam)
  - Tampilkan history evaluasi (Dosen + Fasilitas)
  - Filter by type (Dosen/Fasilitas/Semua)
  - Filter by date/periode dengan grouping by month
  - Detail evaluasi yang sudah disubmit (tap untuk lihat detail)
  - Status: Submitted/Pending
  - Stats bar dengan total evaluasi, jumlah per kategori
  - Real data dari AsyncStorage via evaluasiService

**Deliverable Week 2-3:** ✅ SELESAI
- Mahasiswa bisa pilih fasilitas → isi form → submit
- Riwayat menampilkan semua evaluasi yang pernah dilakukan
- Mock data terintegrasi dengan AsyncStorage

---

### **FASE 7: Statistik & Data Visualization** (Minggu 3-4) - ✅ SELESAI
**Estimasi: 8-10 jam kerja**

#### Week 3-4: Statistics Implementation
- [x] **Statistik Screen - Student View** (5 jam)
  - Jumlah evaluasi yang sudah dikerjakan
  - Progress evaluasi semester ini
  - Chart/grafik partisipasi (bar chart sederhana tanpa library)
  - Achievement badges (Super Aktif, Aktif, Partisipasi Baik)
  - Periode aktif info
  - Real data dari evaluasiService via AsyncStorage

- [x] **Admin Dashboard - Real Stats** (5 jam)
  - Total evaluasi masuk (hari ini, minggu ini, bulan ini)
  - Tingkat partisipasi mahasiswa (%) dengan detail unique mahasiswa
  - Evaluasi by kategori (Dosen vs Fasilitas) dengan persentase
  - Top 5 dosen dengan rating tertinggi (calculated from jawaban)
  - Fasilitas yang perlu perbaikan (rating < 3.5)
  - Real data calculation dari statsService

**Deliverable Week 3-4:** ✅ SELESAI
- Mahasiswa bisa lihat statistik evaluasi mereka dengan achievement badges
- Admin bisa lihat dashboard dengan data agregat real-time
- Visual representation dengan simple bar chart (no external library)

---

### **FASE 8: Admin - Laporan & Periode** (Minggu 4-5) - ✅ SELESAI
**Estimasi: 10-12 jam kerja**

#### Week 4: Laporan Screen
- [x] **Laporan Screen - Implementation** (6 jam)
  - Filter laporan by:
    - Periode (dropdown dengan modal picker)
    - Tipe evaluasi (Dosen/Fasilitas/Semua) dengan chips
  - Tampilan laporan:
    - List hasil evaluasi dengan card layout
    - Rata-rata score per item (dosen/fasilitas)
    - Summary cards: Total items & overall average
    - Color-coded ratings dengan label (Sangat Baik/Baik/Cukup/Kurang)
    - Detail stats: jumlah evaluasi, total jawaban
  - Real-time calculation dari evaluasiService
  - Statistics aggregation per dosen/fasilitas
  - Pull-to-refresh & loading states

#### Week 5: Periode Management
- [x] **Periode Screen - Implementation** (4 jam)
  - List semua periode evaluasi dari periodeService
  - Status badge: Aktif (hijau)/Tidak Aktif (kuning)/Selesai (abu-abu)
  - Informasi lengkap: nama, tahun ajaran, semester, tanggal mulai-akhir, batas evaluasi
  - Action buttons: Activate/Deactivate/Edit/Delete
  - Set periode aktif (hanya 1 periode bisa aktif - business rule enforced)
  - Confirmation dialogs untuk semua actions
  - Disable delete untuk periode aktif
  - FAB untuk create new periode
  - Active periode info card di top
  - Pull-to-refresh & empty states

- [x] **Form Kelola Periode** (2 jam)
  - Create/Edit mode dalam satu form
  - Fields: nama, tahun ajaran, semester (dropdown), tanggal mulai, tanggal akhir, batas evaluasi, keterangan
  - Validasi tanggal format (YYYY-MM-DD)
  - Validasi logika tanggal menggunakan periodeService.validatePeriodeDates()
  - Konfirmasi aktivasi/deaktivasi periode
  - Modal semester picker
  - Info card dengan instruksi
  - Loading state saat submit
  - Navigate back on success

- [x] **Navigation Integration**
  - AdminNavigator updated dengan Stack + Tab structure
  - FormPeriodeScreen as modal presentation
  - Proper navigation flow: Periode → FormPeriode (create/edit)
  - Import FormPeriodeScreen di AdminNavigator

**Deliverable Week 4-5:** ✅ SELESAI
- Admin bisa melihat laporan dengan filter periode & tipe evaluasi
- Statistik agregat ditampilkan per dosen/fasilitas dengan rating colors
- Admin bisa kelola periode evaluasi (list, create, edit, delete)
- Admin bisa activate/deactivate periode (only 1 active at a time)
- Mock data management dengan periodeService fully functional
- Business rules enforced (cannot delete active, only 1 active periode)

---

### **FASE 9: Backend Development** (Minggu 5-6) - PRIORITAS TINGGI
**Estimasi: 16-20 jam kerja**

**❗ KEPUTUSAN: Pilih Tech Stack Backend**
- **Option A: Node.js + Express + PostgreSQL** (Recommended)
  - Pro: Satu bahasa (JavaScript), modern, scalable
  - Con: Setup database baru
- **Option B: Laravel + MySQL** (Alternative)
  - Pro: Mature framework, authentication built-in
  - Con: Beda bahasa, lebih kompleks

#### Backend Core (10 jam)
- [ ] **Setup Backend Project** (2 jam)
  - Initialize project (Express/Laravel)
  - Database setup (PostgreSQL/MySQL)
  - Environment configuration
  - CORS setup untuk mobile

- [ ] **Database Schema & Migration** (3 jam)
  ```sql
  Tables:
  - users (mahasiswa + admin)
  - dosen
  - mata_kuliah
  - fasilitas
  - periode_evaluasi
  - pernyataan_dosen
  - pernyataan_fasilitas
  - evaluasi_dosen
  - evaluasi_fasilitas
  - evaluasi_detail (jawaban likert)
  ```

- [ ] **Authentication API** (3 jam)
  - POST /api/auth/register
  - POST /api/auth/login
  - POST /api/auth/logout
  - GET /api/auth/profile
  - PUT /api/auth/change-password
  - JWT token implementation
  - Password hashing (bcrypt)

- [ ] **Master Data API** (2 jam)
  - GET /api/dosen (list dosen)
  - GET /api/fasilitas (list fasilitas)
  - GET /api/periode/active (periode aktif)
  - GET /api/pernyataan/dosen (questions)
  - GET /api/pernyataan/fasilitas (questions)

#### Evaluasi API (6 jam)
- [ ] **Evaluasi Endpoints** (4 jam)
  - POST /api/evaluasi/dosen (submit evaluasi dosen)
  - POST /api/evaluasi/fasilitas (submit evaluasi fasilitas)
  - GET /api/evaluasi/riwayat (mahasiswa history)
  - GET /api/evaluasi/statistik (mahasiswa stats)
  - Validation & business logic
  - Prevent duplicate evaluasi (same dosen/fasilitas in periode)

- [ ] **Admin API** (2 jam)
  - GET /api/admin/dashboard (stats agregat)
  - GET /api/admin/laporan (filtered reports)
  - GET /api/admin/periode (CRUD periode)
  - POST /api/admin/periode (create/update)
  - PUT /api/admin/periode/:id/activate

#### Testing & Documentation (4 jam)
- [ ] **API Testing** (2 jam)
  - Postman collection
  - Test semua endpoints
  - Error handling validation

- [ ] **API Documentation** (2 jam)
  - API endpoints list
  - Request/response examples
  - Authentication flow
  - Error codes

**Deliverable Week 5-6:**
- Backend API fully functional
- Database dengan sample data
- API documentation lengkap
- Postman collection untuk testing

---

### **FASE 10: Frontend-Backend Integration** (Minggu 6) - PRIORITAS TINGGI
**Estimasi: 8-12 jam kerja**

#### Integration Tasks
- [ ] **Update API Configuration** (1 jam)
  - Set base URL backend di constants.js
  - Update axios interceptors dengan real token
  - Error handling untuk network issues

- [ ] **Replace Mock Authentication** (2 jam)
  - Update authService.js dengan real API calls
  - Remove MOCK_USERS
  - Handle API errors (wrong credentials, network error)
  - Update registration flow

- [ ] **Connect Evaluasi Features** (4 jam)
  - Update Pilih Dosen screen → fetch from API
  - Update Pilih Fasilitas screen → fetch from API
  - Update Form submissions → POST to API
  - Handle success/error responses
  - Loading states & error messages

- [ ] **Connect Admin Features** (3 jam)
  - Dashboard → fetch real statistics
  - Laporan → fetch filtered data from API
  - Periode → CRUD operations to API
  - Real-time data updates

- [ ] **Profile & Settings** (2 jam)
  - Fetch user profile from API
  - Implement change password
  - Update profile functionality
  - Handle API errors gracefully

**Deliverable Week 6:**
- Aplikasi fully integrated dengan backend
- No more mock data
- All features working end-to-end

---

### **FASE 11: Testing & Bug Fixes** (Minggu 6-7) - PRIORITAS TINGGI
**Estimasi: 6-8 jam kerja**

#### Comprehensive Testing
- [ ] **User Flow Testing** (3 jam)
  - Test complete flow: Register → Login → Evaluasi → Logout
  - Test role-based access (mahasiswa tidak bisa akses admin)
  - Test all navigation paths
  - Test form validations
  - Test error scenarios

- [ ] **Cross-Device Testing** (2 jam)
  - Test di Android (berbagai screen size)
  - Test di iOS (if available)
  - Test di emulator & real device
  - Performance testing

- [ ] **Bug Fixes** (3 jam)
  - Fix bugs yang ditemukan saat testing
  - UI/UX improvements
  - Performance optimization
  - Loading state improvements

**Deliverable Week 6-7:**
- Aplikasi stable dan bug-free
- All features tested dan working
- User experience smooth

---

### **FASE 12: Polish & Deployment** (Minggu 7) - FINAL
**Estimasi: 4-6 jam kerja**

#### Final Touch
- [ ] **UI/UX Polish** (2 jam)
  - Consistent styling across screens
  - Smooth animations/transitions
  - Loading indicators
  - Empty states
  - Error messages user-friendly

- [ ] **Dark Mode Implementation** (2 jam)
  - Implement theme switching (Light/Dark)
  - Save preference to AsyncStorage
  - Apply theme across all screens
  - Test in both modes

- [ ] **Deployment** (2 jam)
  - **Backend:** Deploy to hosting (Heroku/DigitalOcean/Railway)
  - **Database:** Setup production database
  - **Frontend:** Build APK untuk testing
  - Environment variables production
  - Basic monitoring/logging

**Deliverable Week 7:**
- Aplikasi production-ready
- Backend deployed & accessible
- APK siap untuk distribusi internal
- Documentation lengkap

---

## 📋 Checklist Akhir Sebelum Launch

### Functionality
- [ ] Mahasiswa bisa register & login
- [ ] Mahasiswa bisa evaluasi dosen (pilih → isi form → submit)
- [ ] Mahasiswa bisa evaluasi fasilitas (pilih → isi form → submit)
- [ ] Mahasiswa bisa lihat riwayat evaluasi
- [ ] Mahasiswa bisa lihat statistik partisipasi
- [ ] Mahasiswa bisa ubah password
- [ ] Mahasiswa bisa logout
- [ ] Admin bisa login
- [ ] Admin bisa lihat dashboard dengan statistik
- [ ] Admin bisa lihat laporan evaluasi
- [ ] Admin bisa kelola periode evaluasi
- [ ] Admin bisa logout

### Technical
- [ ] No critical bugs
- [ ] API response time < 2 detik
- [ ] App tidak crash
- [ ] Validation berfungsi di semua form
- [ ] Error handling proper
- [ ] Loading states di semua async operations
- [ ] Data persistence bekerja (AsyncStorage)
- [ ] Token refresh mechanism (optional)

### UX/UI
- [ ] Consistent design system
- [ ] Readable text (font size, contrast)
- [ ] Touch targets adequate (min 44x44)
- [ ] Loading indicators jelas
- [ ] Success/error messages informatif
- [ ] Empty states dengan CTA jelas
- [ ] Navigasi intuitif

### Security
- [ ] Password di-hash di database
- [ ] JWT token secure
- [ ] API authorization proper
- [ ] No sensitive data di log
- [ ] SQL injection prevention
- [ ] XSS prevention

### Documentation
- [ ] README.md dengan cara install & run
- [ ] API documentation lengkap
- [ ] User manual (optional)
- [ ] Testing credentials documented
- [ ] Known issues documented

---

## 🎯 Timeline Summary

| Minggu | Fase | Deliverables | Jam Kerja |
|--------|------|--------------|-----------|
| 1 | Fase 5: Evaluasi Dosen | Pilih dosen, Form evaluasi, LikertScale | 12-16 jam |
| 2-3 | Fase 6: Evaluasi Fasilitas | Pilih fasilitas, Form evaluasi, Riwayat | 10-14 jam |
| 3-4 | Fase 7: Statistik | Student stats, Admin dashboard stats | 8-10 jam |
| 4-5 | Fase 8: Admin Features | Laporan, Periode management | 10-12 jam |
| 5-6 | Fase 9: Backend | Node.js API, Database, Authentication | 16-20 jam |
| 6 | Fase 10: Integration | Connect frontend to backend | 8-12 jam |
| 6-7 | Fase 11: Testing | Testing, Bug fixes | 6-8 jam |
| 7 | Fase 12: Polish | UI polish, Dark mode, Deployment | 4-6 jam |

**Total Estimasi:** 74-98 jam kerja  
**Target dengan 3 jam/hari:** ~25-33 hari kerja  
**Timeline:** Selesai minggu ke-7 (akhir Maret 2026) ✅

---

## 💡 Tips Pengerjaan

### Workflow Harian
1. **Perencanaan (15 menit):** Review task hari ini
2. **Coding (2-3 jam):** Focus on one feature at a time
3. **Testing (30 menit):** Test fitur yang baru dibuat
4. **Commit (15 menit):** Git commit dengan message jelas

### Prioritas
- ✅ **SELESAIKAN FITUR CORE DULU** (Fase 5-6: Evaluasi)
- ✅ Backend bisa dikerjakan paralel dengan polish frontend
- ✅ Testing continuous, jangan tunggu akhir
- ✅ Deploy early, deploy often

### Yang Bisa Dipangkas Jika Terburu
- Statistik screen (bisa jadi placeholder dulu)
- Dark mode (bisa fase 2)
- Charts/grafik (pakai tabel dulu)
- Export PDF (bisa fase 2)
- Change password (bisa fase 2)

### Yang TIDAK BOLEH Dipangkas
- Authentication & authorization
- Form evaluasi dosen & fasilitas
- Submit & save evaluasi
- Admin dashboard basic
- Backend API core
- Security (password hash, JWT)

---

## 📞 Milestone Review

### End of Week 2
**Target:** Mahasiswa bisa melakukan evaluasi dosen & fasilitas (mock data)
**Review:** Cek flow lengkap, validasi, UX

### End of Week 4
**Target:** Admin features & statistik lengkap (mock data)
**Review:** Cek semua screen, data flow

### End of Week 6
**Target:** Backend ready & integrated
**Review:** E2E testing, API performance

### End of Week 7
**Target:** Production ready
**Review:** Final testing, deployment, documentation

---

## 🚨 Catatan Penting

1. **FOKUS pada MVP (Minimum Viable Product)**
   - Core feature: Mahasiswa evaluasi, Admin lihat hasil
   - Nice-to-have bisa fase 2

2. **Simpan sample data yang realistis**
   - Buat seeder dengan data yang masuk akal
   - Penting untuk demo

3. **Documentation sambil jalan**
   - Tulis API docs saat bikin endpoint
   - Update README saat ada perubahan setup

4. **Git commit teratur**
   - Commit setiap selesai 1 feature kecil
   - Jangan nunggu banyak perubahan

5. **Test di real device**
   - Jangan hanya di emulator
   - Performance beda di real device

6. **Backup data & code**
   - Push ke GitHub regularly
   - Backup database

---

## 📖 Resources

### Dokumentasi
- React Native: https://reactnative.dev/
- Expo: https://docs.expo.dev/
- React Navigation: https://reactnavigation.org/
- Express.js: https://expressjs.com/
- PostgreSQL: https://www.postgresql.org/docs/

### Libraries yang Mungkin Dibutuhkan
- Form: react-hook-form (optional)
- Charts: react-native-chart-kit
- Date picker: @react-native-community/datetimepicker
- PDF: react-native-pdf atau react-native-html-to-pdf

---

**Good Luck! 🚀**

*Last Updated: February 20, 2026*
