# 📦 DEPLOYMENT GUIDE
## Step-by-Step Production Deployment Instructions

**Created**: April 18, 2026  
**For**: Evaluasi MI Application  
**Target Environment**: Production (Linux/Ubuntu Server)  

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### Requirements
- [ ] Production server (Ubuntu 20.04 LTS or later)
- [ ] PostgreSQL 12+ installed on server or managed service
- [ ] Node.js 18+ installed
- [ ] PM2 installed globally (`npm install -g pm2`)
- [ ] Git installed
- [ ] SSL certificate (Let's Encrypt or purchased)
- [ ] Domain name configured and pointing to server
- [ ] 2GB+ RAM available
- [ ] 10GB+ disk space available

### Backup & Rollback Plan
- [ ] Current database backed up
- [ ] Previous version tagged in git
- [ ] Rollback plan documented
- [ ] Team notified of deployment window

---

## 🔧 STEP 1: SERVER SETUP (30 minutes)

### 1.1 Connect to Production Server
```bash
# SSH into your production server
ssh admin@your-production-server.com

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

### 1.2 Create Application Directory
```bash
# Create app directory
sudo mkdir -p /var/www/evaluasi-mi
sudo chown $USER:$USER /var/www/evaluasi-mi
cd /var/www/evaluasi-mi

# Clone repository (replace with your repo URL)
git clone https://your-repo-url.git .
# Or copy files via SCP:
# scp -r ./evaluasi_mi admin@server:/var/www/evaluasi-mi/
```

### 1.3 Prepare Environment Files
```bash
# Copy environment template
cp backend/.env.production.template backend/.env.production

# Edit with production values (use nano or vim)
nano backend/.env.production

# IMPORTANT: Change these values:
# DB_HOST=your-prod-db-host.com
# DB_PORT=5432
# DB_NAME=evaluasi_mi_prod
# DB_USER=evaluasi_user
# DB_PASSWORD=your-strong-database-password
# JWT_SECRET=your-generated-32-char-secret
# ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

### 1.4 Generate Strong JWT Secret
```bash
# Generate a secure random JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy the output and paste it into .env.production as JWT_SECRET
```

---

## 🗄️ STEP 2: DATABASE SETUP (15 minutes)

### 2.1 If Using Local PostgreSQL
```bash
# Install PostgreSQL (if not installed)
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE evaluasi_mi_prod;
CREATE USER evaluasi_user WITH PASSWORD 'your-strong-password';
ALTER ROLE evaluasi_user SET client_encoding TO 'utf8';
ALTER ROLE evaluasi_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE evaluasi_user SET default_transaction_deferrable TO on;
ALTER ROLE evaluasi_user SET default_transaction_read_committed TO off;
ALTER ROLE evaluasi_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE evaluasi_mi_prod TO evaluasi_user;
\q
```

### 2.2 If Using Managed Database (AWS RDS, Azure, etc.)
```bash
# Verify connection from server
psql -h your-db-endpoint.region.rds.amazonaws.com \
     -U evaluasi_user \
     -d evaluasi_mi_prod \
     -c "SELECT 1"

# Should return success message
```

### 2.3 Run Migrations
```bash
cd /var/www/evaluasi-mi/backend

# Set database URL for migration
export DATABASE_URL="postgresql://evaluasi_user:password@localhost:5432/evaluasi_mi_prod"

# Run Prisma migrations
npx prisma migrate deploy

# Seed initial data (admin account, dosen, fasilitas)
node prisma/seed.js

# Verify database setup
npx prisma db execute --stdin < prisma/schema.prisma
```

---

## 📦 STEP 3: APPLICATION DEPLOYMENT (20 minutes)

### 3.1 Install Dependencies
```bash
cd /var/www/evaluasi-mi

# Install backend dependencies
cd backend
npm install --production

# Install frontend dependencies (if needed)
cd ..
npm install --production
```

### 3.2 Verify Configuration
```bash
cd backend

# Check environment validation
node -e "require('./config/env').checkEnvVars()"
# Should output: ✅ All environment variables validated

# Test database connection
node -e "require('./config/database').testConnection()"
# Should output: ✅ Database connection successful
```

### 3.3 Start Application with PM2
```bash
cd /var/www/evaluasi-mi/backend

# Start the application
pm2 start server.js --name "evaluasi-mi-api" \
  --env production \
  --watch false \
  --max-memory-restart 512M \
  --error /var/log/evaluasi-mi/error.log \
  --output /var/log/evaluasi-mi/app.log

# Make it auto-restart on server reboot
pm2 startup
pm2 save

# View logs
pm2 logs evaluasi-mi-api
```

### 3.4 Create Log Directory
```bash
# Create logs directory
sudo mkdir -p /var/log/evaluasi-mi
sudo chown $USER:$USER /var/log/evaluasi-mi
```

---

## 🔒 STEP 4: HTTPS/SSL SETUP (10 minutes)

### 4.1 Using Let's Encrypt (Free)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Or for Apache:
# sudo apt install -y certbot python3-certbot-apache

# Generate certificate
sudo certbot certonly --standalone \
  -d yourdomain.com \
  -d app.yourdomain.com \
  -d api.yourdomain.com \
  --email admin@yourdomain.com \
  --agree-tos \
  --non-interactive

# Certificates are at: /etc/letsencrypt/live/yourdomain.com/

# Set up auto-renewal
sudo certbot renew --dry-run
```

### 4.2 Configure Nginx Reverse Proxy (Recommended)
```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/evaluasi-mi

# Paste this configuration:
```

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com app.yourdomain.com api.yourdomain.com;
    
    return 301 https://$server_name$request_uri;
}

# HTTPS configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com app.yourdomain.com api.yourdomain.com;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;
    
    # Reverse proxy to Node.js app
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=general:10m rate=100r/m;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    
    # Apply rate limiting to login endpoint
    location /api/auth/login {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
    
    # Apply general rate limit to other endpoints
    location /api/ {
        limit_req zone=general burst=50 nodelay;
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/evaluasi-mi \
           /etc/nginx/sites-enabled/evaluasi-mi

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx config
sudo nginx -t
# Should show: successful

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# Verify Nginx is running
sudo systemctl status nginx
```

---

## ✅ STEP 5: VERIFICATION (15 minutes)

### 5.1 Health Check
```bash
# Test API health endpoint
curl -k https://yourdomain.com/
# Should return JSON with status: running, database: connected

# Test HTTPS redirect
curl -i http://yourdomain.com/
# Should show 301 redirect to https://
```

### 5.2 Authentication Test
```bash
# Test login endpoint
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nim":"210101001","password":"12345"}'

# Should return token in response
```

### 5.3 Rate Limiting Test
```bash
# Try rapid login attempts (should succeed first 5)
for i in {1..10}; do
  curl -X POST https://yourdomain.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"nim":"test","password":"wrong"}' 2>/dev/null | grep -o "success"
done

# Should see failures after 5 attempts
```

### 5.4 Security Headers
```bash
# Check for security headers
curl -i https://yourdomain.com/ | grep -E "X-Frame-Options|X-Content-Type-Options|Strict-Transport-Security"

# Should show security headers from Helmet
```

### 5.5 SSL Certificate
```bash
# Check certificate validity
echo | openssl s_client -servername yourdomain.com -connect yourdomain.com:443 2>/dev/null | \
  openssl x509 -noout -dates

# Should show dates (not expired)
```

### 5.6 Application Test
```bash
# Open in browser:
# https://yourdomain.com

# Try these flows:
# 1. Login as student (210101001/12345)
# 2. Submit evaluation (dosen)
# 3. Check dashboard/stats
# 4. Logout
# 5. Login as admin (admin@gmail.com/password123)
# 6. View reports
```

---

## 📊 STEP 6: MONITORING SETUP (10 minutes)

### 6.1 PM2 Web Dashboard
```bash
# Start PM2 web interface
pm2 web

# Access at: http://localhost:9615
# Username: admin
# Password: admin
```

### 6.2 Log Rotation
```bash
# Install log rotation
pm2 install pm2-logrotate

# Configure (optional)
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 10
```

### 6.3 Monitoring Script
```bash
# Create monitoring script
cat > /usr/local/bin/check-app-status.sh << 'EOF'
#!/bin/bash
# Simple health check

ENDPOINT="https://yourdomain.com"
RESPONSE=$(curl -s -w "%{http_code}" "$ENDPOINT")
HTTP_CODE=${RESPONSE: -3}

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Application is healthy"
    exit 0
else
    echo "❌ Application error: HTTP $HTTP_CODE"
    # Send alert (email, Slack, etc.)
    exit 1
fi
EOF

chmod +x /usr/local/bin/check-app-status.sh

# Add to crontab for periodic checks
crontab -e
# Add this line to check every 5 minutes:
# */5 * * * * /usr/local/bin/check-app-status.sh
```

---

## 🔄 STEP 7: BACKUP & MAINTENANCE

### 7.1 Database Backup
```bash
# Create backup script
cat > /usr/local/bin/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/evaluasi-mi"
DATE=$(date +%Y-%m-%d_%H:%M:%S)
FILENAME="evaluasi_mi_${DATE}.sql.gz"

mkdir -p $BACKUP_DIR
pg_dump -h your-db-host -U evaluasi_user evaluasi_mi_prod | \
  gzip > $BACKUP_DIR/$FILENAME

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $FILENAME"
EOF

chmod +x /usr/local/bin/backup-db.sh

# Schedule daily backup
# Add to crontab:
# 0 2 * * * /usr/local/bin/backup-db.sh
```

### 7.2 Application Logs
```bash
# View application logs
pm2 logs evaluasi-mi-api

# View specific lines
tail -f /var/log/evaluasi-mi/app.log

# Search logs
grep "error" /var/log/evaluasi-mi/app.log
```

### 7.3 Security Updates
```bash
# Check for vulnerable packages
npm audit

# Update packages safely
npm update

# Restart application
pm2 restart evaluasi-mi-api
```

---

## 🚨 ROLLBACK PROCEDURE (If Needed)

### Quick Rollback
```bash
# Stop current version
pm2 stop evaluasi-mi-api

# Checkout previous version
cd /var/www/evaluasi-mi
git checkout previous-working-tag

# Reinstall dependencies
npm install --production

# Restart
pm2 start server.js --name "evaluasi-mi-api"
```

### Database Rollback
```bash
# Stop application
pm2 stop evaluasi-mi-api

# Restore from backup
gunzip < /var/backups/evaluasi-mi/evaluasi_mi_2026-04-18_14:00:00.sql.gz | \
  psql -h your-db-host -U evaluasi_user evaluasi_mi_prod

# Restart
pm2 start evaluasi-mi-api
```

---

## 📞 SUPPORT & TROUBLESHOOTING

### Application Not Starting
```bash
# Check logs
pm2 logs evaluasi-mi-api

# Verify environment
cat backend/.env.production

# Test manually
cd backend && node server.js
```

### Database Connection Issues
```bash
# Test connection
psql -h your-db-host -U evaluasi_user -d evaluasi_mi_prod -c "SELECT 1"

# Check credentials in .env.production
# Verify database server is running
sudo systemctl status postgresql
```

### Port Already in Use
```bash
# Find process using port 3002
lsof -i :3002

# Kill it
kill -9 <PID>

# Or change port in .env.production
```

### High CPU/Memory Usage
```bash
# Check what's running
top

# Monitor application memory
pm2 monit

# Restart application
pm2 restart evaluasi-mi-api
```

---

## ✨ DEPLOYMENT COMPLETE!

Your application is now live at:
- **Web**: https://yourdomain.com
- **API**: https://api.yourdomain.com
- **Admin**: https://yourdomain.com (login as admin)

**Next Steps:**
1. Monitor logs for issues
2. Verify database backups working
3. Share with users for testing
4. Collect feedback
5. Plan for FASE 4 enhancements

**Support**: Contact your DevOps team for assistance

---

**Created**: April 18, 2026  
**Last Updated**: April 18, 2026  
**Deployment Guide Version**: 1.0
