# ChatApp 💬

A full-stack real-time chat application built with modern technologies.

## ✨ Features

- 🔐 JWT authentication with HttpOnly cookies
- 💬 Real-time messaging with Socket.io
- 👥 Group chats with admin controls
- 🟢 Online presence indicators
- ⌨️ Typing indicators
- ✓✓ Read receipts
- 🤖 AI-powered conversation summarization (Gemini)
- 🖼️ Image sharing via Cloudinary
- 🎨 30+ themes via daisyUI
- 📱 Responsive design

## 🛠️ Tech Stack

### Backend
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- Socket.io + Redis adapter
- Zod validation
- JWT + bcrypt

### Frontend
- React 18 + Vite + TypeScript
- Zustand state management
- Tailwind CSS v4 + daisyUI v5
- Socket.io client
- Axios

### Infrastructure
- Docker Compose (PostgreSQL + Redis)
- pnpm monorepo with shared types
- GitHub Actions CI

## 🚀 Getting Started

### Prerequisites
- Node.js v20+
- pnpm
- Docker Desktop

### 1. Clone and install
```bash
git clone https://github.com/yourusername/chat-app.git
cd chat-app
pnpm install
```

### 2. Set up environment variables
```bash
cp apps/backend/.env.example apps/backend/.env
# Fill in your values in apps/backend/.env
```

### 3. Start Docker services
```bash
docker-compose up -d
```

### 4. Run database migrations
```bash
cd apps/backend
pnpm db:migrate
pnpm db:generate
```

### 5. Start development servers
```bash
# Terminal 1 — Backend
cd apps/backend && pnpm dev

# Terminal 2 — Frontend
cd apps/frontend && pnpm dev
```

Visit `http://localhost:5173`

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `GEMINI_API_KEY` | Google Gemini API key |
| `CLIENT_URL` | Frontend URL for CORS |

## 📁 Project Structure

```
chat-app/
├── apps/
│   ├── backend/          ← Express API + Socket.io
│   └── frontend/         ← React + Vite
├── packages/
│   └── shared/           ← Shared TypeScript types
├── docker-compose.yml
└── .github/workflows/    ← CI pipeline
```

## 📜 License
MIT