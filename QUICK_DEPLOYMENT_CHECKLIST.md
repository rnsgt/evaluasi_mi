# 🚀 QUICK START DEPLOYMENT (RINGKAS)
## Cara Cepat Memasang ke Server

**Baca**: PANDUAN_DEPLOYMENT_INDONESIA.md untuk penjelasan detail

---

## ⚡ TL;DR (Terlalu Panjang; Tidak Baca)

Jika sudah berpengalaman, berikut ringkasannya:

```bash
# 1. LOGIN KE SERVER
ssh admin@evaluasi.universitas.edu

# 2. SETUP SERVER
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs postgresql git nginx certbot python3-certbot-nginx
sudo npm install -g pm2

# 3. SIAPKAN FOLDER
sudo mkdir -p /var/www/evaluasi-mi
sudo chown $USER:$USER /var/www/evaluasi-mi
cd /var/www/evaluasi-mi
git clone https://github.com/anda/evaluasi-mi.git .

# 4. KONFIGURASI
cp backend/.env.production.template backend/.env.production
# EDIT backend/.env.production dengan nilai production

# 5. SETUP DATABASE
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo -u postgres psql << EOF
CREATE DATABASE evaluasi_mi_prod;
CREATE USER evaluasi_user WITH PASSWORD 'password-kuat';
ALTER ROLE evaluasi_user SET client_encoding TO 'utf8';
GRANT ALL PRIVILEGES ON DATABASE evaluasi_mi_prod TO evaluasi_user;
\q
EOF

# 6. INSTALL & MIGRATE
cd backend
npm install --production
export DATABASE_URL="postgresql://evaluasi_user:password@localhost:5432/evaluasi_mi_prod"
npx prisma migrate deploy
node prisma/seed.js

# 7. START APLIKASI
pm2 start server.js --name "evaluasi-mi-api" --env production
pm2 startup
pm2 save

# 8. SETUP SSL & NGINX
sudo certbot certonly --standalone -d evaluasi.universitas.edu --email admin@uni.edu --agree-tos
# CREATE /etc/nginx/sites-available/evaluasi-mi (lihat file PANDUAN_DEPLOYMENT_INDONESIA.md)
sudo ln -s /etc/nginx/sites-available/evaluasi-mi /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

# 9. TEST
curl https://evaluasi.universitas.edu/
# Harus return: "status": "running"

echo "✅ Deployment selesai!"
```

---

## 📋 STEP-BY-STEP CHECKLIST

### Phase 1: Persiapan (15 menit)
- [ ] SSH ke server berhasil
- [ ] Update system: `sudo apt update && sudo apt upgrade -y`
- [ ] Install Node.js 18
- [ ] Install PostgreSQL
- [ ] Install Nginx
- [ ] Install PM2: `sudo npm install -g pm2`

### Phase 2: Aplikasi (20 menit)
- [ ] Folder `/var/www/evaluasi-mi` sudah dibuat
- [ ] Source code sudah di-clone/copy
- [ ] `.env.production` sudah diedit dengan nilai correct
- [ ] Database `evaluasi_mi_prod` sudah dibuat
- [ ] User `evaluasi_user` sudah dibuat
- [ ] Dependencies sudah diinstall: `npm install --production`
- [ ] Migrations sudah dijalankan: `npx prisma migrate deploy`
- [ ] Seed sudah dijalankan: `node prisma/seed.js`

### Phase 3: Deployment (10 menit)
- [ ] PM2 sudah start aplikasi
- [ ] PM2 sudah setup auto-startup
- [ ] Health check berhasil: `curl https://yourdomain/`
- [ ] Login API berhasil: `curl -X POST https://yourdomain/api/auth/login`

### Phase 4: SSL & Reverse Proxy (10 menit)
- [ ] SSL certificate sudah di-generate
- [ ] Nginx config sudah dibuat
- [ ] Nginx sudah restart
- [ ] HTTPS working & redirect HTTP ke HTTPS

### Phase 5: Monitoring (5 menit)
- [ ] PM2 logs berjalan normal
- [ ] Backup script sudah dibuat
- [ ] Cron job backup sudah dijadwalkan
- [ ] DB backup manual berhasil

---

## 🎯 PERINTAH UMUM SEHARI-HARI

**Melihat status:**
```bash
pm2 status
pm2 logs evaluasi-mi-api
pm2 monit
```

**Restart:**
```bash
pm2 restart evaluasi-mi-api
sudo systemctl restart nginx
```

**Backup manual:**
```bash
pg_dump -U evaluasi_user evaluasi_mi_prod | gzip > backup_$(date +%Y%m%d).sql.gz
```

**Edit config:**
```bash
nano backend/.env.production
# setelah edit
pm2 restart evaluasi-mi-api
```

---

## 🚨 JIKA ADA MASALAH

```bash
# 1. Cek logs
pm2 logs evaluasi-mi-api | tail -50

# 2. Cek database connect
psql -U evaluasi_user -d evaluasi_mi_prod -c "SELECT 1"

# 3. Cek port 3002
lsof -i :3002

# 4. Cek Nginx
sudo nginx -t
sudo systemctl status nginx

# 5. Restart semua
pm2 restart evaluasi-mi-api
sudo systemctl restart nginx

# 6. Cek dari luar
curl -v https://evaluasi.universitas.edu/
```

---

## 📊 RINGKAS PERUBAHAN DARI LOCAL KE PRODUCTION

| Item | Local (Dev) | Production |
|------|-----------|-----------|
| Server | Laptop/PC Anda | Linux VPS/Hosting |
| Database | localhost | 192.168.x.x atau managed DB |
| PORT | 3002 | 3002 (di belakang Nginx) |
| SSL | Tidak ada | https:// dengan certificate |
| Reverse Proxy | Tidak ada | Nginx |
| Process Manager | Expo only | PM2 + Nginx |
| Auto-restart | Manual | PM2 otomatis |
| Backup | Manual | Cron otomatis |

---

## ✅ SUKSES INDICATORS

Deployment berhasil jika:

✅ `curl https://yourdomain/` return status 200 dengan "status": "running"  
✅ Login API berhasil return token  
✅ `pm2 status` show "online"  
✅ Browser akses aplikasi tanpa error SSL  
✅ Bisa login sebagai mahasiswa & admin  
✅ Bisa submit evaluasi  
✅ Database backup running otomatis  

---

**Selamat deploy! 🚀**

Pertanyaan? Baca **PANDUAN_DEPLOYMENT_INDONESIA.md** untuk detail lengkap.
