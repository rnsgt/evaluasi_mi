# Prompt Week 1: Form & Selection - Evaluasi Dosen

**Fase:** 5 - Evaluasi Dosen  
**Durasi:** Minggu 1-2  
**Total Estimasi:** 12-16 jam kerja  
**Target:** Mahasiswa bisa pilih dosen → isi form evaluasi → submit dengan mock data

---

## 🎯 Task 1: Pilih Dosen Screen (4 jam)

### Prompt untuk Development:

```
Buatkan screen "Pilih Dosen" (PilihDosenScreen.js) dengan spesifikasi berikut:

REQUIREMENTS:
1. List dosen dengan tampilan card yang menarik
2. Setiap card dosen menampilkan:
   - Nama lengkap dosen
   - Mata kuliah yang diampu
   - NIP/NIDN
   - Icon arrow untuk navigate
3. Search bar di atas untuk cari dosen by nama
4. Filter chips untuk filter by mata kuliah
5. Loading state saat fetch data
6. Empty state jika tidak ada dosen
7. Pull to refresh

MOCK DATA (buat file src/services/dosenService.js):
- Minimal 8-10 dosen sample
- Fields: id, nip, nama, mata_kuliah (array), foto_url (optional), email
- Contoh dosen:
  * Dr. Ahmad Fauzi, M.Kom - ["Pemrograman Web", "Basis Data"]
  * Ir. Siti Nurhaliza, M.T - ["Jaringan Komputer", "Sistem Operasi"]
  * Budi Santoso, S.Kom, M.Sc - ["Algoritma & Struktur Data"]
  * dll...

NAVIGATION:
- Ketika dosen diklik → navigate ke FormEvaluasiDosenScreen dengan params:
  { dosenId, namaDosen, mataKuliah }

UI/UX:
- Background: #F5F7FA
- Card: white dengan shadow, radius 12
- Avatar: circular 56x56, background primary color
- Spacing konsisten dengan theme yang sudah ada
- Touch feedback (activeOpacity 0.8)

VALIDATION:
- Hanya tampilkan dosen yang aktif di periode berjalan
- Cek apakah mahasiswa sudah evaluasi dosen ini (untuk fase 2)
```

**File yang perlu dibuat:**
- `src/screens/student/PilihDosenScreen.js`
- `src/services/dosenService.js`
- `src/navigation/StudentNavigator.js` (update untuk add screen)

**Mock Data Structure:**
```javascript
const MOCK_DOSEN = [
  {
    id: 1,
    nip: "197805152005011001",
    nama: "Dr. Ahmad Fauzi, M.Kom",
    mata_kuliah: ["Pemrograman Web", "Basis Data"],
    email: "ahmad.fauzi@kampus.ac.id",
    status: "aktif"
  },
  // ... 7-9 more
];
```

---

## 🎯 Task 2: LikertScale Component (2 jam)

### Prompt untuk Development:

```
Buatkan reusable component LikertScale (src/components/LikertScale.js) dengan spesifikasi:

REQUIREMENTS:
1. Radio button group dengan 5 pilihan (1-5)
2. Visual representation:
   - 1: Sangat Tidak Setuju (Red, icon: emoticon-sad)
   - 2: Tidak Setuju (Orange, icon: emoticon-neutral)
   - 3: Netral (Yellow, icon: emoticon-neutral)
   - 4: Setuju (Light Green, icon: emoticon-happy)
   - 5: Sangat Setuju (Green, icon: emoticon-excited)
3. Interactive selection dengan animasi
4. Show label di bawah setiap pilihan
5. Highlight selected option dengan border tebal + background color
6. Required validation indicator
7. Error message support

PROPS:
- value: number (1-5)
- onValueChange: function(value)
- question: string (text pertanyaan)
- required: boolean (default true)
- error: string (error message)

STYLING:
- Horizontal scroll untuk mobile
- Responsive untuk berbagai screen size
- Accessible touch targets (min 48x48)
- Smooth transition saat selection

EXAMPLE USAGE:
<LikertScale
  question="Dosen menguasai materi dengan baik"
  value={answers[1]}
  onValueChange={(val) => handleAnswerChange(1, val)}
  required={true}
  error={errors[1]}
/>

UI FLOW:
- Unselected: Gray outline, no background
- Selected: Primary color border + light background + icon colored
- Error: Red border + error text below
```

