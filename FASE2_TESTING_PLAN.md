# 📋 FASE 2: Complete Testing & Validation

**Start Date:** April 16, 2026  
**Target Duration:** 4-6 hours  
**Success Criteria:** All features work end-to-end without bugs  
**Go-Live Ready When:** All tests pass ✅

---

## 🎯 Objective

Verify ALL application features work correctly from end user perspective:
- Mahasiswa can login, evaluate, and submit
- Admin can manage data and view reports
- All calculations are accurate
- No data is lost or corrupted
- Performance is acceptable
- UI/UX is smooth and responsive

---

## 📱 TEST 1: Mahasiswa (Student) Flow

### 1a. Student Registration
**Objective:** Mahasiswa can create new account

Steps:
1. [ ] Open app on mobile/expo
2. [ ] Tap "Registrasi" button
3. [ ] Fill in form:
   - NIM: 210101002 (different from seed)
   - Nama Lengkap: Budi Santoso
   - Email: 210101002@student.ac.id
   - Password: password123
   - Prodi: Teknik Informatika
   - Angkatan: 2021
4. [ ] Tap "Daftar"
5. [ ] Verify success message and redirect to login
6. [ ] Try login with new credentials: Success ✓

**Expected Result:** New account created, user can login

---

### 1b. Student Login
**Objective:** Mahasiswa dapat login dengan credentials seed

Steps:
1. [ ] Login with: 210101001@student.ac.id / password123
2. [ ] Verify redirected to HomeScreen (dashboard)
3. [ ] Check displayed data:
   - Name: Ahmad Fauzi
   - NIM: 210101001
   - Prodi: Teknik Informatika
4. [ ] Check bottom tabs: Home, Evaluasi (or similar), Riwayat, Profil

**Expected Result:** Login successful, dashboard displays correct student data

---

### 1c. View Available Evaluations
**Objective:** Student can see list of dosen & fasilitas to evaluate

Steps:
1. [ ] On HomeScreen, look for "Evaluasi Dosen" button/menu
2. [ ] Tap to see list of dosen
3. [ ] Verify list shows:
   - Dr. Ir. Bambang Wijaya, M.Kom
   - Testing
4. [ ] Look for "Evaluasi Fasilitas" button
5. [ ] Tap to see list of fasilitas
6. [ ] Verify list shows:
   - Ruang Kelas 1.1
   - Ruang Kelas (DK 3.1)
7. [ ] Both lists are not empty ✓

**Expected Result:** Student can see both dosen and fasilitas lists

---

### 1d. Submit Dosen Evaluation
**Objective:** Student can rate dosen on Likert scale 1-5

Steps:
1. [ ] From dosen list, tap "Dr. Ir. Bambang Wijaya"
2. [ ] FormEvaluasiDosenScreen opens
3. [ ] Verify all 15 pernyataan dosen appear with category headers:
   - Penguasaan Materi (4 questions)
   - Metode Pengajaran (4 questions)
   - Komunikasi (2 questions)
   - Penilaian (3 questions)
   - Kedisiplinan (2 questions)
4. [ ] For EACH question, select rating 1-5:
   - Rating 1 = Sangat Tidak Setuju (or similar)
   - Rating 5 = Sangat Setuju
5. [ ] Optional: Add komentar/notes at end
6. [ ] Tap "Kirim" / "Submit" button
7. [ ] Verify success message
8. [ ] Should return to dosen list or RiwayatScreen

**Expected Result:** Evaluation submitted, data saved to database

---

### 1e. Submit Fasilitas Evaluation
**Objective:** Student can rate fasilitas on Likert scale 1-5

Steps:
1. [ ] From fasilitas list, tap "Ruang Kelas 1.1"
2. [ ] FormEvaluasiFasilitasScreen opens
3. [ ] Verify all 9 pernyataan fasilitas appear:
   - Kebersihan (2 questions)
   - Kelengkapan (3 questions)
   - Kenyamanan (2 questions)
   - Aksesibilitas (2 questions)
