# 📦 PANDUAN DEPLOYMENT LENGKAP (BAHASA INDONESIA)
## Cara Memasang Aplikasi ke Server Produksi

**Dibuat**: 18 April 2026  
**Untuk**: Aplikasi Evaluasi MI  
**Target**: Server Linux/Ubuntu di Hosting/Cloud  

---

## 🎯 PENGENALAN

Deployment adalah proses memasang aplikasi yang sudah jadi ke server produksi agar bisa diakses oleh pengguna di internet.

**Yang akan kita lakukan:**
1. ✅ Menyiapkan server produksi
2. ✅ Memasang database PostgreSQL
3. ✅ Memasang aplikasi Node.js
4. ✅ Mengatur SSL (HTTPS aman)
5. ✅ Setup monitoring & backup
6. ✅ Testing & go-live

**Durasi**: Sekitar 1-2 jam

---

## 📋 CHECKLIST PRE-DEPLOYMENT

### Sebelum Mulai, Pastikan Anda Punya:

**Hardware:**
- [ ] Server/VPS (Ubuntu 20.04 atau lebih baru)
- [ ] RAM minimal 2GB
- [ ] Disk space minimal 10GB
- [ ] Koneksi internet stabil

**Software:**
- [ ] Node.js 18+ sudah terinstall
- [ ] PostgreSQL sudah terinstall
- [ ] Git sudah terinstall
- [ ] SSH access ke server