**File yang perlu dibuat:**
- `src/components/LikertScale.js`

**Component Structure:**
```javascript
const LikertScale = ({ value, onValueChange, question, required, error }) => {
  const options = [
    { value: 1, label: 'Sangat Tidak Setuju', color: '#FF5252', icon: 'emoticon-sad-outline' },
    { value: 2, label: 'Tidak Setuju', color: '#FF9800', icon: 'emoticon-neutral-outline' },
    { value: 3, label: 'Netral', color: '#FFC107', icon: 'emoticon-neutral-outline' },
    { value: 4, label: 'Setuju', color: '#8BC34A', icon: 'emoticon-happy-outline' },
    { value: 5, label: 'Sangat Setuju', color: '#4CAF50', icon: 'emoticon-excited-outline' },
  ];
  // Implementation...
};
```

---

## 🎯 Task 3: Form Evaluasi Dosen Screen (6 jam)

### Prompt untuk Development:

```
Buatkan screen Form Evaluasi Dosen (FormEvaluasiDosenScreen.js) dengan spesifikasi:

REQUIREMENTS:

HEADER:
- Info dosen yang dipilih (nama, NIP, mata kuliah)
- Progress indicator (X dari Y pertanyaan terisi)
- Tombol back dengan konfirmasi jika ada perubahan

CONTENT:
- List 12-15 pernyataan evaluasi dosen (scroll view)
- Setiap pernyataan menggunakan LikertScale component
- Pertanyaan dikelompokkan by kategori:
  * Penguasaan Materi (3-4 pertanyaan)
  * Metode Pengajaran (3-4 pertanyaan)
  * Komunikasi (2-3 pertanyaan)
  * Penilaian (2-3 pertanyaan)
  * Kedisiplinan (2 pertanyaan)
- Section untuk komentar/saran (TextInput multiline, optional)

MOCK PERTANYAAN (buat file src/data/pertanyaanDosen.js):
Kategori Penguasaan Materi:
1. "Dosen menguasai materi dengan baik"
2. "Dosen memberikan penjelasan yang mudah dipahami"
3. "Dosen mampu menjawab pertanyaan mahasiswa dengan jelas"
4. "Dosen menggunakan contoh-contoh yang relevan"

Kategori Metode Pengajaran:
5. "Metode pengajaran yang digunakan menarik"
6. "Dosen menggunakan media pembelajaran yang variatif"
7. "Dosen mendorong mahasiswa untuk aktif di kelas"
8. "Materi yang diajarkan sesuai dengan RPS"

Kategori Komunikasi:
9. "Dosen berkomunikasi dengan sopan dan ramah"
10. "Dosen mudah dihubungi di luar jam kuliah"
11. "Dosen responsif terhadap pertanyaan mahasiswa"

Kategori Penilaian:
12. "Sistem penilaian yang diterapkan jelas dan transparan"
13. "Dosen memberikan feedback terhadap tugas/ujian"
14. "Penilaian yang diberikan objektif dan adil"

Kategori Kedisiplinan:
15. "Dosen hadir tepat waktu"
16. "Dosen memanfaatkan waktu perkuliahan dengan efektif"

VALIDATION:
- Semua pertanyaan wajib diisi sebelum submit
- Tampilkan error indicator di pertanyaan yang belum diisi
- Konfirmasi sebelum submit
- Validasi minimal 1 pertanyaan terisi sebelum bisa scroll

SUBMIT:
- Button "Kirim Evaluasi" di bottom (sticky)
- Loading state saat submit
- Konfirmasi dialog:
  "Apakah Anda yakin ingin mengirim evaluasi ini? 
   Evaluasi tidak dapat diubah setelah dikirim."
- Success message setelah submit
- Navigate back ke Home/Riwayat setelah success

STATE MANAGEMENT:
- Track answers: { questionId: value }
- Track errors: { questionId: errorMessage }
- Track komentar: string
- Calculate progress: (answeredCount / totalQuestions) * 100

UI/UX:
- Sticky header dengan info dosen
- Progress bar di atas pertanyaan
- Kategori dengan section header
- Smooth scroll
- Keyboard avoid view untuk komentar
- Loading indicator saat submit
- Disable button jika form invalid

ERROR HANDLING:
- Show toast/alert jika submit gagal
- Highlight pertanyaan yang belum diisi
- Scroll ke pertanyaan error pertama
```