4. [ ] Rate each question 1-5
5. [ ] Optional: Add notes
6. [ ] Tap "Kirim" button
7. [ ] Verify success message

**Expected Result:** Fasilitas evaluation submitted successfully

---

### 1f. View Riwayat (History)
**Objective:** Student can see history of evaluations submitted

Steps:
1. [ ] Open RiwayatScreen tab
2. [ ] Should show list of submitted evaluations:
   - 1 Dosen evaluation (Dr. Ir. Bambang Wijaya)
   - 1 Fasilitas evaluation (Ruang Kelas 1.1)
3. [ ] Each item shows:
   - Name of dosen/fasilitas
   - Date submitted
   - Rating given (or ability to expand/view details)
4. [ ] Tap one to see details: Should show all answers submitted
5. [ ] Verify calculations are correct:
   - If all ratings were 5, average should be 5.0
   - If mix (4,5,4,5...), average should match

**Expected Result:** Riwayat displays all submitted evaluations with correct data

---

### 1g. View Statistik/Analytics
**Objective:** Student can see summary statistics of evaluations

Steps:
1. [ ] Open StatistikScreen (if exists)
2. [ ] Should show:
   - Total evaluations done by this student
   - Breakdown: X dosen, Y fasilitas
   - Average rating given
   - Optional: Completion percentage
3. [ ] If there's a period filter, verify it working

**Expected Result:** Statistics display correctly and update when new evaluations added

---

### 1h. Change Password
**Objective:** Student can change their password

Steps:
1. [ ] Open ProfileScreen
2. [ ] Tap "Ubah Password"
3. [ ] ChangePasswordScreen opens
4. [ ] Enter:
   - Current Password: password123
   - New Password: newpassword123
   - Confirm New Password: newpassword123
5. [ ] Tap "Ubah"
6. [ ] Verify success message
7. [ ] Logout
8. [ ] Try login with OLD password: Should FAIL ✓
9. [ ] Try login with NEW password: Should SUCCESS ✓
10. [ ] Change back to password123 for next tests

**Expected Result:** Password changed, old credentials no longer work

---

### 1i. Logout
**Objective:** Student can safely logout

Steps:
1. [ ] On ProfileScreen, tap "Logout" button
2. [ ] Confirmation dialog appears
3. [ ] Tap "Keluar" (yes)
4. [ ] Should return to LoginScreen
5. [ ] Try tapping back button: Should NOT go back into app (session ended)

**Expected Result:** User logged out, cannot access app features without re-login

---

## 👨‍💼 TEST 2: Admin Flow

### 2a. Admin Login
**Objective:** Admin can login with valid credentials

Steps:
1. [ ] Logout previous user (mahasiswa)
2. [ ] Login with: admin@evaluasi.com / password123
3. [ ] Should navigate to AdminDashboardScreen (Beranda tab)
4. [ ] Verify displayed data:
   - Name: Admin Evaluasi
   - Role: Administrator  
   - Email: admin@evaluasi.com

**Expected Result:** Admin successfully logged in, sees admin interface

---

### 2b. Dashboard - View Statistics
**Objective:** Admin can see current evaluation statistics

Steps:
1. [ ] On Beranda (Dashboard) tab
2. [ ] Verify displayed sections:
   - Evaluasi Hari Ini: 2 (from our test data)
   - Evaluasi Minggu Ini: 2
   - Evaluasi Bulan Ini: 2
   - Total Evaluasi Keseluruhan: 2
   - Jumlah Mahasiswa yang Berpartisipasi: 1
   - Persentase Partisipasi: 100%
3. [ ] Top 5 Dosen dengan Rating Tinggi:
   - Should show: Testing (1 evaluasi, rata-rata 5)
   - Should show: Dr. Ir. Bambang Wijaya (0 evaluasi if not yet filled)
4. [ ] Fasilitas yang Perlu Perbaikan (rating < 3.5):
   - Should be empty (all test ratings were high)

**Expected Result:** Dashboard shows accurate statistics matching our test data

---

### 2c. Dashboard - Refresh/Pull to Refresh
**Objective:** Admin can refresh dashboard to see latest data

