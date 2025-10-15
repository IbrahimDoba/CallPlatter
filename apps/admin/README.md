# Admin Dashboard

This is the admin dashboard for the AI Receptionist platform, built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- **Dashboard Overview**: View platform statistics and metrics
- **Business Management**: Manage businesses and their configurations
- **Call Analytics**: Monitor call performance and analytics
- **Billing Management**: Handle subscriptions and billing
- **User Management**: Admin user controls and permissions

## Development

```bash
# Run the admin app in development mode
pnpm admin:dev

# Build the admin app
pnpm build --filter=admin

# Run linting
pnpm lint --filter=admin
```

## Port

The admin app runs on port **3002** to avoid conflicts with:
- Client app (port 3000)
- Server (port 3001)

## Architecture

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with design system
- **Database**: Shared Prisma client from `@repo/db`
- **API**: Proxy to backend server
- **Build**: Turbo for monorepo orchestration

## Integration

The admin app integrates with:
- **Database**: Shared Prisma schema and client
- **Backend API**: Proxied through Next.js rewrites
- **Design System**: Consistent with client app
- **Build System**: Turbo monorepo configuration