const express = require('express');
const router = express.Router();
const { prisma } = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// All routes require admin access
router.use(authMiddleware, adminMiddleware);

// Dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Total evaluasi hari ini
    const todayResult = await prisma.$queryRaw`
      SELECT 
        (SELECT COUNT(*) FROM evaluasi_dosen WHERE DATE(submitted_at) = ${today}::date) +
        (SELECT COUNT(*) FROM evaluasi_fasilitas WHERE DATE(submitted_at) = ${today}::date) as total
    `;

    // Total evaluasi minggu ini
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const weekResult = await prisma.$queryRaw`
      SELECT 
        (SELECT COUNT(*) FROM evaluasi_dosen WHERE DATE(submitted_at) >= ${weekAgo}::date) +
        (SELECT COUNT(*) FROM evaluasi_fasilitas WHERE DATE(submitted_at) >= ${weekAgo}::date) as total
    `;

    // Total evaluasi bulan ini
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthResult = await prisma.$queryRaw`
      SELECT 
        (SELECT COUNT(*) FROM evaluasi_dosen WHERE DATE(submitted_at) >= ${monthStart}::date) +
        (SELECT COUNT(*) FROM evaluasi_fasilitas WHERE DATE(submitted_at) >= ${monthStart}::date) as total
    `;

    // Total semua evaluasi
    const totalResult = await prisma.$queryRaw`
      SELECT 
        (SELECT COUNT(*) FROM evaluasi_dosen) +
        (SELECT COUNT(*) FROM evaluasi_fasilitas) as total
    `;

    // Evaluasi per type
    const evaluasiDosenCount = await prisma.evaluasi_dosen.count();
    const evaluasiFasilitasCount = await prisma.evaluasi_fasilitas.count();

    // Get active periode (if any)
    const activePeriode = await prisma.periode_evaluasi.findFirst({
      where: { status: 'aktif' },
      select: { id: true, nama: true }
    });

    let uniqueMahasiswaCount = 0;
    let activePeriodeId = null;
    let activePeriodeNama = null;

    if (activePeriode) {
      activePeriodeId = activePeriode.id;
      activePeriodeNama = activePeriode.nama;

      // Get unique mahasiswa who participated in active periode
      const uniqueResult = await prisma.$queryRaw`
        SELECT COUNT(DISTINCT user_id) as total FROM (
          SELECT user_id FROM evaluasi_dosen WHERE periode_id = ${activePeriodeId}
          UNION
          SELECT user_id FROM evaluasi_fasilitas WHERE periode_id = ${activePeriodeId}
        ) as combined
      `;
      uniqueMahasiswaCount = Number(uniqueResult[0].total);
    } else {
      // Get all unique mahasiswa who participated
      const uniqueResult = await prisma.$queryRaw`
        SELECT COUNT(DISTINCT user_id) as total FROM (
          SELECT user_id FROM evaluasi_dosen
          UNION
          SELECT user_id FROM evaluasi_fasilitas
        ) as combined
      `;
      uniqueMahasiswaCount = Number(uniqueResult[0].total);
    }

    // Total mahasiswa
    const totalMahasiswa = await prisma.users.count({
      where: { role: 'mahasiswa' }
    });

    const partisipasiPersen = totalMahasiswa > 0 ? ((uniqueMahasiswaCount / totalMahasiswa) * 100).toFixed(1) : 0;

    // Top 5 dosen dengan rating tertinggi
    const topDosenResult = await prisma.$queryRaw`
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
    `;

    // Fasilitas yang perlu perbaikan (rating < 3.5)
    const fasilitasPerluPerbaikanResult = await prisma.$queryRaw`
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
    `;

    const serializeDashboardRows = (rows) => rows.map((row) => ({
      ...row,
      jumlah_evaluasi: row.jumlah_evaluasi !== undefined && row.jumlah_evaluasi !== null
        ? Number(row.jumlah_evaluasi)
        : 0,
      rata_rata: row.rata_rata !== undefined && row.rata_rata !== null
        ? Number(row.rata_rata)
        : null
    }));

    res.json({
      success: true,
      data: {
        evaluasiHariIni: Number(todayResult[0].total),
        evaluasiMingguIni: Number(weekResult[0].total),
        evaluasiBulanIni: Number(monthResult[0].total),
        totalEvaluasi: Number(totalResult[0].total),
        evaluasiDosen: evaluasiDosenCount,
        evaluasiFasilitas: evaluasiFasilitasCount,
        partisipasi: {
          uniqueMahasiswa: uniqueMahasiswaCount,
          totalMahasiswa,
          persentase: parseFloat(partisipasiPersen),
          periodeId: activePeriodeId,
          periodeNama: activePeriodeNama
        },
        topDosen: serializeDashboardRows(topDosenResult),
        fasilitasPerluPerbaikan: serializeDashboardRows(fasilitasPerluPerbaikanResult)
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
    
    // Validate periode_id if provided
    const validPeriodeId = periode_id ? parseInt(periode_id) : null;
    if (periode_id && isNaN(validPeriodeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid periode_id parameter'
      });
    }

    let laporanDosen = [];
    let laporanFasilitas = [];

    // Laporan Dosen
    if (!tipe || tipe === 'dosen' || tipe === 'semua') {
      try {
        let dosenQuery = prisma.dosen.findMany({
          select: {
            id: true,
            nama: true,
            nip: true
          }
        });

        const dosenList = await dosenQuery;

        for (const dosen of dosenList) {
          let evaluasiCount = 0;
          let avgRating = null;
          let totalJawaban = 0;
          let komentarList = [];

          // Get evaluasi data for this dosen
          const evaluasiList = await prisma.evaluasi_dosen.findMany({
            where: {
              dosen_id: dosen.id,
              ...(validPeriodeId && { periode_id: validPeriodeId })
            },
            include: {
              evaluasi_detail: true
            }
          });

          if (evaluasiList.length > 0) {
            evaluasiCount = evaluasiList.length;
            
            // Calculate average rating
            const allNilai = evaluasiList
              .flatMap(ev => ev.evaluasi_detail.map(d => d.nilai))
              .filter(n => n !== null);
            
            if (allNilai.length > 0) {
              avgRating = parseFloat((allNilai.reduce((a, b) => a + b, 0) / allNilai.length).toFixed(2));
            }
            
            totalJawaban = allNilai.length;
            
            komentarList = evaluasiList
              .filter(ev => ev.komentar && ev.komentar.trim() !== '')
              .map(ev => ({
                komentar: ev.komentar,
                submitted_at: ev.submitted_at
              }));
          }

          // Get detail per kategori
          let detailKategori = [];
          if (evaluasiList.length > 0) {
            const kategoriData = await prisma.evaluasi_detail.groupBy({
              by: ['pernyataan_dosen_id'],
              where: {
                evaluasi_dosen: {
                  dosen_id: dosen.id,
                  ...(validPeriodeId && { periode_id: validPeriodeId })
                }
              },
              _avg: {
                nilai: true
              },
              _count: true
            });

            for (const item of kategoriData) {
              const pernyataan = await prisma.pernyataan_dosen.findUnique({
                where: { id: item.pernyataan_dosen_id }
              });

              if (pernyataan) {
                detailKategori.push({
                  kategori: pernyataan.kategori,
                  rata_rata: item._avg.nilai ? parseFloat(item._avg.nilai.toFixed(2)) : 0,
                  total_jawaban: item._count
                });
              }
            }
          }

          // Get detail evaluasi per mahasiswa
          let detailEvaluasi = [];
          if (evaluasiList.length > 0) {
            const detailList = evaluasiList.map(async (ev) => {
              const nilaiList = ev.evaluasi_detail.map(d => d.nilai).filter(n => n !== null);
              const avgNilai = nilaiList.length > 0 
                ? parseFloat((nilaiList.reduce((a, b) => a + b, 0) / nilaiList.length).toFixed(2))
                : 0;

              return {
                id: ev.id,
                submitted_at: ev.submitted_at,
                komentar: ev.komentar || '',
                rata_rata: avgNilai,
                jumlah_jawaban: nilaiList.length
              };
            });

            detailEvaluasi = await Promise.all(detailList);
          }

          laporanDosen.push({
            id: dosen.id,
            nama: dosen.nama,
            nip: dosen.nip,
            jumlah_evaluasi: evaluasiCount,
            rata_rata: avgRating,
            total_jawaban: totalJawaban,
            komentar_list: komentarList,
            detail_kategori: detailKategori,
            detail_evaluasi: detailEvaluasi
          });
        }
      } catch (dosenError) {
        console.error('Error fetching laporan dosen:', dosenError);
        laporanDosen = [];
      }
    }

    // Laporan Fasilitas
    if (!tipe || tipe === 'fasilitas' || tipe === 'semua') {
      try {
        const fasilitasList = await prisma.fasilitas.findMany({
          select: {
            id: true,
            nama: true,
            kode: true,
            kategori: true,
            lokasi: true
          }
        });

        for (const fasilitas of fasilitasList) {
          let evaluasiCount = 0;
          let avgRating = null;
          let totalJawaban = 0;
          let komentarList = [];

          // Get evaluasi data for this fasilitas
          const evaluasiList = await prisma.evaluasi_fasilitas.findMany({
            where: {
              fasilitas_id: fasilitas.id,
              ...(validPeriodeId && { periode_id: validPeriodeId })
            },
            include: {
              evaluasi_detail: true
            }
          });

          if (evaluasiList.length > 0) {
            evaluasiCount = evaluasiList.length;
            
            const allNilai = evaluasiList
              .flatMap(ev => ev.evaluasi_detail.map(d => d.nilai))
              .filter(n => n !== null);
            
            if (allNilai.length > 0) {
              avgRating = parseFloat((allNilai.reduce((a, b) => a + b, 0) / allNilai.length).toFixed(2));
            }
            
            totalJawaban = allNilai.length;
            
            komentarList = evaluasiList
              .filter(ev => ev.komentar && ev.komentar.trim() !== '')
              .map(ev => ({
                komentar: ev.komentar,
                submitted_at: ev.submitted_at
              }));
          }

          // Get detail per kategori
          let detailKategori = [];
          if (evaluasiList.length > 0) {
            const kategoriData = await prisma.evaluasi_detail.groupBy({
              by: ['pernyataan_fasilitas_id'],
              where: {
                evaluasi_fasilitas: {
                  fasilitas_id: fasilitas.id,
                  ...(validPeriodeId && { periode_id: validPeriodeId })
                }
              },
              _avg: {
                nilai: true
              },
              _count: true
            });

            for (const item of kategoriData) {
              const pernyataan = await prisma.pernyataan_fasilitas.findUnique({
                where: { id: item.pernyataan_fasilitas_id }
              });

              if (pernyataan) {
                detailKategori.push({
                  kategori: pernyataan.kategori,
                  rata_rata: item._avg.nilai ? parseFloat(item._avg.nilai.toFixed(2)) : 0,
                  total_jawaban: item._count
                });
              }
            }
          }

          // Get detail evaluasi per mahasiswa
          let detailEvaluasi = [];
          if (evaluasiList.length > 0) {
            const detailList = evaluasiList.map(async (ev) => {
              const nilaiList = ev.evaluasi_detail.map(d => d.nilai).filter(n => n !== null);
              const avgNilai = nilaiList.length > 0
                ? parseFloat((nilaiList.reduce((a, b) => a + b, 0) / nilaiList.length).toFixed(2))
                : 0;

              return {
                id: ev.id,
                submitted_at: ev.submitted_at,
                komentar: ev.komentar || '',
                rata_rata: avgNilai,
                jumlah_jawaban: nilaiList.length
              };
            });

            detailEvaluasi = await Promise.all(detailList);
          }

          laporanFasilitas.push({
            id: fasilitas.id,
            nama: fasilitas.nama,
            kode: fasilitas.kode,
            kategori: fasilitas.kategori,
            lokasi: fasilitas.lokasi,
            jumlah_evaluasi: evaluasiCount,
            rata_rata: avgRating,
            total_jawaban: totalJawaban,
            komentar_list: komentarList,
            detail_kategori: detailKategori,
            detail_evaluasi: detailEvaluasi
          });
        }
      } catch (fasilitasError) {
        console.error('Error fetching laporan fasilitas:', fasilitasError);
        laporanFasilitas = [];
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
      message: 'Terjadi kesalahan pada server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