Steps:
1. [ ] Pull down on dashboard (pull-to-refresh gesture)
2. [ ] Should see loading indicator briefly
3. [ ] Stats update (if any new evaluations were submitted)
4. [ ] Verify no errors in console

**Expected Result:** Refresh works without errors

---

### 2d. Laporan (Reports) - View Full Report
**Objective:** Admin can generate and view detailed evaluation reports

Steps:
1. [ ] Open Laporan tab (3rd tab)
2. [ ] LaporanScreen opens
3. [ ] Verify buttons/options:
   - Filter by Periode: Should show "Evaluasi Gasal 2024/2025"
   - Filter by Tipe: Dosen / Fasilitas / Semua
4. [ ] Select Tipe = "Dosen"
5. [ ] Tap "Lihat Laporan" or similar
6. [ ] Should display:
   - Dr. Ir. Bambang Wijaya:
     - Jumlah Evaluasi: 0 or 1 (depending on if student filled it)
     - Rata-rata: null or actual rating
     - Detail kategori breakdown
   - Testing:
     - Jumlah Evaluasi: 1
     - Rata-rata: 5.0 (from test)
     - Detail per kategori

**Expected Result:** Report shows detailed breakdown per dosen with accurate calculations

---

### 2e. Laporan - Switch Report Type
**Objective:** Admin can view fasilitas report

Steps:
1. [ ] In Laporan, change Tipe filter to "Fasilitas"
2. [ ] Tap "Lihat Laporan"
3. [ ] Should display:
   - Ruang Kelas 1.1:
     - Jumlah Evaluasi: 1
     - Rata-rata: (actual rating from test)
     - Detail kategori per fasilitas question
   - Ruang Kelas (DK 3.1):
     - Jumlah Evaluasi: 0 or 1
     - Rata-rata: null or value

**Expected Result:** Fasilitas report displays correctly with no SQL errors

---

### 2f. Laporan - Export or Download
**Objective:** Admin can export report (if feature exists)

Steps:
1. [ ] Look for "Export" / "Download" button on laporan
2. [ ] If exists, tap it
3. [ ] Verify file is created/downloaded successfully
4. [ ] For Excel/CSV: Verify data structure is correct
5. [ ] For PDF: Verify content is readable

**Expected Result:** Export functionality works (or gracefully handle if not yet implemented)

---

### 2g. Periode - View Active Period
**Objective:** Admin can manage evaluation periods

Steps:
1. [ ] Open Periode tab (4th tab)
2. [ ] PeriodeScreen shows list of periods
3. [ ] Verify shows:
   - Evaluasi Gasal 2024/2025
   - Status: Aktif
   - Tanggal Mulai, Akhir, Batas Evaluasi
4. [ ] Should have visual indicator (green for aktif, grey for non-aktif)

**Expected Result:** Period list displays correctly

---

### 2h. Periode - Create New Period
**Objective:** Admin can create new evaluation period

Steps:
1. [ ] Tap "Tambah Periode" button
2. [ ] FormPeriodeScreen opens (modal)
3. [ ] Fill form:
   - Nama: Evaluasi Genap 2024/2025
   - Tahun Ajaran: 2024/2025
   - Semester: Genap
   - Tanggal Mulai: 2025-02-01
   - Tanggal Akhir: 2025-06-30
   - Batas Evaluasi: 2025-06-15
   - Status: Non-Aktif (or Aktif)
4. [ ] Tap "Simpan"
5. [ ] Should show success message
6. [ ] Return to PeriodeScreen
7. [ ] New period should appear in list
8. [ ] Verify data saved to database

**Expected Result:** New period created and visible in list

---

### 2i. Periode - Toggle Aktif/Non-aktif
**Objective:** Admin can activate/deactivate periods

Steps:
1. [ ] On PeriodeScreen, find existing period
2. [ ] Tap "Edit" or long-press
3. [ ] Edit form opens, change Status to "Non-Aktif"
4. [ ] Save changes
5. [ ] Verify period status changes in list
6. [ ] Create another test to verify only ONE periode can be "aktif" at a time

