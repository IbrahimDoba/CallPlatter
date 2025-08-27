# Database Setup Guide

## Quick Setup

1. **Install dependencies:**
   ```bash
   cd packages/db
   pnpm install
   ```

2. **Generate Prisma client:**
   ```bash
   pnpm db:generate
   ```

3. **Set up your database:**
   - Make sure PostgreSQL is running
   - Create a database
   - Update your environment variables with the correct DATABASE_URL

4. **Push schema to database:**
   ```bash
   pnpm db:push
   ```

## Environment Variables

Create `.env` files in both `client/` and `server/` directories:

**client/.env.local:**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:3001
```

**server/.env:**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

## Troubleshooting

- Make sure PostgreSQL is running
- Verify your database credentials
- Check that the database exists
- Ensure Prisma client is generated before running the app
