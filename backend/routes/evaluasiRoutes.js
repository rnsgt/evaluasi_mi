const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware } = require('../middleware/authMiddleware');

// Get pernyataan dosen
router.get('/pernyataan/dosen', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM pernyataan_dosen ORDER BY urutan ASC'
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get pernyataan dosen error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
});

// Get pernyataan fasilitas
router.get('/pernyataan/fasilitas', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM pernyataan_fasilitas ORDER BY urutan ASC'
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get pernyataan fasilitas error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
});

// Submit evaluasi dosen
router.post('/dosen', authMiddleware, async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');

    const { dosen_id, mata_kuliah_id, periode_id, komentar, jawaban } = req.body;
    const user_id = req.user.id;

    // Check if already evaluated
    const checkDuplicate = await client.query(
      'SELECT id FROM evaluasi_dosen WHERE user_id = $1 AND dosen_id = $2 AND mata_kuliah_id = $3 AND periode_id = $4',
      [user_id, dosen_id, mata_kuliah_id, periode_id]
    );

    if (checkDuplicate.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Anda sudah mengevaluasi dosen ini untuk mata kuliah yang sama'
      });
    }

    // Insert evaluasi dosen
    const evaluasiResult = await client.query(
      `INSERT INTO evaluasi_dosen (user_id, dosen_id, mata_kuliah_id, periode_id, komentar, status) 
       VALUES ($1, $2, $3, $4, $5, 'submitted') 
       RETURNING id`,
      [user_id, dosen_id, mata_kuliah_id, periode_id, komentar || null]
    );

    const evaluasi_id = evaluasiResult.rows[0].id;

    // Insert jawaban (evaluasi_detail)
    for (const item of jawaban) {
      await client.query(
        `INSERT INTO evaluasi_detail (evaluasi_dosen_id, pernyataan_dosen_id, nilai) 
         VALUES ($1, $2, $3)`,
        [evaluasi_id, item.pernyataan_id, item.nilai]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Evaluasi dosen berhasil disimpan',
      data: { evaluasi_id }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Submit evaluasi dosen error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  } finally {
    client.release();
  }
});

// Submit evaluasi fasilitas
router.post('/fasilitas', authMiddleware, async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');

    const { fasilitas_id, periode_id, komentar, jawaban } = req.body;
    const user_id = req.user.id;

    // Check if already evaluated
    const checkDuplicate = await client.query(
      'SELECT id FROM evaluasi_fasilitas WHERE user_id = $1 AND fasilitas_id = $2 AND periode_id = $3',
      [user_id, fasilitas_id, periode_id]
    );

    if (checkDuplicate.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Anda sudah mengevaluasi fasilitas ini'
      });
    }

    // Insert evaluasi fasilitas
    const evaluasiResult = await client.query(
      `INSERT INTO evaluasi_fasilitas (user_id, fasilitas_id, periode_id, komentar, status) 
       VALUES ($1, $2, $3, $4, 'submitted') 
       RETURNING id`,
      [user_id, fasilitas_id, periode_id, komentar || null]
    );

    const evaluasi_id = evaluasiResult.rows[0].id;

    // Insert jawaban (evaluasi_detail)
    for (const item of jawaban) {
      await client.query(
        `INSERT INTO evaluasi_detail (evaluasi_fasilitas_id, pernyataan_fasilitas_id, nilai) 
         VALUES ($1, $2, $3)`,
        [evaluasi_id, item.pernyataan_id, item.nilai]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Evaluasi fasilitas berhasil disimpan',
      data: { evaluasi_id }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Submit evaluasi fasilitas error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  } finally {
    client.release();
  }
});