**Expected Result:** Period status changes correctly

---

### 2j. Kelola (Master Data) - Manage Dosen
**Objective:** Admin can manage lecturer data

Steps:
1. [ ] Open Pengaturan tab (4th/5th tab)
2. [ ] Tap "Kelola Data Master"
3. [ ] KelolaScreen shows menu
4. [ ] Tap "Kelola Dosen"
5. [ ] DosenManagementScreen shows list of dosen:
   - Dr. Ir. Bambang Wijaya, M.Kom
   - Testing
6. [ ] Count displayed: 2 dosen
7. [ ] Search feature: Try typing "Bambang" → filter works
8. [ ] Tap "Tambah Dosen"
9. [ ] FormDosenScreen opens with fields:
   - NIP: 199001012010121001
   - Nama: Dr. Rani Kusniastuti, S.T., M.T.
   - Email: rani.kusniastuti@uni.ac.id
10. [ ] Tap "Simpan"
11. [ ] Back to DosenManagementScreen
12. [ ] New dosen should appear in list (3 total now)

**Expected Result:** New dosen created and visible

---

### 2k. Kelola - Manage Fasilitas
**Objective:** Admin can manage facility data

Steps:
1. [ ] From Kelola menu, tap "Kelola Fasilitas"
2. [ ] FasilitasManagementScreen shows:
   - Ruang Kelas 1.1
   - Ruang Kelas (DK 3.1)
3. [ ] Filter by Kategori works (if implemented)
4. [ ] Tap "Tambah Fasilitas"
5. [ ] FormFasilitasScreen opens:
   - Kode: LAB-001
   - Nama: Laboratorium Komputer
   - Kategori: Laboratorium
   - Lokasi: Gedung B Lantai 2
   - Kapasitas: 30
6. [ ] Tap "Simpan"
7. [ ] Back to list, should see 3 fasilitas now

**Expected Result:** New fasilitas created

---

### 2l. Admin Profil
**Objective:** Admin can view own profile

Steps:
1. [ ] On Pengaturan tab, tap "Profil Admin"
2. [ ] ProfileAdminScreen shows:
   - Avatar with initials "AD" (Admin)
   - Name: Admin Evaluasi
   - Role badge: Administrator
   - Email: admin@evaluasi.com
   - Role label: Administrator
3. [ ] Tap "Ubah Password"
4. [ ] ChangePasswordScreen opens
5. [ ] Change password (same as mahasiswa test)
6. [ ] Change back to password123
7. [ ] Tap back
8. [ ] Back on ProfileAdminScreen

**Expected Result:** Admin profile displays correctly, password change works

---

### 2m. Admin Settings & Logout
**Objective:** Admin can logout

Steps:
1. [ ] From Pengaturan, verify menu items:
   - Kelola Data Master
   - Profil Admin
   - Tentang Aplikasi
   - Keluar Akun
2. [ ] Verify "Bantuan & Panduan" is GONE
3. [ ] Tap "Keluar Akun"
4. [ ] Confirmation dialog
5. [ ] Tap "Keluar"
6. [ ] Logged out, back to LoginScreen

**Expected Result:** Admin successfully logged out

---

## 🧮 TEST 3: Data Integrity & Calculations

### 3a. Evaluate Dosen with Specific Ratings
**Objective:** Verify rating calculations are accurate

Setup:
1. [ ] Login as student
2. [ ] Evaluate dosen with ratings: 5, 4, 5, 4, 3, 5, 4, 5, 4, 5, 3, 4, 5, 5, 4

Manual Calculation:
- Sum: 5+4+5+4+3+5+4+5+4+5+3+4+5+5+4 = 65
- Count: 15
- Average: 65/15 = 4.33

Expected Result in App:
- [ ] Riwayat should show rata-rata: 4.33
- [ ] Admin Laporan should show rata-rata dosen: 4.33
- [ ] Dashboard top dosen list should update

**Expected Result:** All calculations match manual math

---

### 3b. Multiple Student Submissions
**Objective:** Verify aggregation across multiple users