**File yang perlu dibuat:**
- `src/screens/student/FormEvaluasiDosenScreen.js`
- `src/data/pertanyaanDosen.js`
- `src/services/evaluasiService.js` (untuk submit mock)

**Data Structure:**
```javascript
// pertanyaanDosen.js
export const KATEGORI_EVALUASI_DOSEN = [
  {
    id: 1,
    nama: "Penguasaan Materi",
    pertanyaan: [
      { id: 1, text: "Dosen menguasai materi dengan baik" },
      { id: 2, text: "Dosen memberikan penjelasan yang mudah dipahami" },
      // ...
    ]
  },
  // ... kategori lain
];

// Submit payload
const evaluasiData = {
  dosen_id: dosenId,
  periode_id: periodeAktif.id,
  mahasiswa_id: user.id,
  jawaban: [
    { pertanyaan_id: 1, nilai: 5 },
    { pertanyaan_id: 2, nilai: 4 },
    // ...
  ],
  komentar: "Dosen sangat baik...",
  submitted_at: new Date().toISOString()
};
```

---

## 🔄 Integration Flow Week 1

### Navigation Setup

Update `src/navigation/StudentNavigator.js`:
```javascript
import PilihDosenScreen from '../screens/student/PilihDosenScreen';
import FormEvaluasiDosenScreen from '../screens/student/FormEvaluasiDosenScreen';

// Di dalam Stack.Navigator
<Stack.Screen 
  name="PilihDosen" 
  component={PilihDosenScreen}
  options={{ title: 'Pilih Dosen' }}
/>
<Stack.Screen 
  name="FormEvaluasiDosen" 
  component={FormEvaluasiDosenScreen}
  options={{ title: 'Evaluasi Dosen' }}
/>
```

### Update HomeScreen

Tambahkan navigation ke PilihDosen saat button "Evaluasi Dosen" diklik:
```javascript
const handleEvaluasiDosen = () => {
  navigation.navigate('PilihDosen');
};
```

---

## ✅ Testing Checklist Week 1

### PilihDosenScreen
- [ ] List dosen tampil dengan benar
- [ ] Avatar dosen menampilkan initial nama
- [ ] Search bar berfungsi filter by nama
- [ ] Filter mata kuliah bekerja
- [ ] Card dosen bisa diklik
- [ ] Navigate ke form dengan data dosen yang benar
- [ ] Pull to refresh bekerja
- [ ] Loading state tampil saat fetch data
- [ ] Empty state tampil jika data kosong

### LikertScale Component
- [ ] 5 pilihan tampil dengan benar
- [ ] Label dan icon sesuai dengan nilai
- [ ] Selection bekerja dengan smooth
- [ ] Highlight selected option
- [ ] Required validation tampil
- [ ] Error message tampil dengan benar
- [ ] Responsive di berbagai screen size
- [ ] Touch target adequate (min 48x48)

### FormEvaluasiDosenScreen
- [ ] Header info dosen tampil benar
- [ ] Progress indicator update realtime
- [ ] Semua 15-16 pertanyaan tampil
- [ ] Kategori terpisah dengan jelas
- [ ] LikertScale component terintegrasi
- [ ] Komentar field bisa diisi
- [ ] Validation bekerja (semua required terisi)
- [ ] Error indicator tampil di pertanyaan kosong
- [ ] Konfirmasi submit muncul
- [ ] Submit button disabled jika invalid
- [ ] Success message tampil setelah submit
- [ ] Navigate back setelah success
- [ ] Back button confirmation jika ada perubahan
- [ ] Data tersimpan di mock storage

---

## 📦 Deliverable Week  1

