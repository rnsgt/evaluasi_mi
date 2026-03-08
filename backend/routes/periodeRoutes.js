const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Get active periode
router.get('/active', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM periode_evaluasi WHERE status = 'aktif' LIMIT 1"
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tidak ada periode evaluasi aktif'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get active periode error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
});

// Get all periode (Admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM periode_evaluasi ORDER BY tanggal_mulai DESC'
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get periode error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
});

// Create periode (Admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { nama, tahun_ajaran, semester, tanggal_mulai, tanggal_akhir, batas_evaluasi, keterangan } = req.body;

    const result = await db.query(
      `INSERT INTO periode_evaluasi 
       (nama, tahun_ajaran, semester, tanggal_mulai, tanggal_akhir, batas_evaluasi, keterangan) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [nama, tahun_ajaran, semester, tanggal_mulai, tanggal_akhir, batas_evaluasi, keterangan]
    );

    res.status(201).json({
      success: true,
      message: 'Periode berhasil dibuat',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create periode error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
});

// Update periode (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, tahun_ajaran, semester, tanggal_mulai, tanggal_akhir, batas_evaluasi, keterangan, status } = req.body;

    const result = await db.query(
      `UPDATE periode_evaluasi 
       SET nama = $1, tahun_ajaran = $2, semester = $3, tanggal_mulai = $4, 
           tanggal_akhir = $5, batas_evaluasi = $6, keterangan = $7, status = $8,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [nama, tahun_ajaran, semester, tanggal_mulai, tanggal_akhir, batas_evaluasi, keterangan, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Periode tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Periode berhasil diupdate',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update periode error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
});

// Activate periode (Admin only)
router.put('/:id/activate', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Deactivate all other periods first
    await db.query("UPDATE periode_evaluasi SET status = 'tidak_aktif'");

    // Activate selected period
    const result = await db.query(
      "UPDATE periode_evaluasi SET status = 'aktif', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Periode tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Periode berhasil diaktifkan',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Activate periode error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
});

// Delete periode (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if it's active
    const checkResult = await db.query(
      "SELECT status FROM periode_evaluasi WHERE id = $1",
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Periode tidak ditemukan'
      });
    }

    if (checkResult.rows[0].status === 'aktif') {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menghapus periode yang sedang aktif'
      });
    }

    await db.query('DELETE FROM periode_evaluasi WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Periode berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete periode error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
});

module.exports = router;