// Get riwayat evaluasi mahasiswa
router.get('/riwayat', authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.id;

    // Get evaluasi dosen
    const dosenResult = await db.query(`
      SELECT 
        ed.id,
        ed.submitted_at,
        ed.komentar,
        ed.status,
        COUNT(detail.id) as jumlah_jawaban,
        d.nama as dosen_nama,
        d.nip as dosen_nip,
        mk.nama as mata_kuliah_nama,
        mk.kode as mata_kuliah_kode,
        p.nama as periode_nama,
        'DOSEN' as type
      FROM evaluasi_dosen ed
      JOIN dosen d ON ed.dosen_id = d.id
      JOIN mata_kuliah mk ON ed.mata_kuliah_id = mk.id
      JOIN periode_evaluasi p ON ed.periode_id = p.id
      LEFT JOIN evaluasi_detail detail ON ed.id = detail.evaluasi_dosen_id
      WHERE ed.user_id = $1
      GROUP BY ed.id, ed.submitted_at, ed.komentar, ed.status, d.nama, d.nip, mk.nama, mk.kode, p.nama
      ORDER BY ed.submitted_at DESC
    `, [user_id]);

    // Get evaluasi fasilitas
    const fasilitasResult = await db.query(`
      SELECT 
        ef.id,
        ef.submitted_at,
        ef.komentar,
        ef.status,
        COUNT(detail.id) as jumlah_jawaban,
        f.nama as fasilitas_nama,
        f.kode as fasilitas_kode,
        f.kategori as fasilitas_kategori,
        f.lokasi as fasilitas_lokasi,
        p.nama as periode_nama,
        'FASILITAS' as type
      FROM evaluasi_fasilitas ef
      JOIN fasilitas f ON ef.fasilitas_id = f.id
      JOIN periode_evaluasi p ON ef.periode_id = p.id
      LEFT JOIN evaluasi_detail detail ON ef.id = detail.evaluasi_fasilitas_id
      WHERE ef.user_id = $1
      GROUP BY ef.id, ef.submitted_at, ef.komentar, ef.status, f.nama, f.kode, f.kategori, f.lokasi, p.nama
      ORDER BY ef.submitted_at DESC
    `, [user_id]);

    // Combine and sort by date
    const allEvaluasi = [...dosenResult.rows, ...fasilitasResult.rows]
      .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

    res.json({
      success: true,
      data: allEvaluasi
    });
  } catch (error) {
    console.error('Get riwayat error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
});

// Get statistik mahasiswa
router.get('/statistik', authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.id;

    // Count evaluasi dosen
    const dosenCount = await db.query(
      'SELECT COUNT(*) as total FROM evaluasi_dosen WHERE user_id = $1',
      [user_id]
    );

    // Count evaluasi fasilitas
    const fasilitasCount = await db.query(
      'SELECT COUNT(*) as total FROM evaluasi_fasilitas WHERE user_id = $1',
      [user_id]
    );

    // Get active periode
    const periodeResult = await db.query(
      "SELECT nama FROM periode_evaluasi WHERE status = 'aktif' LIMIT 1"
    );

    const totalDosen = parseInt(dosenCount.rows[0].total);
    const totalFasilitas = parseInt(fasilitasCount.rows[0].total);
    const totalEvaluasi = totalDosen + totalFasilitas;

    // Achievement
    let achievement = null;
    if (totalEvaluasi >= 10) {
      achievement = {
        text: 'Super Aktif! 🌟',
        icon: 'trophy',
        color: '#FFD700'
      };
    } else if (totalEvaluasi >= 5) {
      achievement = {
        text: 'Partisipasi Baik 👍',
        icon: 'medal',
        color: '#4CAF50'
      };
    } else if (totalEvaluasi > 0) {
      achievement = {
        text: 'Terus Tingkatkan! 💪',
        icon: 'star',
        color: '#2196F3'
      };
    }

    res.json({
      success: true,
      data: {
        totalEvaluasi,
        totalDosen,
        totalFasilitas,
        periodeAktif: periodeResult.rows[0]?.nama || 'Tidak ada periode aktif',
        achievement
      }
    });
  } catch (error) {
    console.error('Get statistik error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
});

module.exports = router;
