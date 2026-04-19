# ❓ FAQ & TROUBLESHOOTING DEPLOYMENT (BAHASA INDONESIA)
## Jawaban untuk Pertanyaan yang Sering Ditanya

---

## ❓ PERTANYAAN UMUM

### Q1: Berapa biaya untuk deployment?

**A:** Anda butuh:
- **Server/VPS**: Rp 100-300rb/bulan (DigitalOcean, Linode, Vultr, AWS)
- **SSL Certificate**: GRATIS (Let's Encrypt)
- **Domain**: Rp 150-300rb/tahun
- **Database Backup**: Terintegrasi (gratis)

**Total**: ~Rp 300-400rb/bulan (sangat terjangkau)

---

### Q2: Berapa lama proses deployment?

**A:** 
- Jika semua siap: **1-2 jam**
- Persiapan awal (setup): 30 menit
- Aplikasi & database: 20 menit
- SSL & Nginx: 15 menit
- Testing: 15 menit

---

### Q3: Apakah perlu IP static di server?

**A:** Ya, Anda perlu:
- **IP static** untuk server (biar domain bisa pointing)
- **Domain** yang sudah registered
- Contoh: `evaluasi.universitas.edu` pointing ke IP `192.168.1.100`

---

### Q4: Bagaimana jika database di server lain?

**A:** Bisa! Edit `.env.production`:
```bash
DB_HOST=db.company.com        # hostname database server lain
DB_PORT=5432                  # port PostgreSQL
DB_NAME=evaluasi_mi_prod
DB_USER=evaluasi_user
DB_PASSWORD=password-kuat
```

---

### Q5: Apakah perlu downtime saat deployment?

**A:** Tidak perlu downtime jika:
1. Database & aplikasi di-setup parallel
2. Testing di-staging dulu (jangan langsung production)
3. Gunakan blue-green deployment (advanced)

Tapi untuk first deployment: minimal **5-10 menit** saat switch DNS.

---

### Q6: Bagaimana rollback jika ada bug?

**A:** Ada 3 cara:

**Cara 1: Rollback code (jika git)**
```bash
pm2 stop evaluasi-mi-api
git checkout v1.0.0
npm install --production
pm2 start server.js --name "evaluasi-mi-api"
```

**Cara 2: Rollback database**
```bash
pm2 stop evaluasi-mi-api
gunzip < backup_20260418.sql.gz | psql -U evaluasi_user evaluasi_mi_prod
pm2 start evaluasi-mi-api
```

**Cara 3: Rebuild dari backup**
```bash
# Start dari folder backup
cd /var/backups/evaluasi-mi
# Restore dari backup terbaru
```

---

## 🚨 TROUBLESHOOTING UMUM

### ❌ Error: "Cannot connect to database"

**Gejala:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Penyebab & Solusi:**

1. **PostgreSQL tidak jalan**
```bash
sudo systemctl status postgresql
# Jika tidak running:
sudo systemctl start postgresql
```

2. **Database belum dibuat**
```bash
sudo -u postgres psql -c "SELECT datname FROM pg_database WHERE datname='evaluasi_mi_prod';"
# Jika tidak ada, buat:
sudo -u postgres psql << EOF
CREATE DATABASE evaluasi_mi_prod;
EOF
```

3. **User password salah**
```bash
# Cek .env.production
cat backend/.env.production | grep DB_PASSWORD

# Cek password di PostgreSQL
sudo -u postgres psql -c "ALTER USER evaluasi_user WITH PASSWORD 'password-baru';"

# Update di .env.production
# Restart aplikasi
pm2 restart evaluasi-mi-api
```

4. **Database host salah**
```bash
# Cek .env.production
cat backend/.env.production | grep DB_HOST

# Test koneksi
psql -h 192.168.x.x -U evaluasi_user -d evaluasi_mi_prod -c "SELECT 1"
```

---

### ❌ Error: "Port 3002 already in use"

**Gejala:**
```
Error: listen EADDRINUSE: address already in use :::3002
```

**Solusi:**

**Opsi 1: Kill proses yang pakai port**
```bash
# Cari proses
lsof -i :3002

# Output contoh:
# COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
# node    12345 admin   18u  IPv6 123456      0t0  TCP *:3002 (LISTEN)

# Kill proses
kill -9 12345

# Atau untuk force kill semua node:
pkill -9 node
```

**Opsi 2: Ganti port**
```bash
# Edit .env.production
nano backend/.env.production

# Ubah PORT=3002 menjadi PORT=3003 (atau port lain yang kosong)

# Update Nginx config juga:
sudo nano /etc/nginx/sites-available/evaluasi-mi
# Ubah: proxy_pass http://localhost:3003;

# Restart
sudo nginx -t && sudo systemctl restart nginx
pm2 restart evaluasi-mi-api
```

---

### ❌ Error: "PM2: command not found"

**Gejala:**
```
pm2: command not found
```

**Solusi:**
```bash
# Install PM2 global
sudo npm install -g pm2

# Verifikasi
pm2 --version

# Jika masih error, pakai full path:
/usr/local/bin/pm2 status
```

---

### ❌ Error: "CORS policy: Origin not allowed"

**Gejala:**
Aplikasi frontend error: "CORS policy: cross-origin request blocked"

**Solusi:**

1. **Cek .env.production**
```bash
cat backend/.env.production | grep ALLOWED_ORIGINS

# Harus include domain frontend Anda:
# ALLOWED_ORIGINS=https://evaluasi.universitas.edu,https://app.evaluasi.universitas.edu
```

2. **Update jika perlu**
```bash
nano backend/.env.production

# Pastikan domain frontend ada di sana
# Contoh:
# ALLOWED_ORIGINS=https://evaluasi.universitas.edu,https://app.evaluasi.universitas.edu,http://localhost:8081

pm2 restart evaluasi-mi-api
```

3. **Test CORS**
```bash
curl -i -X OPTIONS https://evaluasi.universitas.edu/api/dosen \
  -H "Origin: https://evaluasi.universitas.edu" \
  -H "Access-Control-Request-Method: GET"

# Harus tampil:
# Access-Control-Allow-Origin: https://evaluasi.universitas.edu
```

---

### ❌ Error: "SSL certificate problem"

**Gejala:**
```
curl: (60) SSL certificate problem: self signed certificate
```

**Solusi:**

1. **Pastikan cert sudah di-generate**
```bash
ls -la /etc/letsencrypt/live/evaluasi.universitas.edu/
# Harus ada: fullchain.pem, privkey.pem
```

2. **Jika belum ada, generate ulang**
```bash
sudo certbot certonly --standalone \
  -d evaluasi.universitas.edu \
  --email admin@universitas.edu \
  --agree-tos \
  --non-interactive
```

3. **Cek Nginx config**
```bash
sudo nano /etc/nginx/sites-available/evaluasi-mi

# Pastikan path certificate benar:
# ssl_certificate /etc/letsencrypt/live/evaluasi.universitas.edu/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/evaluasi.universitas.edu/privkey.pem;

sudo nginx -t
sudo systemctl restart nginx
```

4. **Auto-renew certificate**
```bash
# Let's Encrypt cert berlaku 90 hari, otomatis renew:
sudo certbot renew --dry-run

# Atau manual renew:
sudo certbot renew
```

---

### ❌ Error: "502 Bad Gateway"

**Gejala:**
Akses website tampil: "502 Bad Gateway" dari Nginx

**Artinya:** Nginx tidak bisa connect ke aplikasi Node.js di port 3002

**Solusi:**

1. **Cek aplikasi jalan atau tidak**
```bash
pm2 status
# Lihat kolom status, harus "online"

# Jika not running:
pm2 start server.js --name "evaluasi-mi-api"
```

2. **Cek logs aplikasi**
```bash
pm2 logs evaluasi-mi-api | tail -30
# Lihat ada error apa
```

3. **Cek port 3002 listening**
```bash
netstat -tlnp | grep 3002
# Harus tampil: LISTEN ... :3002
```

4. **Test koneksi manual**
```bash
curl http://localhost:3002/
# Harus return 200 OK
```

5. **Jika masih error, restart semua**
```bash
pm2 stop evaluasi-mi-api
pm2 start server.js --name "evaluasi-mi-api" --env production
sudo systemctl restart nginx

# Tunggu 5 detik, terus test
curl https://evaluasi.universitas.edu/
```

---

### ❌ Error: "Nginx: Address already in use"

**Gejala:**
```
[emerg] bind() to 0.0.0.0:443 failed (98: Address already in use)
```

**Solusi:**

```bash
# Cari proses yang pakai port 443
lsof -i :443

# Kill jika ada
sudo kill -9 <PID>

# Atau restart Nginx
sudo systemctl restart nginx

# Verifikasi
sudo systemctl status nginx
```

---

### ❌ Error: "Permission denied" saat create folder

**Gejala:**
```
mkdir: cannot create directory '/var/www/evaluasi-mi': Permission denied
```

**Solusi:**

```bash
# Gunakan sudo
sudo mkdir -p /var/www/evaluasi-mi

# Beri ownership ke user
sudo chown $USER:$USER /var/www/evaluasi-mi

# Verifikasi
ls -la /var/www/ | grep evaluasi-mi
```

---

### ❌ Error: "Disk space full"

**Gejala:**
```
ENOSPC: no space left on device
```

**Solusi:**

1. **Cek disk usage**
```bash
df -h

# Output contoh:
# /dev/sda1      20G  19G  1G  95% /
# ^ Disk hampir penuh!
```

2. **Hapus files yang tidak perlu**
```bash
# Cek log size
du -sh /var/log/evaluasi-mi/

# Hapus log lama
rm /var/log/evaluasi-mi/app.log.*
```

3. **Compress database backups lama**
```bash
# Lihat backup
ls -lah /var/backups/evaluasi-mi/

# Delete yang lama (> 30 hari)
find /var/backups/evaluasi-mi -name "*.sql.gz" -mtime +30 -delete
```

4. **Bersihkan npm cache**
```bash
npm cache clean --force
```

---

### ❌ Error: "npm ERR! code ERESOLVE"

**Gejala:**
```
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solusi:**

```bash
# Install dengan force
npm install --legacy-peer-deps

# Atau upgrade npm
npm install -g npm@latest
npm install
```

---

## 📊 MONITORING & PERFORMANCE

### Q: Bagaimana cara monitor aplikasi?

**A:** Ada 3 cara:

**1. PM2 Web UI (GUI)**
```bash
pm2 web
# Buka browser: http://localhost:9615
# Username: admin, Password: admin
```

**2. Command line**
```bash
pm2 status          # Lihat status semua app
pm2 logs            # Lihat logs real-time
pm2 monit           # Monitor CPU/Memory
```

**3. Create monitoring script**
```bash
cat > check-health.sh << 'EOF'
#!/bin/bash
STATUS=$(curl -s https://evaluasi.universitas.edu/ | grep "running")
if [ -z "$STATUS" ]; then
    echo "❌ App is DOWN"
    pm2 restart evaluasi-mi-api
else
    echo "✅ App is UP"
fi
EOF

chmod +x check-health.sh

# Run setiap 5 menit
# 5 * * * * /path/to/check-health.sh
```

---

### Q: Bagaimana cek database backup berjalan?

**A:**
```bash
# Lihat backup files
ls -lah /var/backups/evaluasi-mi/

# Cek crontab
crontab -l

# Lihat schedule backup
grep backup-database /var/log/syslog

# Test backup manual
/usr/local/bin/backup-database.sh

# Cek hasil
ls -lah /var/backups/evaluasi-mi/ | head -5
```

---

### Q: Bagaimana optimasi performa?

**A:**

1. **Enable gzip compression di Nginx** (sudah ada di config)

2. **Database indexing**
```bash
# Sudah di setup via Prisma schema
```

3. **Connection pooling** (sudah configured)

4. **Monitor slow queries**
```bash
# Enable logging di PostgreSQL
sudo -u postgres psql
ALTER DATABASE evaluasi_mi_prod SET log_min_duration_statement = 1000;
# (log queries > 1 detik)
```

5. **Cek memory usage**
```bash
free -h
pm2 monit
```

---

## 🔐 SECURITY

### Q: Bagaimana proteksi dari brute force attack?

**A:** Sudah di-implement:
- Rate limiting 5 login attempts/15 menit
- JWT token expiry 7 hari
- Password hashing bcryptjs

---

### Q: Bagaimana handle SQL injection?

**A:** Sudah secure:
- Menggunakan Prisma ORM (parameterized queries)
- Input validation di semua endpoint
- No string concatenation di SQL

---

### Q: Bagaimana proteksi dari DDoS?

**A:** Gunakan:
- Nginx rate limiting (sudah configured)
- CloudFlare DDoS protection (optional, tambahan)
- AWS Shield (jika pakai AWS)

---

## 📞 KAPAN HARUS HUBUNGI SUPPORT?

**Hubungi support jika:**
- ❌ Tidak bisa SSH ke server
- ❌ Database hilang/corrupt
- ❌ 502 Bad Gateway persisten (> 1 jam)
- ❌ Security incident (unauthorized access)
- ❌ Disaster recovery perlu

**Jangan hubungi support untuk:**
- ✅ Upgrade feature (itu FASE 4)
- ✅ User training (hubungi admin)
- ✅ Bug reports (list di FASE2_BUGS_LOG.md)

---

## ✅ SUKSES DEPLOYMENT CHECKLIST

- [ ] Server SSH accessible
- [ ] Node.js, PostgreSQL, Nginx installed
- [ ] Database created & seeded
- [ ] Application start dengan PM2
- [ ] PM2 auto-startup configured
- [ ] SSL certificate working
- [ ] Nginx reverse proxy configured
- [ ] Health check OK (`curl https://domain/`)
- [ ] Login API OK
- [ ] Database backup scheduled
- [ ] Logs monitoring setup
- [ ] Team notified

---

**Pertanyaan lain? Hubungi tim teknis!**

---

**Dibuat**: 18 April 2026  
**Versi**: 1.0
