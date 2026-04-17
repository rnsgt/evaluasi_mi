# 🚀 QUICK START - Testing semua fitur real-time

## ✅ Status Sistem
- Backend: ✅ Port 3002 (Running)
- Database: ✅ Clean (test data removed)
- Dependencies: ✅ Installed
- Code: ✅ All fixes applied, no errors

## 📋 Test Checklist

### FASE 1: Admin Dashboard Real-time Fasilitas Score

**1. Start Expo**
```bash
cd e:\laragon\www\evaluasi_mi
npm start
```
- Accept port 8083 when prompted
- Wait for QR code to appear

**2. Login Admin**
- Account: `admin@evaluasi.com`
- Password: `password123`

**3. Verify Fasilitas Score**
- Navigate to Dashboard
- Locate "Fasilitas" score card
- Expected: Shows 4.5 (default, no data yet)
- Status: ✅ Real-time (calculated from ALL facilities)

**4. Test Real-time Update**
- Open another device/browser with student account
- Student submits facility evaluation
- Go back to admin, pull-to-refresh dashboard
- ✅ Fasilitas score updates to new average

### FASE 2: Admin Dashboard Other Scores

**1. Verify Dosen Score**
- Shows top 5 lecturers with highest ratings
- Updates real-time when new lecturer evaluations submitted
- Expected range: 0-5 stars

**2. Verify Total Statistics**
- Today evaluations: Shows count today
- Week evaluations: Shows count this week
- Month evaluations: Shows count this month
- Participation rate: Shows % of students who evaluated

### FASE 3: Student Trend Charts

**1. Navigate to Student Statistics**
- Login with: `210101001@student.ac.id` / `password123`
- Go to "Statistik" tab

**2. Verify Trend Chart**
- Locate "Tren Evaluasi" section
- Chart should show:
  - ✅ 3 colored lines (Total, Dosen, Fasilitas)
  - ✅ Filter buttons (7/14/30/90 days)
  - ✅ Summary cards (Today, Total, Average/Day)
  - ✅ Legend showing colors

**3. Test Filter Buttons**
- Click "7 Hari" → Chart updates to 7 days
- Click "14 Hari" → Chart updates to 14 days
- Click "30 Hari" → Chart updates to 30 days
- Click "90 Hari" → Chart updates to 90 days (if available)

**4. Test Real-time Updates**
- Chart currently shows no data (clean database)
- Each evaluation submitted adds new data point for that day
- Filter buttons show updated counts

### FASE 4: Evaluation Submission

**1. Submit Lecturer Evaluation**
- Go to "Evaluasi Dosen"
- Select lecturer
- Submit evaluation form

**2. Submit Facility Evaluation**
- Go to "Evaluasi Fasilitas"
- Select facility
- Submit evaluation form

**3. Verify Real-time Updates**
- Admin dashboard: Count increases, scores update
- Student dashboard: Trend chart updates

## 📊 Expected Data Flow

```
Student Submits Evaluation
    ↓
Backend stores in evaluasi_dosen or evaluasi_fasilitas
    ↓
Dashboard queries /api/admin/dashboard
    ↓
Backend calculates:
  - Total evaluations
  - Dosen average score (top 5)
  - Fasilitas average score (ALL facilities) ← NEW REAL-TIME
  - Participation rate
    ↓
Frontend displays updated scores
    ↓
Student sees updated trend chart
```

## 🔍 Verification Points

| Feature | What to Test | Expected Result |
|---------|-------------|-----------------|
| **Fasilitas Score** | Accuracy after student submits facility eval | Score updates to actual average |
| **Dosen Score** | Accuracy after student submits dosen eval | Score updates to top 5 average |
| **Trend Chart** | Line plots match daily counts | 3 lines show correct evaluation trend |
| **Filter Buttons** | Switching between 7/14/30/90 days | Chart rescales properly |
| **Real-time** | Dashboard/chart after new eval | Data updates within 3 seconds |

## 🧪 Sample Test Scenarios

### Scenario 1: First Evaluation
1. Admin checks dashboard → Fasilitas score: 4.5 (default)
2. Student submits 1 facility evaluation (rating: 5 stars)
3. Admin refreshes dashboard
4. ✅ Fasilitas score updates to: 5.0

### Scenario 2: Multiple Evaluations
1. Student 1 submits dosen eval: 4 stars
2. Student 2 submits dosen eval: 5 stars
3. Admin refreshes
4. ✅ Dosen score shows: 4.5 (average of both)

### Scenario 3: Facility Improvements
1. 5 evaluations submitted, average: 3.2
2. Admin adds "fasilitas perbaikan" section shows this facility
3. After maintenance, new evaluations average: 4.0
4. Admin refreshes
5. ✅ Fasilitas score increases to 3.6 overall

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Chart not showing | Hard refresh Expo (shake, select Reload) |
| Scores not updating | Manual refresh (pull-to-refresh or re-navigate) |
| Port conflict | Use different port (8082, 8083, 8084) |
| White screen | Check console for errors in Expo terminal |
| Import errors | All fixed, check SYSTEM_CHECK_COMPLETE.md |

## 📱 Test Devices

Recommended setup:
- **Admin Screen**: Primary device (see dashboard in real-time)
- **Student Screen**: Secondary device/browser (submit evaluations)
- **Monitor**: Watch both update simultaneously

## ⏱️ Estimated Time

- Setup Expo: 3-5 minutes
- Test each feature: 2-3 minutes
- Full smoke test: 15-20 minutes
- **Total**: ~25 minutes

## ✨ Success Criteria

- [ ] Expo starts without errors
- [ ] Admin login works
- [ ] Fasilitas score shows real-time data
- [ ] Dosen score shows real-time data
- [ ] Student trend chart loads
- [ ] Filter buttons work
- [ ] Data updates after new evaluations
- [ ] All 3 chart lines visible
- [ ] Participation rate accurate
- [ ] No console errors

---

**When all checks pass**: 🎉 System ready for FASE 2 comprehensive testing

**Last Updated**: April 17, 2026
**Status**: ✅ All systems ready
