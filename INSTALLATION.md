# Installation Guide

This document provides step-by-step instructions for installing and configuring PopReklam on your server.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Pre-Installation Checklist](#pre-installation-checklist)
3. [Installation Steps](#installation-steps)
4. [Database Configuration](#database-configuration)
5. [Environment Setup](#environment-setup)
6. [Running the Application](#running-the-application)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements

| Component | Requirement |
|-----------|-------------|
| **Node.js** | 18.0 or higher |
| **MySQL** | 8.0 or higher |
| **RAM** | 2 GB minimum |
| **Disk Space** | 1 GB minimum |
| **Operating System** | Windows, macOS, or Linux |

### Recommended for Production

- **Node.js**: 20.x LTS
- **MySQL**: 8.0+ with InnoDB engine
- **RAM**: 4 GB or more
- **CPU**: 2+ cores
- **SSL Certificate**: For HTTPS

---

## Pre-Installation Checklist

Before you begin, ensure you have:

- [ ] Node.js installed (`node --version` to check)
- [ ] MySQL installed and running
- [ ] npm or yarn package manager
- [ ] Database access credentials
- [ ] Basic command line knowledge
- [ ] Text editor for configuration files

---

## Installation Steps

### Step 1: Extract Files

```bash
# Extract the downloaded archive
unzip popreklam.zip

# Navigate to project directory
cd popreklam
```

### Step 2: Install Backend Dependencies

```bash
# Navigate to backend folder
cd backend

# Install Node.js packages
npm install

# This will install:
# - Express.js
# - Prisma ORM
# - JWT authentication
# - bcryptjs for password hashing
# - And other dependencies...
```

### Step 3: Install Frontend Dependencies

```bash
# Navigate to frontend folder
cd ../frontend-landing

# Install Node.js packages
npm install

# This will install:
# - Next.js 14
# - React 18
# - TailwindCSS
# - Lucide icons
# - And other dependencies...
```

---

## Database Configuration

### Step 1: Create MySQL Database

```sql
-- Login to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE popads CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create dedicated user (recommended for production)
CREATE USER 'popads_user'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON popads.* TO 'popads_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### Step 2: Configure Database Connection

```bash
# Navigate to backend folder
cd backend

# Copy example environment file
cp .env.example .env

# Edit .env file with your favorite text editor
# Example for Windows:
notepad .env

# Example for Mac/Linux:
nano .env
```

**Edit the following variables in `.env`:**

```env
# Database (adjust according to your setup)
DATABASE_URL="mysql://popads_user:your_secure_password@localhost:3306/popads"

# Server
PORT=5000
NODE_ENV=development

# JWT Secret (generate a strong random string!)
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# CORS
CORS_ORIGIN="http://localhost:3000"
```

**⚠️ Important:** Change `JWT_SECRET` to a strong random string in production!

### Step 3: Run Database Migrations

```bash
# Still in backend folder
# Generate Prisma client
npx prisma generate

# Run migrations to create tables
npx prisma migrate deploy

# Or if in development:
npx prisma migrate dev
```

### Step 4: Seed Database (Optional but Recommended)

```bash
# Run enhanced seed for demo data
node prisma/enhanced-seed.js

# This creates:
# - 2 Publisher accounts
# - 2 Advertiser accounts
# - 7 Websites
# - 6 Campaigns
# - 6000+ Impressions
# - Transaction history
```

---

## Environment Setup

### Backend Environment (`.env`)

Create `backend/.env` with these variables:

```env
# Application
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="mysql://username:password@localhost:3306/popads"

# Authentication
JWT_SECRET="change-this-to-a-random-secret-key"
JWT_EXPIRES_IN="7d"

# CORS (comma-separated for multiple origins)
CORS_ORIGIN="http://localhost:3000"

# Optional: Email Configuration (for future features)
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT=587
# SMTP_USER="your-email@gmail.com"
# SMTP_PASS="your-app-password"
```

### Frontend Environment

Create `frontend-landing/.env.local`:

```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Optional: Analytics
# NEXT_PUBLIC_GA_ID=UA-XXXXXXXXX-X
```

---

## Running the Application

### Development Mode

**Terminal 1: Start Backend**

```bash
cd backend
npm run dev

# Backend will start on http://localhost:5000
# You should see: "Server running on port 5000"
```

**Terminal 2: Start Frontend**

```bash
cd frontend-landing
npm run dev

# Frontend will start on http://localhost:3000
# You should see: "Ready - started server on 0.0.0.0:3000"
```

### Access the Application

- **Homepage**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Publisher Dashboard**: http://localhost:3000/publisher
- **Advertiser Dashboard**: http://localhost:3000/advertiser
- **Backend API**: http://localhost:5000/api

### Demo Credentials (if you ran the seed)

**Publisher:**
- Email: `akartolga0@gmail.com`
- Password: `Ta170104894*`

**Advertiser:**
- Email: `akartolga0+advertiser@gmail.com`
- Password: `Ta170104894*`

**⚠️ IMPORTANT:** Change these credentials before deploying to production!

---

## Production Deployment

### Build for Production

**Backend:**

```bash
cd backend

# Set production environment
# Edit .env and change:
NODE_ENV=production

# Start with PM2 (recommended)
npm install -g pm2
pm2 start src/server.js --name "popreklam-api"
pm2 save
pm2 startup
```

**Frontend:**

```bash
cd frontend-landing

# Build optimized production bundle
npm run build

# Start production server
npm start

# Or use PM2
pm2 start npm --name "popreklam-web" -- start
```

### Recommended Hosting Providers

**Backend API:**
- [Railway.app](https://railway.app) - Easy deployment
- [Render.com](https://render.com) - Free tier available
- [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform)
- AWS EC2 or similar VPS

**Frontend:**
- [Vercel](https://vercel.com) - Optimized for Next.js
- [Netlify](https://netlify.com)
- [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform)

**Database:**
- [PlanetScale](https://planetscale.com) - MySQL compatible
- [AWS RDS](https://aws.amazon.com/rds/)
- [DigitalOcean Managed Database](https://www.digitalocean.com/products/managed-databases)

### SSL Configuration

For production, always use HTTPS:

1. **Obtain SSL Certificate**:
   - Use Let's Encrypt (free)
   - Or get from your hosting provider

2. **Configure Nginx** (example):

```nginx
server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. **Update Environment Variables**:

```env
# backend/.env
CORS_ORIGIN="https://yourdomain.com"

# frontend/.env.local
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

---

## Troubleshooting

### Common Issues

#### 1. "Cannot connect to database"

**Solution:**
- Check MySQL is running: `mysql -u root -p`
- Verify DATABASE_URL in `.env`
- Ensure database exists: `SHOW DATABASES;`
- Check user permissions

#### 2. "Port already in use"

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>

# Or change PORT in .env
```

#### 3. "JWT malformed" or authentication errors

**Solution:**
- Clear browser localStorage
- Check JWT_SECRET is set in backend/.env
- Regenerate tokens by logging in again

#### 4. "Module not found" errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 5. Prisma migration errors

**Solution:**
```bash
# Reset database (⚠️ deletes all data!)
npx prisma migrate reset

# Or manually:
npx prisma migrate deploy
npx prisma generate
```

### Getting Help

1. Check the `USER_GUIDE.md` for usage questions
2. Review error messages in terminal/console
3. Check browser DevTool console for frontend errors
4. Verify all environment variables are set correctly

---

## Security Checklist for Production

- [ ] Change all default passwords
- [ ] Generate strong JWT_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up regular database backups
- [ ] Enable rate limiting
- [ ] Remove demo/test accounts
- [ ] Update CORS_ORIGIN to your domain
- [ ] Set NODE_ENV=production
- [ ] Keep dependencies updated

---

## Next Steps

After installation:

1. ✅ Login with demo credentials
2. ✅ Explore Publisher and Advertiser dashboards
3. ✅ Review `USER_GUIDE.md` for feature documentation
4. ✅ Customize branding and settings
5. ✅ Configure payment gateways
6. ✅ Deploy to production

---

**Installation complete! 🎉**

For questions, refer to `USER_GUIDE.md` or the documentation in each section.
