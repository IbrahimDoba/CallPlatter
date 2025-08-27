# CallPlatter - AI Receptionist SaaS

An AI-powered receptionist SaaS that answers missed calls for Nigerian businesses, uses AI voice technology, and books appointments into a CRM. Built with Next.js 14, TypeScript, and modern web technologies.

## 🚀 Features

- **AI Voice Assistant**: Natural conversation handling with GPT-4
- **Call Management**: Track and manage all incoming calls
- **Appointment Booking**: Automated appointment scheduling during calls
- **Business Dashboard**: Comprehensive analytics and insights
- **Multi-tenant Architecture**: Secure data isolation by business
- **Africa's Talking Integration**: Optimized for Nigerian telecom networks
- **Modern UI**: Built with shadcn/ui components
- **Webhook Support**: External integrations with Zapier, Make.com, n8n

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+ (TypeScript, TailwindCSS, shadcn/ui)
- **Backend**: Node.js with Express (TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (multi-tenant support)
- **Telephony**: Africa's Talking Voice API
- **AI/LLM**: OpenAI GPT-4 for conversation handling
- **Speech-to-Text**: OpenAI Whisper API
- **Text-to-Speech**: ElevenLabs API or Play.ht

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Africa's Talking account
- OpenAI API key
- ElevenLabs API key (optional)

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd CallPlatter
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# Africa's Talking (NOT Twilio)
AFRICASTALKING_USERNAME=your_username
AFRICASTALKING_API_KEY=your_api_key

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/ai_receptionist

# OpenAI
OPENAI_API_KEY=your_openai_key

# TTS
ELEVENLABS_API_KEY=your_elevenlabs_key

# NextAuth
NEXTAUTH_SECRET=your_secret_key_here
NEXTAUTH_URL=http://localhost:3000

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set up the database

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# (Optional) Run migrations
pnpm db:migrate
```

### 5. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
ai-receptionist-saas/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── africastalking/
│   │   │   │   └── call/      # Africa's Talking webhook
│   │   │   ├── appointments/  # Appointment management
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── calls/         # Call management
│   │   │   ├── dashboard/     # Dashboard stats
│   │   │   ├── settings/      # Business settings
│   │   │   └── webhooks/      # External integrations
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Dashboard pages
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   └── providers.tsx      # Client providers
│   └── lib/
│       ├── auth.ts            # NextAuth configuration
│       ├── prisma.ts          # Prisma client
│       └── utils.ts           # Utility functions
├── package.json
└── README.md
```

## 🔧 Database Schema

The application uses a multi-tenant database schema with the following models:

- **Business**: Business information and settings
- **Call**: Call records with transcripts and intents
- **Schedule**: Appointment bookings

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Business registration
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics

### Calls
- `GET /api/calls` - Fetch business calls

### Appointments
- `GET /api/appointments` - Fetch appointments
- `POST /api/appointments` - Create appointment

### Settings
- `GET /api/settings` - Fetch business settings
- `PUT /api/settings` - Update business settings

### Africa's Talking
- `POST /api/africastalking/call` - Voice call webhook

### Webhooks
- `POST /api/webhooks/appointments` - External integrations

## 🎯 Key Features Implementation

### 1. Multi-tenant Architecture
All data is scoped by `businessId` to ensure proper data isolation between businesses.

### 2. AI Voice Processing
The voice processing pipeline follows: **STT (Whisper) → LLM (GPT-4) → TTS (ElevenLabs) → Africa's Talking response**

### 3. Africa's Talking Integration
Uses Africa's Talking Voice API (not Twilio) for better Nigerian network optimization and compliance.

### 4. Modern UI/UX
Built with shadcn/ui components for a consistent, modern interface.

## 🔒 Security Features

- Multi-tenant data isolation
- Password hashing with bcrypt
- JWT-based authentication
- Input validation with Zod
- CORS protection
- Rate limiting (recommended for production)

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📞 Africa's Talking Setup

1. Create an account at [Africa's Talking](https://africastalking.com/)
2. Get your API credentials
3. Configure your webhook URL: `https://yourdomain.com/api/africastalking/call`
4. Set up your phone number for voice calls

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@callplatter.com or create an issue in the repository.

## 🔮 Roadmap

- [ ] Advanced voice customization
- [ ] Multi-language support
- [ ] SMS integration
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] API rate limiting
- [ ] Advanced webhook security
- [ ] Call recording and playback
- [ ] Customer relationship management
- [ ] Payment integration
