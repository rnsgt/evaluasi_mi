const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// All routes require admin access
router.use(authMiddleware, adminMiddleware);

// Dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Total evaluasi hari ini
    const todayResult = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM evaluasi_dosen WHERE DATE(submitted_at) = $1) +
        (SELECT COUNT(*) FROM evaluasi_fasilitas WHERE DATE(submitted_at) = $1) as total
    `, [today]);

    // Total evaluasi minggu ini
    const weekAgo = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
    const weekResult = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM evaluasi_dosen WHERE DATE(submitted_at) >= $1) +
        (SELECT COUNT(*) FROM evaluasi_fasilitas WHERE DATE(submitted_at) >= $1) as total
    `, [weekAgo]);

    // Total evaluasi bulan ini
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthResult = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM evaluasi_dosen WHERE DATE(submitted_at) >= $1) +
        (SELECT COUNT(*) FROM evaluasi_fasilitas WHERE DATE(submitted_at) >= $1) as total
    `, [monthStart]);

    // Total semua evaluasi
    const totalResult = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM evaluasi_dosen) +
        (SELECT COUNT(*) FROM evaluasi_fasilitas) as total
    `);

    // Unique mahasiswa yang sudah evaluasi
    const uniqueMahasiswaResult = await db.query(`
      SELECT COUNT(DISTINCT user_id) as total FROM (
        SELECT user_id FROM evaluasi_dosen
        UNION
        SELECT user_id FROM evaluasi_fasilitas
      ) as combined
    `);

    // Total mahasiswa
    const totalMahasiswaResult = await db.query(
      "SELECT COUNT(*) as total FROM users WHERE role = 'mahasiswa'"
    );

    const uniqueMahasiswa = parseInt(uniqueMahasiswaResult.rows[0].total);
    const totalMahasiswa = parseInt(totalMahasiswaResult.rows[0].total);
    const partisipasiPersen = totalMahasiswa > 0 ? ((uniqueMahasiswa / totalMahasiswa) * 100).toFixed(1) : 0;

    // Top 5 dosen dengan rating tertinggi
    const topDosenResult = await db.query(`
      SELECT 
        d.id,
        d.nama,
        d.nip,
        COUNT(DISTINCT ed.id) as jumlah_evaluasi,
        ROUND(AVG(detail.nilai)::numeric, 2) as rata_rata
      FROM dosen d
      JOIN evaluasi_dosen ed ON d.id = ed.dosen_id
      JOIN evaluasi_detail detail ON ed.id = detail.evaluasi_dosen_id
      GROUP BY d.id, d.nama, d.nip
      HAVING COUNT(DISTINCT ed.id) >= 1
      ORDER BY rata_rata DESC
      LIMIT 5
    `);

    // Fasilitas yang perlu perbaikan (rating < 3.5)
    const fasilitasPerluPerbaikanResult = await db.query(`
      SELECT 
        f.id,
        f.nama,
        f.kategori,
        f.lokasi,
        COUNT(DISTINCT ef.id) as jumlah_evaluasi,
        ROUND(AVG(detail.nilai)::numeric, 2) as rata_rata
      FROM fasilitas f
      JOIN evaluasi_fasilitas ef ON f.id = ef.fasilitas_id
      JOIN evaluasi_detail detail ON ef.id = detail.evaluasi_fasilitas_id
      GROUP BY f.id, f.nama, f.kategori, f.lokasi
      HAVING AVG(detail.nilai) < 3.5
      ORDER BY rata_rata ASC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        evaluasiHariIni: parseInt(todayResult.rows[0].total),
        evaluasiMingguIni: parseInt(weekResult.rows[0].total),
        evaluasiBulanIni: parseInt(monthResult.rows[0].total),
        totalEvaluasi: parseInt(totalResult.rows[0].total),
        partisipasi: {
          uniqueMahasiswa,
          totalMahasiswa,
          persentase: parseFloat(partisipasiPersen)
        },
        topDosen: topDosenResult.rows,
        fasilitasPerluPerbaikan: fasilitasPerluPerbaikanResult.rows
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
});

// Laporan evaluasi dengan filter
router.get('/laporan', async (req, res) => {
  try {
    const { periode_id, tipe } = req.query;

    let laporanDosen = [];
    let laporanFasilitas = [];

    // Laporan Dosen
    if (!tipe || tipe === 'dosen' || tipe === 'semua') {
      let query = `
        SELECT 
          d.id,
          d.nama,
          d.nip,
          COUNT(DISTINCT ed.id) as jumlah_evaluasi,
          ROUND(AVG(detail.nilai)::numeric, 2) as rata_rata,
          COUNT(detail.id) as total_jawaban
        FROM dosen d
        LEFT JOIN evaluasi_dosen ed ON d.id = ed.dosen_id
        LEFT JOIN evaluasi_detail detail ON ed.id = detail.evaluasi_dosen_id
      `;
      
      const params = [];
      if (periode_id) {
        query += ' WHERE ed.periode_id = $1';
        params.push(periode_id);
      }
      
      query += ' GROUP BY d.id, d.nama, d.nip ORDER BY rata_rata DESC NULLS LAST';

      const result = await db.query(query, params);
      laporanDosen = result.rows;
    }

    // Laporan Fasilitas
    if (!tipe || tipe === 'fasilitas' || tipe === 'semua') {
      let query = `
        SELECT 
          f.id,
          f.nama,
          f.kode,
          f.kategori,
          f.lokasi,
          COUNT(DISTINCT ef.id) as jumlah_evaluasi,
          ROUND(AVG(detail.nilai)::numeric, 2) as rata_rata,
          COUNT(detail.id) as total_jawaban
        FROM fasilitas f
        LEFT JOIN evaluasi_fasilitas ef ON f.id = ef.fasilitas_id
        LEFT JOIN evaluasi_detail detail ON ef.id = detail.evaluasi_fasilitas_id
      `;
      
      const params = [];
      if (periode_id) {
        query += ' WHERE ef.periode_id = $1';
        params.push(periode_id);
      }
      
      query += ' GROUP BY f.id, f.nama, f.kode, f.kategori, f.lokasi ORDER BY rata_rata DESC NULLS LAST';

      const result = await db.query(query, params);
      laporanFasilitas = result.rows;
    }

    res.json({
      success: true,
      data: {
        dosen: laporanDosen,
        fasilitas: laporanFasilitas
      }
    });
  } catch (error) {
    console.error('Get laporan error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
});

module.exports = router;
