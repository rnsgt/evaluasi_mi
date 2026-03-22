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

    // Evaluasi per type
    const evaluasiDosenCount = await db.query('SELECT COUNT(*) as total FROM evaluasi_dosen');
    const evaluasiFasilitasCount = await db.query('SELECT COUNT(*) as total FROM evaluasi_fasilitas');

    // Get active periode (if any) to calculate participation more realistically
    const activePeriodeResult = await db.query(
      "SELECT id, nama FROM periode_evaluasi WHERE status = 'aktif' LIMIT 1"
    );

    let uniqueMahasiswaResult;
    let activePeriodeId = null;
    let activePeriodeNama = null;

    if (activePeriodeResult.rows.length > 0) {
      activePeriodeId = activePeriodeResult.rows[0].id;
      activePeriodeNama = activePeriodeResult.rows[0].nama;

      uniqueMahasiswaResult = await db.query(
        `SELECT COUNT(DISTINCT user_id) as total FROM (
           SELECT user_id FROM evaluasi_dosen WHERE periode_id = $1
           UNION
           SELECT user_id FROM evaluasi_fasilitas WHERE periode_id = $1
         ) as combined`,
        [activePeriodeId]
      );
    } else {
      uniqueMahasiswaResult = await db.query(`
        SELECT COUNT(DISTINCT user_id) as total FROM (
          SELECT user_id FROM evaluasi_dosen
          UNION
          SELECT user_id FROM evaluasi_fasilitas
        ) as combined
      `);
    }

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
        evaluasiDosen: parseInt(evaluasiDosenCount.rows[0].total),
        evaluasiFasilitas: parseInt(evaluasiFasilitasCount.rows[0].total),
        partisipasi: {
          uniqueMahasiswa,
          totalMahasiswa,
          persentase: parseFloat(partisipasiPersen),
          periodeId: activePeriodeId,
          periodeNama: activePeriodeNama
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
          COUNT(detail.id) as total_jawaban,
          COALESCE(
            jsonb_agg(
              DISTINCT jsonb_build_object(
                'komentar', ed.komentar,
                'submitted_at', ed.submitted_at
              )
            ) FILTER (WHERE ed.komentar IS NOT NULL AND TRIM(ed.komentar) <> ''),
            '[]'::jsonb
          ) as komentar_list
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
      
      // Add detail per kategori for each dosen
      for (const item of laporanDosen) {
        const detailParams = [item.id];
        let detailWherePeriode = '';

        if (periode_id) {
          detailWherePeriode = ' AND ed.periode_id = $2';
          detailParams.push(periode_id);
        }

        const detailResult = await db.query(
          `SELECT
             pd.kategori,
             ROUND(AVG(detail.nilai)::numeric, 2) as rata_rata,
             COUNT(detail.id) as total_jawaban
           FROM evaluasi_dosen ed
           JOIN evaluasi_detail detail ON ed.id = detail.evaluasi_dosen_id
           JOIN pernyataan_dosen pd ON detail.pernyataan_dosen_id = pd.id
           WHERE ed.dosen_id = $1${detailWherePeriode}
           GROUP BY pd.kategori
           ORDER BY pd.kategori ASC`,
          detailParams
        );

        item.detail_kategori = detailResult.rows;

        const evaluasiDetailResult = await db.query(
          `SELECT
             ed.id,
             ed.submitted_at,
             COALESCE(ed.komentar, '') as komentar,
             u.nama as mahasiswa_nama,
             u.nim as mahasiswa_nim,
             ROUND(AVG(detail.nilai)::numeric, 2) as rata_rata,
             COUNT(detail.id) as jumlah_jawaban
           FROM evaluasi_dosen ed
           JOIN users u ON ed.user_id = u.id
           LEFT JOIN evaluasi_detail detail ON ed.id = detail.evaluasi_dosen_id
           WHERE ed.dosen_id = $1${detailWherePeriode}
           GROUP BY ed.id, u.nama, u.nim
           ORDER BY ed.submitted_at DESC`,
          detailParams
        );

        item.detail_evaluasi = evaluasiDetailResult.rows;
      }
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
          COUNT(detail.id) as total_jawaban,
          COALESCE(
            jsonb_agg(
              DISTINCT jsonb_build_object(
                'komentar', ef.komentar,
                'submitted_at', ef.submitted_at
              )
            ) FILTER (WHERE ef.komentar IS NOT NULL AND TRIM(ef.komentar) <> ''),
            '[]'::jsonb
          ) as komentar_list
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
      
      // Add detail per kategori for each fasilitas
      for (const item of laporanFasilitas) {
        const detailParams = [item.id];
        let detailWherePeriode = '';

        if (periode_id) {
          detailWherePeriode = ' AND ef.periode_id = $2';
          detailParams.push(periode_id);
        }

        const detailResult = await db.query(
          `SELECT
             pf.kategori,
             ROUND(AVG(detail.nilai)::numeric, 2) as rata_rata,
             COUNT(detail.id) as total_jawaban
           FROM evaluasi_fasilitas ef
           JOIN evaluasi_detail detail ON ef.id = detail.evaluasi_fasilitas_id
           JOIN pernyataan_fasilitas pf ON detail.pernyataan_fasilitas_id = pf.id
           WHERE ef.fasilitas_id = $1${detailWherePeriode}
           GROUP BY pf.kategori
           ORDER BY pf.kategori ASC`,
          detailParams
        );

        item.detail_kategori = detailResult.rows;

        const evaluasiDetailResult = await db.query(
          `SELECT
             ef.id,
             ef.submitted_at,
             COALESCE(ef.komentar, '') as komentar,
             u.nama as mahasiswa_nama,
             u.nim as mahasiswa_nim,
             ROUND(AVG(detail.nilai)::numeric, 2) as rata_rata,
             COUNT(detail.id) as jumlah_jawaban
           FROM evaluasi_fasilitas ef
           JOIN users u ON ef.user_id = u.id
           LEFT JOIN evaluasi_detail detail ON ef.id = detail.evaluasi_fasilitas_id
           WHERE ef.fasilitas_id = $1${detailWherePeriode}
           GROUP BY ef.id, u.nama, u.nim
           ORDER BY ef.submitted_at DESC`,
          detailParams
        );

        item.detail_evaluasi = evaluasiDetailResult.rows;
      }
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
