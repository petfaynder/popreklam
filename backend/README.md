# Pop Ads Platform - Backend API

Professional advertising platform backend with Prisma, PostgreSQL, Redis, and JWT authentication.

## Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Start development server
npm run dev
```

## Project Structure

```
backend/
├── src/
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Auth, validation, error handling
│   ├── routes/         # API routes
│   ├── utils/          # Database, Redis, logger utilities
│   └── server.js       # Express app entry point
├── prisma/
│   └── schema.prisma   # Database schema
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify/:token` - Verify email (coming soon)
- `POST /api/auth/forgot-password` - Reset password (coming soon)

### Publisher (requires AUTH + PUBLISHER role)
- `GET /api/publisher/dashboard` - Dashboard stats
- `GET /api/publisher/sites` - Get all sites
- `POST /api/publisher/sites` - Create new site
- `GET /api/publisher/placements` - Get ad placements
- `POST /api/publisher/placements` - Create placement
- `GET /api/publisher/stats` - Statistics
- `POST /api/publisher/withdraw` - Request withdrawal

### Advertiser (requires AUTH + ADVERTISER role)
- `GET /api/advertiser/dashboard` - Dashboard stats
- `GET /api/advertiser/campaigns` - Get campaigns
- `POST /api/advertiser/campaigns` - Create campaign
- `GET /api/advertiser/creatives` - Get creatives
- `POST /api/advertiser/creatives` - Create creative
- `POST /api/advertiser/deposit` - Add funds

### Admin (requires AUTH + ADMIN role)
- `GET /api/admin/dashboard` - Platform stats
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/:id/status` - Update user status
- `GET /api/admin/sites` - Get all sites
- `PATCH /api/admin/sites/:id/status` - Approve/reject sites

### Ad Serving
- `GET /ad/tag.js?pid=<placementId>&fmt=<format>` - Ad tag script
- `POST /ad/request` - RTB ad request
- `POST /ad/track/impression` - Track impression
- `POST /ad/track/click` - Track click

## Environment Variables

See `.env.example` for all required variables.

## Development

```bash
# Run server with auto-reload
npm run dev

# Database
npx prisma studio     # Open Prisma Studio
npx prisma migrate dev # Create new migration

# Logs
tail -f logs/combined.log
```

## Tech Stack

- **Express.js** - Web framework
- **Prisma** - ORM
- **PostgreSQL** - Main database
- **Redis** - Caching & sessions
- **JWT** - Authentication
- **Winston** - Logging
- **Helmet** - Security
- **Express Rate Limit** - Rate limiting