### Code Files (Minimum)
1. ✅ `src/screens/student/PilihDosenScreen.js`
2. ✅ `src/screens/student/FormEvaluasiDosenScreen.js`
3. ✅ `src/components/LikertScale.js`
4. ✅ `src/services/dosenService.js`
5. ✅ `src/services/evaluasiService.js`
6. ✅ `src/data/pertanyaanDosen.js`
7. ✅ Updated `src/navigation/StudentNavigator.js`
8. ✅ Updated `src/screens/student/HomeScreen.js`

### Functionality
- ✅ Mahasiswa bisa navigasi dari Home → Pilih Dosen
- ✅ Mahasiswa bisa search & filter dosen
- ✅ Mahasiswa bisa pilih dosen → buka form
- ✅ Mahasiswa bisa isi form evaluasi (15-16 pertanyaan)
- ✅ Mahasiswa bisa submit evaluasi
- ✅ Data evaluasi tersimpan di mock storage
- ✅ Success feedback setelah submit

### Mock Data
- ✅ 8-10 dosen sample dengan data lengkap
- ✅ 15-16 pertanyaan evaluasi dalam 5 kategori
- ✅ Mock service untuk fetch dosen
- ✅ Mock service untuk submit evaluasi

---

## 🚀 Quick Start Commands

### 1. Create Component Structure
```bash
# Buat folder components jika belum ada
mkdir src/components

# Buat file-file baru
touch src/components/LikertScale.js
touch src/screens/student/PilihDosenScreen.js
touch src/screens/student/FormEvaluasiDosenScreen.js
touch src/services/dosenService.js
touch src/services/evaluasiService.js
touch src/data/pertanyaanDosen.js
```

### 2. Test Navigation
Setelah semua dibuat, test flow:
1. Buka aplikasi → Login sebagai mahasiswa
2. Di Home screen → Klik "Evaluasi Dosen"
3. Harus navigate ke PilihDosenScreen
4. Pilih salah satu dosen
5. Harus navigate ke FormEvaluasiDosenScreen dengan info dosen
6. Isi semua pertanyaan
7. Klik "Kirim Evaluasi"
8. Konfirmasi → Submit → Success message
9. Navigate back ke Home/Riwayat

---

## 💡 Tips Implementasi

### Performance
- Gunakan `FlatList` untuk list dosen (bukan map)
- Memoize LikertScale component jika perlu
- Debounce search input (300ms)
- Lazy load images jika ada foto dosen

### UX Best Practices
- Loading skeleton untuk list dosen
- Haptic feedback saat selection (optional)
- Smooth scroll to error pada validation
- Prevent double submit dengan loading state
- Auto-save draft (localStorage) - optional untuk fase 2

### Code Organization
```
src/
├── components/
│   └── LikertScale.js          # Reusable component
├── screens/student/
│   ├── PilihDosenScreen.js     # Selection screen
│   └── FormEvaluasiDosenScreen.js  # Form screen
├── services/
│   ├── dosenService.js         # Dosen API/mock
│   └── evaluasiService.js      # Evaluasi API/mock
└── data/
    └── pertanyaanDosen.js      # Question data
```

---

## 🔍 Review Points

Sebelum consider Week 1 selesai, pastikan:

1. **Functionality** ✅
   - [ ] Flow complete: Home → Pilih → Form → Submit → Success
   - [ ] All validations working
   - [ ] Data persistence (mock storage)

2. **UI/UX** ✅
   - [ ] Consistent dengan design system existing
   - [ ] Responsive & smooth
   - [ ] Loading states appropriate
   - [ ] Error messages helpful

3. **Code Quality** ✅
   - [ ] Component reusable (LikertScale)
   - [ ] Clean separation of concerns
   - [ ] Proper error handling
   - [ ] Comments untuk complex logic

4. **Performance** ✅
   - [ ] No lag saat scroll form panjang
   - [ ] Search responsive
   - [ ] Submit tidak freeze UI

---

**Estimated Time:** 12-16 hours  
**Priority:** HIGH - Core feature  
**Dependencies:** None (standalone)  
**Next:** Week 2 - Evaluasi Fasilitas (similar pattern)

---

*Ready to implement? Just copy-paste each prompt section and start coding! 🚀*
