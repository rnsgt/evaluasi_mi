# 🔧 PERBAIKAN: Error saat Submit Evaluasi (HTTP 500)

## 📊 Masalah

Error terjadi ketika mahasiswa mencoba submit evaluasi fasilitas atau dosen:

```
❌ ERROR | [api] Response error for URL: /evaluasi/fasilitas
❌ ERROR | [api] HTTP Error - Status: 500 Message: "Terjadi kesalahan pada server"
❌ ERROR | Submit evaluasi fasilitas error: {...}
```

**Status Code:** HTTP 500 Internal Server Error  
**Endpoint:** `/api/evaluasi/fasilitas` atau `/api/evaluasi/dosen`  
**Akibat:** User tidak bisa submit evaluasi, pesan error tidak informatif

---

## 🔍 Root Cause Analysis

### Masalah 1: Input Validation Tidak Ada ❌
Backend tidak memvalidasi input data sebelum proses:
- Tidak check apakah `fasilitas_id`, `periode_id`, `jawaban` ada
- Tidak check tipe data (integer/decimal/string mismatch)
- Tidak check range nilai (1-5 untuk Likert scale)

**Akibat:**  
- Invalid data directly passes to database → constraint violation
- Error dari database tidak clear atau tidak helpful
- Tidak bisa distinguish antara bad request vs server error

### Masalah 2: Foreign Key Validation Tidak Ada ❌
Backend tidak check apakah reference ID valid:
- Tidak verify `fasilitas_id` exists di tabel fasilitas
- Tidak verify `periode_id` exists di tabel periode_evaluasi
- Tidak verify `pernyataan_id` exists di tabel pernyataan_fasilitas
- Tidak verify periode status = 'aktif'

**Akibat:**  
- Prisma error (foreign key constraint) → 500 error
- User tidak tahu apa yang salah

### Masalah 3: Type Casting Tidak Konsisten ❌
Data dari frontend bisa berupa string/number/mixed type:
- `fasilitas_id: "1"` (string) vs `fasilitas_id: 1` (int)
- `nilai: "5"` vs `nilai: 5`
- Type mismatch dengan database schema

**Akibat:**  
- Prisma query error → 500 error
- Database constraint violation

### Masalah 4: Error Logging Tidak Informatif ❌
Error message generic: "Terjadi kesalahan pada server"
- User tidak tahu kenapa evaluasi tidak bisa di-submit
- Developer sulit debug tanpa detailed logs

---

## ✅ SOLUSI DITERAPKAN

### Perbaikan 1: Input Validation (✅ DONE)

**File:** `backend/routes/evaluasiRoutes.js`

#### Endpoint: POST `/api/evaluasi/fasilitas`

```javascript
// ✅ Validate input completeness
if (!fasilitas_id || !periode_id || !jawaban || 
    !Array.isArray(jawaban) || jawaban.length === 0) {
  return res.status(400).json({
    success: false,
    message: 'Data tidak lengkap. Diperlukan: fasilitas_id, periode_id, dan jawaban (array)'
  });
}

// ✅ Validate each jawaban item
for (const item of jawaban) {
  if (!item.pernyataan_id || item.nilai === undefined || item.nilai === null) {
    return res.status(400).json({
      success: false,
      message: 'Setiap jawaban harus memiliki pernyataan_id dan nilai'
    });
  }
  
  // ✅ Validate integer type
  if (!Number.isInteger(item.nilai)) {
    return res.status(400).json({
      success: false,
      message: 'Nilai harus berupa bilangan bulat'
    });
  }
  
  // ✅ Validate value range (Likert scale 1-5)
  if (item.nilai < 1 || item.nilai > 5) {
    return res.status(400).json({
      success: false,
      message: 'Nilai harus antara 1-5'
    });
  }
}
```

### Perbaikan 2: Foreign Key Validation (✅ DONE)

```javascript
// ✅ Validate fasilitas exists
const fasilitas = await prisma.fasilitas.findUnique({
  where: { id: parseInt(fasilitas_id) }
});
if (!fasilitas) {
  return res.status(404).json({
    success: false,
    message: `Fasilitas dengan ID ${fasilitas_id} tidak ditemukan`
  });
}

// ✅ Validate periode exists and aktif
const periode = await prisma.periode_evaluasi.findUnique({
  where: { id: parseInt(periode_id) }
});
if (!periode) {
  return res.status(404).json({
    success: false,
    message: `Periode dengan ID ${periode_id} tidak ditemukan`
  });
}
if (periode.status !== 'aktif') {
  return res.status(400).json({
    success: false,
    message: `Periode ${periode.nama} tidak dalam status aktif`
  });
}

// ✅ Validate all pernyataan_id exists
const pernyataanIds = jawaban.map(j => parseInt(j.pernyataan_id));
const pernyataanCount = await prisma.pernyataan_fasilitas.count({
  where: { id: { in: pernyataanIds } }
});
if (pernyataanCount !== pernyataanIds.length) {
  return res.status(404).json({
    success: false,
    message: 'Beberapa pernyataan tidak ditemukan'
  });
}
```

### Perbaikan 3: Proper Type Casting (✅ DONE)

