# Chart Testing Guide - Real-time Evaluation Trends

## 📊 Implementation Overview

The real-time evaluation trend charts have been successfully implemented to show daily evaluation submissions across multiple time periods.

### What Was Implemented

1. **Backend Endpoint**: `GET /api/admin/daily-trend?days=7|14|30|90`
   - Aggregates daily evaluation submissions by type (Total, Dosen, Fasilitas)
   - Returns chart-formatted data with labels, line datasets, and raw data
   - Supports time ranges: 7, 14, 30, 90 days

2. **Frontend Component**: `src/components/TrendChart.js`
   - LineChart visualization using react-native-chart-kit
   - Interactive filter buttons for time range selection
   - Three color-coded lines (Total=Blue, Dosen=Light Blue, Fasilitas=Green)
   - Summary statistics cards (Today, Total, Average/Day)
   - Automatic date label scaling for readability

3. **Integration**: `src/screens/student/StatistikScreen.js`
   - New "Tren Evaluasi" section in student dashboard
   - Loads real-time data from backend
   - Updates when filter buttons are clicked

## ✅ Quick Verification Checklist

### 1. Backend Verification

```bash
# Check if backend is running
netstat -ano | findstr :3002
# Expected output: TCP 0.0.0.0:3002 LISTENING

# Check if Expo is running (separate terminal)
npm start
```

### 2. Frontend Testing in Expo

**Step 1: Launch Expo**
```bash
cd e:\laragon\www\evaluasi_mi
npm start
```

**Step 2: Login as Student**
- Account: `210101001@student.ac.id`
- Password: `password123`

**Step 3: Navigate to Statistics**
- Tap "Statistik" tab at the bottom navigation
- Wait for data to load (~2-3 seconds)

**Step 4: Verify "Tren Evaluasi" Section**
- Locate "Tren Evaluasi" section (between progress cards and bar chart)
- Verify chart is rendering without errors

### 3. Chart Interaction Tests

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **Initial Load** | Nav to Statistik, wait 3s | Chart loads with 7-day data |
| **Filter 7 Days** | Click "7 Hari" button | Chart shows 7 days of data |
| **Filter 14 Days** | Click "14 Hari" button | Chart updates to 14 days |
| **Filter 30 Days** | Click "30 Hari" button | Chart updates to 30 days |
| **Filter 90 Days** | Click "90 Hari" button | Chart updates to 90 days (if available) |
| **Legend Visibility** | Observe chart area | Three colors shown: Total (blue), Dosen (light blue), Fasilitas (green) |
| **Summary Stats** | Observe below chart | Shows: Today's count, Total evaluations, Average/day |
| **Empty State** | If no data | Shows "Belum ada data evaluasi" message |
| **Loading State** | During initial load | Shows spinner with "Memuat grafik tren..." |

### 4. Data Verification

Check that displayed data makes sense:
- **Today's Count**: Should match total evaluations submitted today
- **Total**: Should be sum of all evaluations in selected period
- **Average**: Should be Total ÷ number of days in period
- **Three Lines**: 
  - Total line should always be ≥ Dosen + Fasilitas
  - Each line should never decrease (cumulative date-by-date)

### 5. Real-time Testing

To test real-time updates:

1. **In Expo Terminal**:
   - Leave app running on StatistikScreen
   - Observe chart with current data

2. **Submit New Evaluation**:
   - Open another student account in browser
   - Complete evaluation for today's date
   - Go back to Expo app
   - Click same day range filter (to refresh)
   - Verify today's evaluation count increased

3. **Verify Real-time**:
   - Check if today's value changes after submission
   - Verify chart line updates immediately or after manual refresh

## 🔧 Troubleshooting

### Chart Not Appearing

**Symptom**: White/blank area where chart should be

**Solutions**:
1. Check console for errors: `npm start` output should show no red errors
2. Verify backend is running: `netstat -ano | findstr :3002`
3. Verify authentication token is valid (should see log line starting with "[statsService] Fetching daily trend")
4. Hard refresh in Expo (shake device, select "Reload")

### Chart Shows Empty State

**Symptom**: "Belum ada data evaluasi" message

**Solutions**:
1. Verify database has evaluasi_detail records for selected date range
2. Check that evaluations were submitted today or in selected range
3. Verify submitted_at dates in database are recent

### Filter Buttons Not Responsive

**Symptom**: Clicking buttons doesn't update chart

**Solutions**:
1. Check Expo logs for errors
2. Verify React Native state management (TrendChart should have selectedDays state)
3. Check if API calls are being made (look for console logs)

### Summary Stats Not Showing

**Symptom**: Cards below chart don't appear

**Solutions**:
1. Verify rawData is being returned from backend
2. Check TrendChart component conditionally renders SummaryCard
3. Ensure chartData.rawData is not empty

## 📋 Development Commands

```bash
# Start development
cd e:\laragon\www\evaluasi_mi
npm start

# Start backend (separate terminal)
cd backend
npm start

# Run all tests (once implementation verified)
npm test

# Check logs
npm start  # Watch for [statsService] and [TrendChart] logs
```

## 🎯 Expected Performance

- **Initial Chart Load**: ~2-3 seconds
- **Filter Button Response**: <100ms
- **Data points rendered**: ~7 visible on screen (auto-scaled)
- **Horizontal scroll**: Enabled for 30/90 day ranges

## ✨ Features Included

✅ Real-time daily evaluation aggregation
✅ Multiple time range filters (7/14/30/90 days)
✅ Three-line visualization (Total/Dosen/Fasilitas)
✅ Color-coded legend
✅ Summary statistics (Today/Total/Average)
✅ Loading and empty states
✅ Responsive design with horizontal scroll
✅ Date label auto-scaling
✅ Bezier curve interpolation

## 📱 User Experience

Students can now see:
1. **How many evaluations** have been submitted today
2. **Trend over time** for the selected period
3. **Breakdown by type**: Evaluasi Dosen vs Evaluasi Fasilitas
4. **Summary statistics**: Today's count, total count, and daily average

This helps students understand:
- The evaluation participation trend
- When to expect more peer evaluations
- Overall engagement in the system

---

**Status**: ✅ Implementation Complete - Ready for Testing
**Last Updated**: April 17, 2026
**Test Priority**: HIGH - Charts must work before FASE 2 testing begins
