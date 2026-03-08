require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function seed() {
  const client = await db.pool.connect();
  
  try {
    console.log('🌱 Starting database seeding...\n');

    await client.query('BEGIN');

    // 1. Seed Users (1 Admin + 5 Mahasiswa)
    console.log('📝 Seeding users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await client.query(`
      INSERT INTO users (nim, nama, email, password, role, prodi, angkatan) VALUES
      (NULL, 'Admin Evaluasi', 'admin@evaluasi.com', $1, 'admin', NULL, NULL),
      ('210101001', 'Ahmad Fauzi', '210101001@student.ac.id', $1, 'mahasiswa', 'Teknik Informatika', '2021'),
      ('210101002', 'Siti Nurhaliza', '210101002@student.ac.id', $1, 'mahasiswa', 'Teknik Informatika', '2021'),
      ('210102001', 'Budi Santoso', '210102001@student.ac.id', $1, 'mahasiswa', 'Sistem Informasi', '2021'),
      ('220101001', 'Diana Putri', '220101001@student.ac.id', $1, 'mahasiswa', 'Teknik Informatika', '2022'),
      ('220101002', 'Eko Prasetyo', '220101002@student.ac.id', $1, 'mahasiswa', 'Teknik Informatika', '2022')
    `, [hashedPassword]);
    console.log('✅ Users seeded\n');

    // 2. Seed Periode
    console.log('📝 Seeding periode evaluasi...');
    await client.query(`
      INSERT INTO periode_evaluasi (nama, tahun_ajaran, semester, tanggal_mulai, tanggal_akhir, batas_evaluasi, status, keterangan) VALUES
      ('Evaluasi Gasal 2024/2025', '2024/2025', 'Ganjil', '2024-09-01', '2025-01-31', '2025-01-15', 'aktif', 'Periode evaluasi semester gasal tahun ajaran 2024/2025'),
      ('Evaluasi Genap 2023/2024', '2023/2024', 'Genap', '2024-02-01', '2024-06-30', '2024-06-15', 'selesai', 'Periode evaluasi semester genap tahun ajaran 2023/2024')
    `);
    console.log('✅ Periode seeded\n');

    // 3. Seed Dosen
    console.log('📝 Seeding dosen...');
    await client.query(`
      INSERT INTO dosen (nip, nama, email) VALUES
      ('197801012005011001', 'Dr. Ir. Bambang Wijaya, M.Kom', 'bambang.wijaya@university.ac.id'),
      ('198203152006042002', 'Prof. Dr. Siti Aminah, M.T', 'siti.aminah@university.ac.id'),
      ('198505202008121003', 'Andi Pratama, S.Kom, M.Cs', 'andi.pratama@university.ac.id'),
      ('199001102010012001', 'Dr. Rina Kusuma, S.Si, M.Kom', 'rina.kusuma@university.ac.id'),
      ('198712252009011002', 'Dedi Kurniawan, S.T, M.T', 'dedi.kurniawan@university.ac.id'),
      ('199205152012121001', 'Lisa Marlina, S.Kom, M.M', 'lisa.marlina@university.ac.id'),
      ('198909082011011001', 'Ahmad Rizki, S.Kom, M.Kom', 'ahmad.rizki@university.ac.id'),
      ('199112202013012001', 'Dwi Astuti, S.Si, M.Kom', 'dwi.astuti@university.ac.id'),
      ('198806152010121002', 'Hendra Saputra, S.T, M.T', 'hendra.saputra@university.ac.id'),
      ('199304102014011001', 'Nina Wulandari, S.Kom, M.Cs', 'nina.wulandari@university.ac.id')
    `);
    console.log('✅ Dosen seeded\n');

    // 4. Seed Mata Kuliah
    console.log('📝 Seeding mata kuliah...');
    await client.query(`
      INSERT INTO mata_kuliah (kode, nama, sks, semester, dosen_id) VALUES
      ('TIF201', 'Algoritma dan Pemrograman', 4, 3, 1),
      ('TIF202', 'Struktur Data', 3, 3, 1),
      ('TIF203', 'Basis Data', 3, 4, 2),
      ('TIF204', 'Pemrograman Web', 3, 4, 3),
      ('TIF205', 'Sistem Operasi', 3, 5, 4),
      ('TIF206', 'Jaringan Komputer', 3, 5, 5),
      ('TIF301', 'Kecerdasan Buatan', 3, 6, 6),
      ('TIF302', 'Data Mining', 3, 6, 7),
      ('TIF303', 'Keamanan Informasi', 3, 7, 8),
      ('TIF401', 'Rekayasa Perangkat Lunak', 4, 7, 2),
      ('SIF201', 'Manajemen Basis Data', 3, 4, 9),
      ('SIF202', 'Analisis dan Perancangan Sistem', 4, 5, 10)
    `);
    console.log('✅ Mata kuliah seeded\n');

    // 5. Seed Fasilitas
    console.log('📝 Seeding fasilitas...');
    await client.query(`
      INSERT INTO fasilitas (kode, nama, kategori, lokasi, kapasitas) VALUES
      ('LAB-01', 'Laboratorium Komputer 1', 'Laboratorium', 'Gedung A Lantai 2', 40),
      ('LAB-02', 'Laboratorium Komputer 2', 'Laboratorium', 'Gedung A Lantai 3', 40),
      ('LAB-03', 'Laboratorium Jaringan', 'Laboratorium', 'Gedung B Lantai 2', 30),
      ('LAB-04', 'Laboratorium Multimedia', 'Laboratorium', 'Gedung B Lantai 3', 35),
      ('KELAS-A1', 'Ruang Kelas A1', 'Ruang Kelas', 'Gedung A Lantai 1', 50),
      ('KELAS-A2', 'Ruang Kelas A2', 'Ruang Kelas', 'Gedung A Lantai 1', 50),
      ('KELAS-B1', 'Ruang Kelas B1', 'Ruang Kelas', 'Gedung B Lantai 1', 45),
      ('PERPUS-01', 'Perpustakaan Pusat', 'Perpustakaan', 'Gedung C', 100),
      ('AULA-01', 'Aula Serbaguna', 'Aula', 'Gedung D', 200),
      ('KANTIN-01', 'Kantin Mahasiswa', 'Kantin', 'Area Tengah', 80),
      ('WC-PA-01', 'Toilet Pria Gedung A', 'Toilet', 'Gedung A Lantai 1', 10),
      ('WC-PI-01', 'Toilet Wanita Gedung A', 'Toilet', 'Gedung A Lantai 1', 10)
    `);
    console.log('✅ Fasilitas seeded\n');

    // 6. Seed Pernyataan Dosen (16 pernyataan)
    console.log('📝 Seeding pernyataan dosen...');
    await client.query(`
      INSERT INTO pernyataan_dosen (kategori, pernyataan, urutan) VALUES
      ('Persiapan Mengajar', 'Dosen datang tepat waktu', 1),
      ('Persiapan Mengajar', 'Dosen menyampaikan silabus dan kontrak perkuliahan', 2),
      ('Persiapan Mengajar', 'Dosen menyiapkan materi dengan baik', 3),
      
      ('Penyampaian Materi', 'Dosen menjelaskan materi dengan jelas', 4),
      ('Penyampaian Materi', 'Dosen memberikan contoh yang relevan', 5),
      ('Penyampaian Materi', 'Dosen menguasai materi yang diajarkan', 6),
      ('Penyampaian Materi', 'Dosen menggunakan media pembelajaran yang efektif', 7),
      
      ('Interaksi dengan Mahasiswa', 'Dosen memberikan kesempatan bertanya', 8),
      ('Interaksi dengan Mahasiswa', 'Dosen responsif terhadap pertanyaan mahasiswa', 9),
      ('Interaksi dengan Mahasiswa', 'Dosen mendorong diskusi aktif', 10),
      
      ('Evaluasi Pembelajaran', 'Dosen memberikan tugas yang sesuai dengan materi', 11),
      ('Evaluasi Pembelajaran', 'Dosen memberikan penilaian yang adil', 12),
      ('Evaluasi Pembelajaran', 'Dosen memberikan feedback yang konstruktif', 13),
      
      ('Sikap dan Etika', 'Dosen bersikap profesional', 14),
      ('Sikap dan Etika', 'Dosen menghargai pendapat mahasiswa', 15),
      ('Sikap dan Etika', 'Dosen memberikan motivasi belajar', 16)
    `);
    console.log('✅ Pernyataan dosen seeded\n');

    // 7. Seed Pernyataan Fasilitas (12 pernyataan)
    console.log('📝 Seeding pernyataan fasilitas...');
    await client.query(`
      INSERT INTO pernyataan_fasilitas (kategori, pernyataan, urutan) VALUES
      ('Kebersihan', 'Fasilitas dalam kondisi bersih', 1),
      ('Kebersihan', 'Toilet terawat dengan baik', 2),
      ('Kebersihan', 'Area sekitar fasilitas rapi', 3),
      
      ('Kelengkapan', 'Peralatan/perangkat lengkap dan berfungsi dengan baik', 4),
      ('Kelengkapan', 'Jumlah fasilitas mencukupi kebutuhan', 5),
      ('Kelengkapan', 'Fasilitas penunjang (AC, lampu) berfungsi dengan baik', 6),
      
      ('Kenyamanan', 'Fasilitas nyaman digunakan', 7),
      ('Kenyamanan', 'Pencahayaan memadai', 8),
      ('Kenyamanan', 'Ventilasi udara baik', 9),
      ('Kenyamanan', 'Tingkat kebisingan rendah', 10),
      
      ('Aksesibilitas', 'Lokasi fasilitas mudah dijangkau', 11),
      ('Aksesibilitas', 'Fasilitas dapat diakses dengan mudah', 12)
    `);
    console.log('✅ Pernyataan fasilitas seeded\n');

    await client.query('COMMIT');
    
    console.log('\n✨ Seeding completed successfully!\n');
    console.log('Default credentials:');
    console.log('Admin: admin@evaluasi.com / password123');
    console.log('Mahasiswa: 210101001@student.ac.id / password123');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    client.release();
    await db.pool.end();
  }
}

// Run seeder
seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
