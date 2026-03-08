# Backend API - Evaluasi Akademik MI

Backend REST API untuk aplikasi Evaluasi Akademik MI menggunakan Node.js, Express, dan PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 atau lebih baru)
- PostgreSQL (v12 atau lebih baru)
- npm atau yarn

### Installation

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Setup environment variables:**
```bash
cp .env.example .env
```

Edit file `.env` dan sesuaikan konfigurasi database Anda:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=evaluasi_mi
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

3. **Create database:**
```bash
# Login ke PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE evaluasi_mi;

# Exit
\q
```

4. **Run database schema:**
```bash
psql -U postgres -d evaluasi_mi -f migrations/schema.sql
```

5. **Seed sample data (optional):**
```bash
npm run seed
```

6. **Start server:**
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server akan berjalan di `http://localhost:3000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register mahasiswa baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)
- `PUT /api/auth/change-password` - Change password (requires auth)

### Dosen
- `GET /api/dosen` - Get all dosen dengan mata kuliah
- `GET /api/dosen/:id` - Get dosen by ID

### Fasilitas
- `GET /api/fasilitas` - Get all fasilitas
- `GET /api/fasilitas/:id` - Get fasilitas by ID

### Periode
- `GET /api/periode/active` - Get active periode
- `GET /api/periode` - Get all periode (admin only)
- `POST /api/periode` - Create periode (admin only)
- `PUT /api/periode/:id` - Update periode (admin only)
- `PUT /api/periode/:id/activate` - Activate periode (admin only)
- `DELETE /api/periode/:id` - Delete periode (admin only)

### Evaluasi
- `GET /api/evaluasi/pernyataan/dosen` - Get pernyataan evaluasi dosen
- `GET /api/evaluasi/pernyataan/fasilitas` - Get pernyataan evaluasi fasilitas
- `POST /api/evaluasi/dosen` - Submit evaluasi dosen
- `POST /api/evaluasi/fasilitas` - Submit evaluasi fasilitas
- `GET /api/evaluasi/riwayat` - Get riwayat evaluasi mahasiswa
- `GET /api/evaluasi/statistik` - Get statistik mahasiswa

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/laporan` - Get laporan evaluasi (with filters)

## 🔐 Authentication

API menggunakan JWT (JSON Web Token) untuk authentication. 

**Header format:**
```
Authorization: Bearer <token>
```

**Token didapat dari:**
- Response login endpoint
- Response register endpoint

## 📝 Sample Requests

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nim": "210101001",
    "nama": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "prodi": "Teknik Informatika",
    "angkatan": "2021"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Submit Evaluasi Dosen
```bash
curl -X POST http://localhost:3000/api/evaluasi/dosen \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "dosen_id": 1,
    "mata_kuliah_id": 1,
    "periode_id": 1,
    "komentar": "Dosen sangat baik",
    "jawaban": [
      {"pernyataan_id": 1, "nilai": 5},
      {"pernyataan_id": 2, "nilai": 4}
    ]
  }'
```

## 🗄️ Database Schema

Lihat file `migrations/schema.sql` untuk detail lengkap struktur database.

**Main Tables:**
- `users` - Data mahasiswa & admin
- `dosen` - Data dosen
- `mata_kuliah` - Data mata kuliah
- `fasilitas` - Data fasilitas kampus
- `periode_evaluasi` - Periode evaluasi
- `pernyataan_dosen` - Pernyataan evaluasi dosen
- `pernyataan_fasilitas` - Pernyataan evaluasi fasilitas
- `evaluasi_dosen` - Data evaluasi dosen
- `evaluasi_fasilitas` - Data evaluasi fasilitas
- `evaluasi_detail` - Detail jawaban evaluasi

## 🧪 Testing

Gunakan Postman atau Thunder Client untuk testing API.

**Test Credentials:**
- Admin: `admin@evaluasi.com` / `admin123`
- Mahasiswa: `210101001@student.ac.id` / `mahasiswa123`

## 🔧 Troubleshooting

**Database connection error:**
- Pastikan PostgreSQL running
- Cek credentials di file `.env`
- Cek firewall/port 5432

**JWT error:**
- Generate JWT secret baru: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Update `JWT_SECRET` di `.env`

**Port already in use:**
- Ubah `PORT` di `.env`
- Atau stop process yang menggunakan port 3000

## 📦 Dependencies

- **express** - Web framework
- **pg** - PostgreSQL client
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - CORS middleware
- **dotenv** - Environment variables
- **express-validator** - Request validation

## 📜 License

MIT