Steps:
1. [ ] Register/have second student account: 210101003
2. [ ] Student 1 rates Dosen "Testing" with all 5s
3. [ ] Student 2 rates Dosen "Testing" with all 3s
4. [ ] Admin checks Laporan for "Testing":
   - Jumlah Evaluasi: 2
   - Rata-rata: (5+3)/2 = 4.0

**Expected Result:** Multiple submissions aggregate correctly

---

### 3c. Periode Filtering
**Objective:** Verify data filters by active period correctly

Steps:
1. [ ] Create second periode (Evaluasi Genap, Non-aktif)
2. [ ] Make first periode (Gasal) Aktif
3. [ ] Student evaluates dosen (should go to Gasal periode)
4. [ ] Check Admin Laporan:
   - Filter by Gasal: shows evaluation
   - Filter by Genap: shows empty
5. [ ] Activate Genap, deactivate Gasal
6. [ ] New evaluations should go to Genap
7. [ ] Old data should still be in Gasal when filtered

**Expected Result:** Period filtering works correctly

---

## ⚡ TEST 4: Performance & UI/UX

### 4a. App Responsiveness
**Objective:** No lag, smooth interactions

Tests:
- [ ] Button taps: Immediate response (< 300ms)
- [ ] Form submissions: Visible loading, then success (< 2s)
- [ ] List scroll: Smooth, no jank
- [ ] Pagination/loading more: Works smoothly
- [ ] Animations: Modal slide, transitions smooth

**Expected Result:** All interactions feel responsive and polished

---

### 4b. No Crashes
**Objective:** App doesn't crash during normal usage

Tests:
- [ ] No crashes when navigating between screens
- [ ] No crashes when submitting forms
- [ ] No crashes when filtering/searching
- [ ] No crashes when changing network (if testing on device)
- [ ] Console shows no ERROR level messages (warnings OK)

**Expected Result:** Zero crashes observed

---

### 4c. UI Consistency
**Objective:** Colors, fonts, spacing look professional

Tests:
- [ ] Colors match theme (blue primary, grey secondary)
- [ ] Fonts readable (no overlap, appropriate sizes)
- [ ] Spacing consistent (no cramped or awkward layouts)
- [ ] Icons display correctly (font icons loaded)
- [ ] Bottom tabs visible and accessible all screens
- [ ] Modal screens have proper close button/back gesture

**Expected Result:** Professional appearance with no UI bugs

---

### 4d. Forms on Different Device Sizes
**Objective:** App works on various screen sizes

