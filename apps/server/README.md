# AI Receptionist Backend

A Node.js backend that powers an AI receptionist MVP, enabling web-based voice calls where an AI answers customer questions and books appointments using real-time audio processing and OpenAI APIs.

## Features

- **Real-time Audio Processing**: WebSocket-based audio streaming with OpenAI Whisper STT and TTS
- **AI Conversation Management**: Context-aware responses using OpenAI GPT-4 with business data
- **Database Integration**: PostgreSQL with Prisma ORM for conversation and business data
- **RESTful API**: Complete CRUD operations for businesses and conversations
- **Authentication**: API key-based authentication system
- **Error Handling**: Comprehensive error handling with structured logging

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **WebSocket**: Socket.IO for real-time communication
- **AI Services**: OpenAI (GPT-4, Whisper STT, TTS)
- **Logging**: Winston for structured logging
- **Development**: tsx, nodemon for hot reloading

## Project Structure

```
src/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middleware/       # Express middleware
├── routes/          # API route definitions
├── types/           # TypeScript interfaces
├── utils/           # Utility functions
└── server.ts        # Main application entry
```

## Prerequisites

- Node.js 18+ 
- PostgreSQL database (NeonDB recommended)
- OpenAI API key

## Installation

1. **Clone the repository and navigate to the backend directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@host:port/database"
   OPENAI_API_KEY="sk-your-openai-api-key"
   PORT=3001
   CORS_ORIGIN="http://localhost:3000"
   ```

4. **Set up the database:**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database (if using existing database, skip this)
   # npm run db:push
   ```

## Development

**Start development server:**
```bash
npm run dev
```

**Start with tsx directly:**
```bash
npm run dev:tsx
```

**Build for production:**
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Businesses
- `GET /api/businesses` - List all businesses
- `GET /api/businesses/:id` - Get business details
- `GET /api/businesses/:id/context` - Get business context for AI

### Conversations
- `GET /api/conversations` - List conversations for a business
- `POST /api/conversations` - Create a new conversation
- `GET /api/conversations/:id` - Get conversation details
- `PATCH /api/conversations/:id/end` - End a conversation

### AI Conversations
- `POST /api/ai-conversations/start` - Start a new AI conversation
- `POST /api/ai-conversations/:sessionId/process` - Process user audio input
- `POST /api/ai-conversations/:sessionId/appointment` - Handle appointment booking
- `POST /api/ai-conversations/:sessionId/end` - End an AI conversation
- `GET /api/ai-conversations/:sessionId/status` - Get conversation status
- `GET /api/ai-conversations/business/:businessId/active` - Get active sessions
- `GET /api/ai-conversations/stats` - Get session statistics
- `POST /api/ai-conversations/cleanup` - Clean up inactive sessions

## Authentication

All API endpoints require an API key in the request headers:
```
X-API-Key: your-api-key-here
```

## Database Schema

The backend extends the existing database schema with new models:

- **Conversation**: Tracks AI receptionist sessions
- **Message**: Stores individual conversation messages
- **Business**: Company information and settings

## Development Phases

- ✅ **Phase 1**: Foundation
  - Project structure setup
  - Express server with basic routes
  - Database connection to existing NeonDB
  - Environment configuration

- ✅ **Phase 2**: Core Services (Current)
  - OpenAI service implementation (STT, TTS, ChatGPT)
  - Audio processing and validation
  - Enhanced conversation management
  - Business context services
  - AI conversation orchestrator
  - New API endpoints for AI conversations

- 🔄 **Phase 3**: WebSocket Integration
  - Socket.IO server setup
  - Audio streaming handlers
  - Real-time conversation flow

- ⏳ **Phase 4**: Business Logic
  - Business context injection
  - Advanced conversation management
  - Error handling and logging

- ⏳ **Phase 5**: Testing & Optimization
  - Test client for audio recording/playback
  - Performance optimization
  - Production readiness

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment mode | development |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:3000 |
| `MAX_AUDIO_SIZE` | Maximum audio file size (bytes) | 10485760 |
| `AUDIO_TIMEOUT` | Audio processing timeout (ms) | 30000 |

## Contributing

1. Follow the existing code style and structure
2. Add proper error handling and logging
3. Include TypeScript types for all new features
4. Test your changes thoroughly

## License

MIT License
