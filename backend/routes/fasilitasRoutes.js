const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Get all fasilitas
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM fasilitas
      ORDER BY kategori, nama ASC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get fasilitas error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
});

// Create fasilitas (Admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { kode, nama, kategori, lokasi, kapasitas } = req.body;

    if (!kode || !nama || !kategori) {
      return res.status(400).json({
        success: false,
        message: 'Kode, nama, dan kategori wajib diisi'
      });
    }

    const result = await db.query(
      `INSERT INTO fasilitas (kode, nama, kategori, lokasi, kapasitas)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        String(kode).toUpperCase().trim(),
        String(nama).trim(),
        String(kategori).trim(),
        lokasi ? String(lokasi).trim() : null,
        kapasitas ? parseInt(kapasitas, 10) : null,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Fasilitas berhasil ditambahkan',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create fasilitas error:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Kode fasilitas sudah digunakan'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
});

// Get fasilitas by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM fasilitas WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Fasilitas tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get fasilitas by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
});

// Update fasilitas (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { kode, nama, kategori, lokasi, kapasitas } = req.body;

    const existing = await db.query('SELECT id FROM fasilitas WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Fasilitas tidak ditemukan'
      });
    }

    const result = await db.query(
      `UPDATE fasilitas
       SET kode = $1,
           nama = $2,
           kategori = $3,
           lokasi = $4,
           kapasitas = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [
        kode ? String(kode).toUpperCase().trim() : null,
        nama ? String(nama).trim() : null,
        kategori ? String(kategori).trim() : null,
        lokasi ? String(lokasi).trim() : null,
        kapasitas ? parseInt(kapasitas, 10) : null,
        id,
      ]
    );

    res.json({
      success: true,
      message: 'Fasilitas berhasil diperbarui',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update fasilitas error:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Kode fasilitas sudah digunakan'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
});

// Delete fasilitas (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM fasilitas WHERE id = $1 RETURNING id, nama',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Fasilitas tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: `Fasilitas "${result.rows[0].nama}" berhasil dihapus`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Delete fasilitas error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
});

module.exports = router;