Tests:
- [ ] Test on small phone (5")
- [ ] Test on large phone (6.5"+)
- [ ] Test on tablet (if available)
- [ ] Portrait & landscape orientations
- [ ] No text cutoff or overflow
- [ ] Buttons reachable (not too small)

**Expected Result:** Responsive design works across devices

---

## 🔒 TEST 5: Security & Access Control

### 5a. Role-Based Access
**Objective:** Student cannot access admin features

Steps:
- [ ] Login as student
- [ ] Try manually navigating to admin tabs: Blocked or redirected
- [ ] Check API calls: Student tokens rejected if trying admin endpoint

**Expected Result:** Role-based access control enforced

---

### 5b. Token Expiration
**Objective:** Sessions expire after reasonable time

Steps:
- [ ] Note login time
- [ ] Wait 30+ minutes (or set JWT_EXPIRES_IN for testing to 5 min, wait)
- [ ] Try making API call with old token
- [ ] Should receive 401 Unauthorized
- [ ] App should redirect to LoginScreen

**Expected Result:** Token expires, forces re-login

---

### 5c. No Sensitive Data Exposure
**Objective:** Passwords/secrets not in responses

Tests:
- [ ] Check network tab: No password fields transmitted
- [ ] Check API responses: No full password hashes visible
- [ ] Check localStorage/AsyncStorage: No plain text passwords stored
- [ ] Check logs: No sensitive data in console.logs

**Expected Result:** Security best practices followed

---

## 📋 TEST 6: Edge Cases & Error Handling

### 6a. No Periode Available
**Objective:** Graceful handling when no active periode

Steps:
1. [ ] Deactivate all periods in database (or directly in DB)
2. [ ] Open app as student
3. [ ] Should still show app, but perhaps warning "No active periode"
4. [ ] Try to submit evaluation: Graceful error or prompt to pick periode

**Expected Result:** Handles gracefully, no crash

---

### 6b. Network Error
**Objective:** Graceful handling of network failures

Steps:
1. [ ] Turn off WiFi/cellular (or use offline mode)
2. [ ] Try to login: Should show error "No connection" or similar
3. [ ] Try to submit evaluation: Error message
4. [ ] Turn connection back on: Retry option works

**Expected Result:** Graceful error messages, not crashed

---

### 6c. Duplicate Submission Prevention
**Objective:** Student cannot submit same evaluation twice

Steps:
1. [ ] Student submits evaluation dosen X
2. [ ] Try submitting same dosen X again
3. [ ] Should get error "Anda sudah mengevaluasi dosen ini" or similar
4. [ ] Can still submit different dosen or later evaluation in different periode

**Expected Result:** Prevents duplicate within same periode

---

### 6d. Invalid Input Handling
**Objective:** Forms validate input properly

Tests:
- [ ] Try register with:
  - Empty NIM: Error shown
  - Invalid email: Error shown
  - Too short password (< 6 chars): Error shown
- [ ] Try create dosen with:
  - Empty NIP: Error submitted
  - Duplicate NIP: Error handling

**Expected Result:** Input validation prevents invalid data

---

## ✅ Final Checklist

Before declaring FASE 2 complete, verify all boxes:

### Mahasiswa Features
- [ ] Registration works
- [ ] Login works
- [ ] Evaluasi Dosen submits and saves
- [ ] Evaluasi Fasilitas submits and saves
- [ ] Riwayat shows all submissions
- [ ] Statistik displays correctly
- [ ] Change password works
- [ ] Logout works
- [ ] No crashes or errors

### Admin Features
- [ ] Login works
- [ ] Dashboard shows accurate statistics
- [ ] Laporan shows detailed breakdowns (dosen & fasilitas)
- [ ] Periode management works
- [ ] Dosen management works
- [ ] Fasilitas management works
- [ ] Profil Admin displays correctly
- [ ] Change password works
- [ ] Logout works
- [ ] No crashes or errors

### Data Integrity
- [ ] Calculations accurate
- [ ] Multiple users aggregate correctly
- [ ] Periode filtering works
- [ ] No data loss on refresh
- [ ] All data persists

### Performance & UX
- [ ] No lag or delays
- [ ] Zero crashes
- [ ] Professional appearance
- [ ] Works on different devices
- [ ] Responsive in portrait/landscape

### Security
- [ ] Role-based access enforced
- [ ] Token expiration works
- [ ] No sensitive data exposed
- [ ] Input properly validated
- [ ] Duplicate submissions prevented

---

## 🎯 Success Criteria

**FASE 2 is COMPLETE when:**
- ✅ All 6 test sections: PASS
- ✅ All mahasiswa flows: Working end-to-end
- ✅ All admin flows: Working end-to-end
- ✅ Data calculations: Accurate
- ✅ Performance: Responsive (< 2s per operation)
- ✅ Crashes: Zero
- ✅ Bugs logged: Fixed or deferred to post-launch
- ✅ Ready for FASE 3 (Security & Documentation)

---

## 📝 Bug Report Template

If issues found, document as:

```
BUG #: [Sequential number]
Title: [One line description]
Severity: Critical / High / Medium / Low
Feature: [Which feature]
Steps to Reproduce:
1. [Step 1]
2. [Step 2]
Expected: [What should happen]
Actual: [What did happen]
Attachments: [Screenshot if needed]
Status: New / In Progress / Fixed / Deferred
```

---

## 🚀 Next: FASE 3

When all FASE 2 tests pass:
- Security hardening
- Password policy enforcement
- Bug fixes
- Documentation writing
- Deployment preparation

**Target:** Go-live ready by end of week!
