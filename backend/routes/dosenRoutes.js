const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware } = require('../middleware/authMiddleware');

// Get all dosen with mata kuliah
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        d.id,
        d.nip,
        d.nama,
        d.email,
        d.foto,
        json_agg(
          json_build_object(
            'id', mk.id,
            'kode', mk.kode,
            'nama', mk.nama,
            'sks', mk.sks,
            'semester', mk.semester
          )
        ) FILTER (WHERE mk.id IS NOT NULL) as mata_kuliah
      FROM dosen d
      LEFT JOIN mata_kuliah mk ON d.id = mk.dosen_id
      GROUP BY d.id, d.nip, d.nama, d.email, d.foto
      ORDER BY d.nama ASC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get dosen error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
});

// Get dosen by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      SELECT 
        d.*,
        json_agg(
          json_build_object(
            'id', mk.id,
            'kode', mk.kode,
            'nama', mk.nama,
            'sks', mk.sks,
            'semester', mk.semester
          )
        ) FILTER (WHERE mk.id IS NOT NULL) as mata_kuliah
      FROM dosen d
      LEFT JOIN mata_kuliah mk ON d.id = mk.dosen_id
      WHERE d.id = $1
      GROUP BY d.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dosen tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get dosen by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
});

module.exports = router;