```javascript
// ✅ Explicit type conversion
const evaluasi = await tx.evaluasi_fasilitas.create({
  data: {
    user_id,
    fasilitas_id: parseInt(fasilitas_id),      // ← parseInt
    periode_id: parseInt(periode_id),          // ← parseInt
    komentar: komentar ? String(komentar).trim() : null,  // ← trim
    status: 'submitted'
  }
});

// ✅ Type cast dalam detail
await tx.evaluasi_detail.createMany({
  data: jawaban.map(item => ({
    evaluasi_fasilitas_id: evaluasi.id,
    pernyataan_fasilitas_id: parseInt(item.pernyataan_id),  // ← parseInt
    nilai: parseInt(item.nilai)                             // ← parseInt
  }))
});
```

### Perbaikan 4: Better Error Logging (✅ DONE)

```javascript
// ✅ Detailed error logging for development
console.error('Full error details:', {
  message: error.message,
  code: error.code,
  meta: error.meta,
  stack: error.stack
});

// ✅ Different error responses based on error type
if (error.message.includes('sudah mengevaluasi')) {
  return res.status(400).json({
    success: false,
    message: error.message
  });
}

res.status(500).json({
  success: false,
  message: 'Terjadi kesalahan pada server',
  ...(process.env.NODE_ENV === 'development' && { error: error.message })
});
```

---

## 📝 Error Response Examples

### ✅ Before (Tidak Informatif)
```json
{
  "success": false,
  "message": "Terjadi kesalahan pada server"
}
```
Status: 500 → User bingung apa error-nya!

### ✅ After (Informatif)

**Missing Data:**
```json
{
  "success": false,
  "message": "Data tidak lengkap. Diperlukan: fasilitas_id, periode_id, dan jawaban (array)"
}
```
Status: 400 → User tahu data apa yang kurang!

**Invalid Fasilitas ID:**
```json
{
  "success": false,
  "message": "Fasilitas dengan ID 999 tidak ditemukan"
}
```
Status: 404 → User tahu fasilitas tidak ada!

**Invalid Nilai:**
```json
{
  "success": false,
  "message": "Nilai harus antara 1-5"
}
```
Status: 400 → User tahu range nilai yang valid!

**Periode Not Active:**
```json
{
  "success": false,
  "message": "Periode Evaluasi Gasal 2024/2025 tidak dalam status aktif"
}
```
Status: 400 → User tahu periode-nya tidak aktif!

**Already Evaluated:**
```json
{
  "success": false,
  "message": "Anda sudah mengevaluasi fasilitas ini"
}
```
Status: 400 → Duplicate submission warning!

---

## 🧪 Testing Steps

### Test 1: Valid Submission ✅
```
1. Login as mahasiswa: 210101001 / password123
2. Navigate to evaluasi fasilitas
3. Fill all pertanyaan dengan nilai 1-5
4. Add komentar (optional)
5. Click "Kirim"
6. Expected: ✅ "Evaluasi fasilitas berhasil disimpan"
```

### Test 2: Invalid Periode ⚠️
```
1. Change periode_id to 999 (non-existent)
2. Try submit
3. Expected: ❌ "Periode dengan ID 999 tidak ditemukan"
```

### Test 3: Invalid Nilai ⚠️
```
1. Manually modify nilai to 10 (out of range)
2. Try submit
3. Expected: ❌ "Nilai harus antara 1-5"
```

### Test 4: Duplicate Submission ⚠️
```
1. Submit evaluasi fasilitas pertama kali
2. Expected: ✅ Berhasil
3. Try submit lagi untuk fasilitas yang sama
4. Expected: ❌ "Anda sudah mengevaluasi fasilitas ini"
```

---

## 📊 API Endpoints Affected

| Endpoint | Method | Perbaikan |
|----------|--------|-----------|
| `/api/evaluasi/fasilitas` | POST | ✅ Added comprehensive validation |
| `/api/evaluasi/dosen` | POST | ✅ Added comprehensive validation |
| `/api/evaluasi/pernyataan/fasilitas` | GET | No change (read-only) |
| `/api/evaluasi/pernyataan/dosen` | GET | No change (read-only) |
| `/api/evaluasi/riwayat` | GET | No change (read-only) |

---

## 🚀 Next Steps

1. **Restart backend server** untuk load changes:
   ```bash
   npm run dev
   ```

2. **Clear frontend cache** (Expo/app):
   - Close app completely
   - Clear app cache if available
   - Restart app

3. **Test submit evaluasi** dengan flow lengkap

4. **Monitor backend logs** untuk:
   - "Full error details" messages (untuk debugging)
   - Successful submissions
   - Any new error patterns

---

## 🎓 Key Takeaways

### Lessons Learned

1. **Always validate input** before processing
   - Check completeness: required fields exist
   - Check types: match database schema
   - Check ranges: values within acceptable bounds

2. **Validate foreign keys** before create/update
   - Check reference IDs exist
   - Check related status (periode aktif, user role, etc.)

3. **Use explicit type casting**
   - Don't rely on implicit conversion
   - Use parseInt(), String(), etc.
   - Trim whitespace untuk string fields

4. **Provide detailed error messages**
   - Different status codes untuk different error types
   - Include specific details (ID, field name, range)
   - Make it actionable for users

5. **Log errors thoroughly**
   - Include error code, message, and stack
   - Distinguish between development vs production
   - Make debugging easier untuk developer

---

## 📁 Files Modified

- `backend/routes/evaluasiRoutes.js`
  - Endpoint: `POST /api/evaluasi/fasilitas` (lines 115-240)
  - Endpoint: `POST /api/evaluasi/dosen` (lines 53-180)

---

**Status: ✅ Ready for Testing**

Perbaikan sudah diterapkan. Silakan test submit evaluasi lagi dan report jika ada issue lebih lanjut.

