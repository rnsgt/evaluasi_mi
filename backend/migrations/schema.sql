-- Database Schema untuk Aplikasi Evaluasi Akademik MI
-- PostgreSQL

-- Drop tables if exist (for fresh install)
DROP TABLE IF EXISTS evaluasi_detail CASCADE;
DROP TABLE IF EXISTS evaluasi_fasilitas CASCADE;
DROP TABLE IF EXISTS evaluasi_dosen CASCADE;
DROP TABLE IF EXISTS pernyataan_fasilitas CASCADE;
DROP TABLE IF EXISTS pernyataan_dosen CASCADE;
DROP TABLE IF EXISTS fasilitas CASCADE;
DROP TABLE IF EXISTS mata_kuliah CASCADE;
DROP TABLE IF EXISTS dosen CASCADE;
DROP TABLE IF EXISTS periode_evaluasi CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table (Mahasiswa + Admin)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  nim VARCHAR(20) UNIQUE,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'mahasiswa' CHECK (role IN ('mahasiswa', 'admin')),
  prodi VARCHAR(100),
  angkatan VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Periode Evaluasi Table
CREATE TABLE periode_evaluasi (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  tahun_ajaran VARCHAR(20) NOT NULL,
  semester VARCHAR(20) NOT NULL CHECK (semester IN ('Ganjil', 'Genap')),
  tanggal_mulai DATE NOT NULL,
  tanggal_akhir DATE NOT NULL,
  batas_evaluasi DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'tidak_aktif' CHECK (status IN ('aktif', 'tidak_aktif', 'selesai')),
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dosen Table
CREATE TABLE dosen (
  id SERIAL PRIMARY KEY,
  nip VARCHAR(30) UNIQUE NOT NULL,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  foto VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mata Kuliah Table
CREATE TABLE mata_kuliah (
  id SERIAL PRIMARY KEY,
  kode VARCHAR(20) UNIQUE NOT NULL,
  nama VARCHAR(100) NOT NULL,
  sks INTEGER NOT NULL,
  semester INTEGER,
  dosen_id INTEGER REFERENCES dosen(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fasilitas Table
CREATE TABLE fasilitas (
  id SERIAL PRIMARY KEY,
  kode VARCHAR(20) UNIQUE NOT NULL,
  nama VARCHAR(100) NOT NULL,
  kategori VARCHAR(50) NOT NULL,
  lokasi VARCHAR(100),
  kapasitas INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pernyataan Dosen Table
CREATE TABLE pernyataan_dosen (
  id SERIAL PRIMARY KEY,
  kategori VARCHAR(50) NOT NULL,
  pernyataan TEXT NOT NULL,
  urutan INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pernyataan Fasilitas Table
CREATE TABLE pernyataan_fasilitas (
  id SERIAL PRIMARY KEY,
  kategori VARCHAR(50) NOT NULL,
  pernyataan TEXT NOT NULL,
  urutan INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evaluasi Dosen Table
CREATE TABLE evaluasi_dosen (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dosen_id INTEGER NOT NULL REFERENCES dosen(id) ON DELETE CASCADE,
  mata_kuliah_id INTEGER NOT NULL REFERENCES mata_kuliah(id) ON DELETE CASCADE,
  periode_id INTEGER NOT NULL REFERENCES periode_evaluasi(id) ON DELETE CASCADE,
  komentar TEXT,
  status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'pending')),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, dosen_id, mata_kuliah_id, periode_id)
);

-- Evaluasi Fasilitas Table
CREATE TABLE evaluasi_fasilitas (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fasilitas_id INTEGER NOT NULL REFERENCES fasilitas(id) ON DELETE CASCADE,
  periode_id INTEGER NOT NULL REFERENCES periode_evaluasi(id) ON DELETE CASCADE,
  komentar TEXT,
  status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'pending')),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, fasilitas_id, periode_id)
);

-- Evaluasi Detail Table (menyimpan jawaban per pernyataan)
CREATE TABLE evaluasi_detail (
  id SERIAL PRIMARY KEY,
  evaluasi_dosen_id INTEGER REFERENCES evaluasi_dosen(id) ON DELETE CASCADE,
  evaluasi_fasilitas_id INTEGER REFERENCES evaluasi_fasilitas(id) ON DELETE CASCADE,
  pernyataan_dosen_id INTEGER REFERENCES pernyataan_dosen(id) ON DELETE CASCADE,
  pernyataan_fasilitas_id INTEGER REFERENCES pernyataan_fasilitas(id) ON DELETE CASCADE,
  nilai INTEGER NOT NULL CHECK (nilai >= 1 AND nilai <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (
    (evaluasi_dosen_id IS NOT NULL AND evaluasi_fasilitas_id IS NULL) OR
    (evaluasi_dosen_id IS NULL AND evaluasi_fasilitas_id IS NOT NULL)
  )
);

-- Indexes untuk performa
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_nim ON users(nim);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_periode_status ON periode_evaluasi(status);
CREATE INDEX idx_dosen_nip ON dosen(nip);
CREATE INDEX idx_mata_kuliah_dosen ON mata_kuliah(dosen_id);
CREATE INDEX idx_evaluasi_dosen_user ON evaluasi_dosen(user_id);
CREATE INDEX idx_evaluasi_dosen_periode ON evaluasi_dosen(periode_id);
CREATE INDEX idx_evaluasi_fasilitas_user ON evaluasi_fasilitas(user_id);
CREATE INDEX idx_evaluasi_fasilitas_periode ON evaluasi_fasilitas(periode_id);

-- Trigger untuk updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_periode_updated_at BEFORE UPDATE ON periode_evaluasi
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dosen_updated_at BEFORE UPDATE ON dosen
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mata_kuliah_updated_at BEFORE UPDATE ON mata_kuliah
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fasilitas_updated_at BEFORE UPDATE ON fasilitas
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