**Konfigurasi:**
- [ ] Domain sudah terdaftar (misal: evaluasi.universitas.edu)
- [ ] Domain sudah pointing ke IP server
- [ ] SSL certificate siap (Let's Encrypt gratis)
- [ ] Database backup sudah dibuat

**Tim:**
- [ ] Devops/admin server siap
- [ ] Database admin siap
- [ ] Aplikasi sudah di-review
- [ ] Rollback plan sudah disiapkan

---

## 🔧 LANGKAH 1: SETUP SERVER (30 menit)

### 1.1 Login ke Server Anda

Buka terminal/command prompt di laptop Anda, lalu ketik:

```bash
ssh admin@192.168.x.x
# atau
ssh admin@evaluasi.universitas.edu
```

Masukkan password server Anda.

**Contoh:**
```
$ ssh admin@server.evaluasi.edu
admin@server.evaluasi.edu's password: ****
Welcome to Ubuntu 20.04 LTS
admin@server:~$
```

### 1.2 Update Server

Pertama, update semua paket di server:

```bash
# Update daftar paket
sudo apt update

# Upgrade paket yang sudah terinstall
sudo apt upgrade -y

# Tunggu sampai selesai (bisa 5-10 menit)
```

### 1.3 Install Node.js

Node.js adalah runtime untuk menjalankan aplikasi backend kita.

```bash
# Download Node.js versi 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verifikasi instalasi
node --version
# Harus tampil: v18.x.x atau lebih tinggi
```

### 1.4 Install PM2 (Process Manager)

PM2 akan memastikan aplikasi kita terus berjalan 24/7 dan auto-restart jika crash.

```bash
# Install PM2 secara global
sudo npm install -g pm2

# Verifikasi
pm2 --version
# Harus tampil: 5.x.x atau lebih tinggi
```

### 1.5 Install Git

Git adalah untuk clone source code dari repository.

```bash
sudo apt install -y git

# Verifikasi
git --version
```

---

## 📁 LANGKAH 2: SIAPKAN FOLDER APLIKASI (10 menit)

### 2.1 Buat Folder Aplikasi

```bash
# Buat folder
sudo mkdir -p /var/www/evaluasi-mi

# Beri izin kepada user sekarang
sudo chown $USER:$USER /var/www/evaluasi-mi

# Masuk ke folder
cd /var/www/evaluasi-mi
```

### 2.2 Copy File Aplikasi

Ada 2 cara:

**Cara A: Jika Anda Punya Repository Git**
```bash
git clone https://github.com/universitas/evaluasi-mi.git .
```

**Cara B: Jika Anda Copy dari Laptop**
```bash
# Di laptop Anda (bukan di server), buka cmd/terminal, lalu:
scp -r C:\evaluasi_mi admin@192.168.x.x:/var/www/

# atau kalau pakai Linux/Mac:
scp -r ~/evaluasi_mi admin@192.168.x.x:/var/www/
```

### 2.3 Setup Environment Production

Environment file berisi konfigurasi penting untuk server produksi.

```bash
# Copy template ke production file
cp backend/.env.production.template backend/.env.production

# Buka file untuk diedit
nano backend/.env.production
```

Anda akan melihat:
```
PORT=3002
NODE_ENV=production
DB_HOST=your-production-db-host.com
DB_PORT=5432
DB_NAME=evaluasi_mi_production
DB_USER=evaluasi_user
DB_PASSWORD=your-strong-database-password-here
JWT_SECRET=your-strong-random-secret-generated-above-minimum-32-chars
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

**Edit dengan nilai asli:**
```bash
# Contoh:
PORT=3002
NODE_ENV=production
DB_HOST=localhost          # atau 192.168.x.x kalau di server lain
DB_PORT=5432
DB_NAME=evaluasi_mi_prod
DB_USER=evaluasi_user
DB_PASSWORD=password_yang_sangat_kuat_12345
JWT_SECRET=abc123def456ghi789jkl012mno345pqr678stu901vwx  # minimal 32 karakter
ALLOWED_ORIGINS=https://evaluasi.universitas.edu,https://app.evaluasi.universitas.edu
```

**Untuk keluar dari nano:**
- Tekan `Ctrl + X`
- Ketik `y` (yes)
- Tekan `Enter`

### 2.4 Generate JWT Secret yang Kuat

JWT_SECRET harus random dan kuat (minimal 32 karakter).

```bash
# Generate secret random
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Contoh output:
# a7f3d8e2b1c4f9a6e3c8d1b4a7f9e2c5b8d1a4f7e0c3f6b9a2d5e8c1f4a7

# Copy hasil ini dan paste ke JWT_SECRET di .env.production
```

---

## 🗄️ LANGKAH 3: SETUP DATABASE (15 menit)

### 3.1 Install PostgreSQL

PostgreSQL adalah database kita.

```bash
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql

# Buat PostgreSQL auto-start saat server reboot
sudo systemctl enable postgresql

# Verifikasi
sudo systemctl status postgresql
# Harus ada "active (running)"
```

### 3.2 Buat Database & User

```bash
# Login ke PostgreSQL console
sudo -u postgres psql

# Anda sekarang di PostgreSQL prompt (garis dimulai dengan "postgres=#")
# Copy-paste perintah ini satu per satu:
```

**Copy-paste blok ini:**
```sql
CREATE DATABASE evaluasi_mi_prod;
CREATE USER evaluasi_user WITH PASSWORD 'password_yang_sangat_kuat_12345';
ALTER ROLE evaluasi_user SET client_encoding TO 'utf8';
ALTER ROLE evaluasi_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE evaluasi_user SET default_transaction_deferrable TO on;
ALTER ROLE evaluasi_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE evaluasi_mi_prod TO evaluasi_user;
\q
```

**Penjelasan:**
- `CREATE DATABASE` = membuat database baru
- `CREATE USER` = membuat user database
- `GRANT ALL PRIVILEGES` = beri semua izin ke user
- `\q` = keluar dari PostgreSQL

### 3.3 Test Koneksi Database

```bash
# Test koneksi database
psql -h localhost -U evaluasi_user -d evaluasi_mi_prod -c "SELECT 1"

# Masukkan password yang Anda buat
# Kalau berhasil akan tampil:
# ?column?
# ----------
#        1
```

---

## 📦 LANGKAH 4: INSTALL APLIKASI (15 menit)

### 4.1 Install Dependencies

```bash
# Masuk ke folder backend
cd /var/www/evaluasi-mi/backend

# Install npm packages (hanya yang production, bukan development)
npm install --production

# Tunggu sampai selesai (bisa 2-5 menit)
```

### 4.2 Setup Database Migrations

Migrations adalah script yang setup database schema.

```bash
# Set URL database untuk migration
export DATABASE_URL="postgresql://evaluasi_user:password_yang_sangat_kuat_12345@localhost:5432/evaluasi_mi_prod"

# Jalankan migrations
npx prisma migrate deploy

# Seed data awal (admin, dosen, fasilitas)
node prisma/seed.js

# Verifikasi berhasil
npx prisma db push
```

### 4.3 Verifikasi Konfigurasi

```bash
# Test environment validation
node -e "require('./config/env').checkEnvVars()"

# Harus tampil: ✅ All environment variables validated

# Test koneksi database
node -e "require('./config/database').testConnection()"

# Harus tampil: ✅ Database connection successful
```

---

## 🚀 LANGKAH 5: START APLIKASI (5 menit)

### 5.1 Start dengan PM2

PM2 akan membuat aplikasi kita selalu berjalan.

```bash
# Pastikan di folder backend
cd /var/www/evaluasi-mi/backend

# Start aplikasi
pm2 start server.js --name "evaluasi-mi-api" \
  --env production \
  --max-memory-restart 512M \
  --error /var/log/evaluasi-mi/error.log \
  --output /var/log/evaluasi-mi/app.log

# Lihat status
pm2 status

# Harus tampil "online" untuk evaluasi-mi-api
```

### 5.2 Setup Auto-Restart

Agar aplikasi auto-restart saat server reboot:

```bash
# Generate startup script
pm2 startup

# Simpan konfigurasi PM2
pm2 save

# Sekarang aplikasi akan otomatis start saat server reboot
```

### 5.3 Create Folder untuk Logs

```bash
# Buat folder logs
sudo mkdir -p /var/log/evaluasi-mi

# Beri izin
sudo chown $USER:$USER /var/log/evaluasi-mi

# Lihat logs
pm2 logs evaluasi-mi-api
```

**Output logs akan seperti:**
```
2026-04-18 15:30:00 evaluasi-mi-api[0] > 🚀 Server running on port 3002
2026-04-18 15:30:01 evaluasi-mi-api[0] > ✅ Database connected successfully
```

---

## 🔒 LANGKAH 6: SETUP HTTPS/SSL (20 menit)

HTTPS adalah protokol aman untuk internet. Semua data akan terenkripsi.

### 6.1 Install Certbot (untuk SSL gratis)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Tunggu instalasi selesai
```

### 6.2 Generate SSL Certificate

```bash
# Generate certificate (gratis dari Let's Encrypt)
sudo certbot certonly --standalone \
  -d evaluasi.universitas.edu \
  -d app.evaluasi.universitas.edu \
  --email admin@universitas.edu \
  --agree-tos \
  --non-interactive

# Tunggu prosesnya
# Kalau berhasil, certificate disimpan di:
# /etc/letsencrypt/live/evaluasi.universitas.edu/
```

### 6.3 Install Nginx (Web Server)

Nginx akan menerima traffic HTTPS dan forward ke aplikasi Node.js kita.

```bash
# Install Nginx
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx

# Auto-start saat server reboot
sudo systemctl enable nginx

# Verifikasi running
sudo systemctl status nginx
```

### 6.4 Setup Konfigurasi Nginx

```bash
# Edit konfigurasi Nginx
sudo nano /etc/nginx/sites-available/evaluasi-mi

# Paste konfigurasi ini:
```

```nginx
# Redirect dari HTTP ke HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name evaluasi.universitas.edu app.evaluasi.universitas.edu;
    
    return 301 https://$server_name$request_uri;
}

# HTTPS Configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name evaluasi.universitas.edu app.evaluasi.universitas.edu;
    
    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/evaluasi.universitas.edu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/evaluasi.universitas.edu/privkey.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    
    # Compression
    gzip on;
    gzip_min_length 1000;
    gzip_types text/plain text/css application/json application/javascript;
    
    # Reverse Proxy ke Node.js
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Untuk keluar dari nano:**
- `Ctrl + X` → `y` → `Enter`

### 6.5 Enable Konfigurasi Nginx

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/evaluasi-mi \
           /etc/nginx/sites-enabled/evaluasi-mi

# Hapus default site
sudo rm /etc/nginx/sites-enabled/default

# Test konfigurasi
sudo nginx -t

# Harus tampil: "successful"

# Restart Nginx
sudo systemctl restart nginx

# Verifikasi berjalan
sudo systemctl status nginx
```

---

## ✅ LANGKAH 7: TESTING (15 menit)

### 7.1 Test Health Check

```bash
# Test dari laptop Anda (bukan di server)
# Buka browser atau command prompt:

curl -k https://evaluasi.universitas.edu/

# Harus tampil:
# {
#   "message": "Evaluasi MI API Server",
#   "version": "1.0.0",
#   "status": "running",
#   "database": "connected"
# }
```

### 7.2 Test HTTPS Redirect

```bash
# Coba akses HTTP (harus redirect ke HTTPS)
curl -i http://evaluasi.universitas.edu/

# Harus tampil: 301 Moved Permanently → https://
```

### 7.3 Test Login

```bash
# Test login API
curl -X POST https://evaluasi.universitas.edu/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nim":"210101001","password":"12345"}'

# Harus tampil token:
# {
#   "success": true,
#   "data": {
#     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
#   }
# }
```

### 7.4 Test di Browser

Buka browser Anda:

```
https://evaluasi.universitas.edu
```

**Coba flow ini:**
1. Login sebagai mahasiswa (210101001/12345)
2. Submit evaluasi dosen
3. Lihat dashboard & statistik
4. Logout
5. Login sebagai admin (admin@gmail.com/password123)
6. Lihat laporan admin

Semua harus berfungsi normal!

---

## 🔄 LANGKAH 8: BACKUP & MONITORING (10 menit)

### 8.1 Setup Backup Database Harian

```bash
# Buat folder backup
mkdir -p /var/backups/evaluasi-mi

# Buat script backup
cat > /usr/local/bin/backup-database.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/evaluasi-mi"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
FILENAME="evaluasi_mi_$DATE.sql.gz"

# Backup database
pg_dump -U evaluasi_user evaluasi_mi_prod | gzip > $BACKUP_DIR/$FILENAME

# Hapus backup yang lebih dari 30 hari
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "✅ Backup selesai: $FILENAME"
EOF

# Buat executable
chmod +x /usr/local/bin/backup-database.sh

# Test
/usr/local/bin/backup-database.sh
```

### 8.2 Setup Auto Backup Setiap Hari

```bash
# Edit crontab
crontab -e

# Tambah baris ini (backup jam 2 pagi setiap hari):
0 2 * * * /usr/local/bin/backup-database.sh

# Save & exit (Ctrl+X → y → Enter)
```

### 8.3 Monitor Aplikasi

```bash
# Lihat status PM2
pm2 status

# Lihat logs real-time
pm2 logs evaluasi-mi-api

# Monitor CPU/Memory
pm2 monit
```

---

## 📞 TROUBLESHOOTING (Jika Ada Masalah)

### Masalah 1: Aplikasi Tidak Start

```bash
# Lihat error log
pm2 logs evaluasi-mi-api

# Coba manual start untuk lihat error detail
cd /var/www/evaluasi-mi/backend
node server.js

# Jika ada error, perbaiki lalu restart
pm2 restart evaluasi-mi-api
```

### Masalah 2: Database Tidak Connect

```bash
# Test koneksi database
psql -h localhost -U evaluasi_user -d evaluasi_mi_prod -c "SELECT 1"

# Cek .env.production
cat backend/.env.production

# Pastikan password dan hostname benar
# Cek apakah PostgreSQL running
sudo systemctl status postgresql
```

### Masalah 3: Port 3002 Sudah Dipakai

```bash
# Cari proses yang pakai port 3002
lsof -i :3002

# Kill proses tersebut
kill -9 <PID>

# Atau ganti port di .env.production
```

### Masalah 4: HTTPS/SSL Error

```bash
# Cek certificate
sudo certbot certificates

# Renew certificate (jika sudah mau expired)
sudo certbot renew

# Cek Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔙 ROLLBACK (Jika Ada Bug di Production)

Jika ada bug serius dan perlu rollback ke versi sebelumnya:

### Rollback Aplikasi

```bash
# Stop aplikasi
pm2 stop evaluasi-mi-api

# Kembali ke versi sebelumnya (jika pakai git)
cd /var/www/evaluasi-mi
git checkout v1.0.0

# Reinstall
npm install --production

# Start lagi
pm2 start server.js --name "evaluasi-mi-api"
```

### Rollback Database

```bash
# Stop aplikasi
pm2 stop evaluasi-mi-api

# Restore dari backup
gunzip < /var/backups/evaluasi-mi/evaluasi_mi_2026-04-18_02-00-00.sql.gz | \
  psql -U evaluasi_user evaluasi_mi_prod

# Start lagi
pm2 start evaluasi-mi-api
```

---

## ✨ SELESAI! APLIKASI SUDAH LIVE

Selamat! Aplikasi Anda sekarang live di:

```
🌐 Web:   https://evaluasi.universitas.edu
📱 Admin: https://evaluasi.universitas.edu (login admin)
🔌 API:   https://api.evaluasi.universitas.edu
```

### Langkah Selanjutnya:

1. **Monitor Logs** - Pantau logs setiap hari untuk error
2. **Backup Verify** - Pastikan backup database berjalan
3. **Update Users** - Beri tahu pengguna aplikasi sudah live
4. **Collect Feedback** - Kumpulkan feedback dari pengguna
5. **Monitor Performance** - Pantau performa aplikasi

### Daily Checklist:

- [ ] Cek PM2 status (`pm2 status`)
- [ ] Lihat logs untuk error (`pm2 logs evaluasi-mi-api`)
- [ ] Cek disk space (`df -h`)
- [ ] Cek memory usage (`free -h`)
- [ ] Backup database berjalan dengan baik

---

## 📚 PERINTAH PENTING UNTUK SEHARI-HARI

```bash
# Lihat status aplikasi
pm2 status

# Start aplikasi
pm2 start evaluasi-mi-api

# Stop aplikasi
pm2 stop evaluasi-mi-api

# Restart aplikasi
pm2 restart evaluasi-mi-api

# Lihat logs
pm2 logs evaluasi-mi-api

# Hapus aplikasi dari PM2
pm2 delete evaluasi-mi-api

# Cek environment
cat backend/.env.production

# Backup database manual
/usr/local/bin/backup-database.sh

# Cek Nginx status
sudo systemctl status nginx

# Reload Nginx
sudo systemctl reload nginx

# Cek PostgreSQL
sudo systemctl status postgresql

# Monitor real-time
pm2 monit
```

---

## 🆘 HUBUNGI SUPPORT

Jika ada masalah:

1. **Cek Logs** - `pm2 logs evaluasi-mi-api`
2. **Cek Database** - `psql -U evaluasi_user -d evaluasi_mi_prod -c "SELECT 1"`
3. **Cek Nginx** - `sudo nginx -t`
4. **Restart Services** - `pm2 restart all && sudo systemctl restart nginx`
5. **Hubungi Tim DevOps**

---

**Dibuat**: 18 April 2026  
**Versi**: 1.0 (Bahasa Indonesia)  
**Last Updated**: 18 April 2026  

**Selamat mendeploy! 🚀**
