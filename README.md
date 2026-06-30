# DuePilot AI
<div align="center"><b>Navigate Every Deadline</b></div>

<div align="center">

[![React](https://img.shields.io/badge/React-18.2-355872?logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Groq AI](https://img.shields.io/badge/Groq-LLaMA_3.3--70B-F97316?logo=groq&logoColor=white)](https://groq.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-355872)](LICENSE)

**An intelligent AI-powered productivity platform that helps you finish tasks — not just remember them.**

<br>

🌐 **Live App:** [rs-duepilot.vercel.app](https://rs-duepilot.vercel.app) · **API:** [duepilot-backend-production.up.railway.app](https://duepilot-backend-production.up.railway.app)

</div>

---

## Overview

DuePilot AI combines a full-stack MERN application with the power of Groq's LLaMA 3.3-70B model to create a proactive task management experience. It predicts risks, breaks down complex tasks, generates smart schedules, and provides daily coaching — all through a clean, professional interface.

> No more missed deadlines. Let AI navigate you through every one.

---

## Features

### 🤖 AI-Powered Intelligence

| Feature | Description |
|---------|-------------|
| **Task Breakdown** | Automatically splits large tasks into actionable subtasks with estimated durations |
| **Priority Prediction** | AI predicts whether a task is high/medium/low priority with reasoning |
| **Risk Analysis** | Analyzes tasks against deadlines to detect at-risk items before they're missed |
| **Smart Scheduling** | Generates optimized daily schedules based on priorities and available time slots |
| **Daily & Weekly Reports** | AI coach generates personalized productivity reports with scores, trends, and suggestions |
| **Holistic Rescue Mode** | Emergency intervention analyzing ALL pending tasks — generates a focused rescue plan prioritizing the most critical deadlines |
| **Goal Milestone Planning** | Long-term goals get AI-suggested milestones to keep you on track |
| **AI Study Planner** | Generates optimized study/task plans with time blocks, breaks, and smart scheduling |
| **Pattern Insights** | Detects behavioral patterns (procrastination, peak hours, bottlenecks) from granular action logs |
| **Smart Notifications** | Groq-generated context-aware notifications with 5 subtypes (deadline, encouragement, milestone, tip, warning) |
| **Smart Reminders** | Context-aware reminders generated based on task status and deadlines |

### 📋 Task Management

- Full CRUD with real-time status updates
- Filter by status (all, pending, in-progress, completed)
- Priority tags with color-coded badges
- Risk scoring on each task card
- Inline progress tracking
- **Targets** — set personal deadlines earlier than the actual due date

### 📊 Analytics & Insights

- Weekly productivity trends (Recharts line chart)
- Category breakdown (pie chart)
- Tasks by category (bar chart)
- Priority distribution chart
- Risk trend over time (line chart)
- Completion rate, focus hours, streak tracking, and daily scores

### 🎯 Goal Tracking

- Create long-term goals with deadlines and categories
- Milestone checklists with auto-calculated progress
- AI-assisted milestone suggestions on goal creation

### ⏱️ Focus Mode

- Built-in Pomodoro timer with configurable durations
- Focus / Break / Long Break cycles
- Session counter and task selection

### 🔐 Authentication & Security

- JWT-based authentication with bcrypt password hashing
- Protected routes with automatic redirect
- Token persistence in localStorage
- Auto-logout on 401 responses

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 18** | UI library |
| **Vite 5** | Build tool and dev server |
| **Tailwind CSS 3** | Utility-first styling |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP client with interceptors |
| **Recharts** | Charts and data visualization |
| **React Hot Toast** | Toast notifications |

### Backend

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime |
| **Express 4** | Web framework |
| **MongoDB Atlas** | Database (Mongoose ODM) |
| **Groq SDK** | AI inference (LLaMA 3.3-70B-Versatile) |
| **JWT** | Authentication tokens |
| **Bcrypt.js** | Password hashing |
| **Express Validator** | Request validation |
| **Morgan** | HTTP request logging |
| **Node Cron** | Scheduled tasks |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Port 5173)                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  React SPA (Vite)                                      │  │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────────┐   │  │
│  │  │  Pages   │  │  Layouts │  │  AuthContext      │   │  │
│  │  │  (13)    │  │  (2)     │  │  + API Service    │   │  │
│  │  └──────────┘  └──────────┘  └───────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
│                     │ Proxy /api                             │
└─────────────────────┼───────────────────────────────────────┘
                      │
┌─────────────────────┼───────────────────────────────────────┐
│              Backend (Port 5000)                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Express.js Server                                     │  │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────────┐   │  │
│  │  │  Routes  │  │    │     │  │  Services         │   │  │
│  │  │  (6)     │──│Controllers│──│  - Groq AI       │   │  │
│  │  │          │  │    (6)    │  │  - Analytics     │   │  │
│  │  │          │  │          │  │  - Calendar      │   │  │
│  │  └──────────┘  └────┬─────┘  └───────────────────┘   │  │
│  │                     │                                  │  │
│  │  ┌──────────────────▼──────────────────────────────┐  │  │
│  │  │  MongoDB Atlas (7 Collections)                  │  │  │
│  │  │  Users · Tasks · Subtasks · Goals · Notifications│  │  │
│  │  │  CalendarEvents · Analytics                     │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (or local MongoDB)
- [Groq API Key](https://console.groq.com/) (free tier available)

### Installation

```bash
# Clone the repository
git clone https://github.com/Riddhishah43/duepilot.git
cd duepilot

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Setup

Copy the environment template and fill in your credentials:

```bash
cp backend/.env.example backend/.env
```

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Backend server port (default: 5000) | No |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `JWT_EXPIRES_IN` | Token expiry (default: 7d) | No |
| `GROQ_API_KEY` | Groq AI API key | Yes |
| `CLIENT_URL` | Frontend origin for CORS | No |

### Run Locally

```bash
# Start backend (port 5000)
cd backend
npm run dev

# Start frontend (port 5173) — in a separate terminal
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> The Vite dev server proxies `/api` requests to `http://localhost:5000` automatically.

---

## Project Structure

```
duepilot-ai/
├── backend/
│   ├── config/                # Database configuration
│   ├── controllers/           # Route handlers
│   ├── middleware/            # Auth & error middleware
│   ├── models/                # Mongoose schemas (9 models)
│   ├── routes/                # API route definitions (8 route files)
│   ├── services/              # Business logic (Groq AI, Analytics, Calendar)
│   ├── utils/                 # Helper functions
│   ├── validators/            # Request validation rules
│   ├── app.js                 # Express application setup
│   └── server.js              # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/common/ # Reusable UI components
│   │   ├── context/           # React context providers
│   │   ├── layouts/           # Page layouts (MainLayout, AuthLayout)
│   │   ├── pages/             # Route page components (15+ pages)
│   │   ├── services/          # API client (Axios instance)
│   │   ├── App.jsx            # Route definitions
│   │   └── main.jsx           # Application entry point
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
├── railway.json               # Railway config-as-code
├── .railway/                  # Railway IaC configuration
└── .gitignore
```

---

## API Reference

All API endpoints are prefixed with `/api`. Protected routes require a `Bearer <token>` Authorization header.

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Create new account | No |
| `POST` | `/api/auth/login` | Sign in | No |
| `GET` | `/api/auth/profile` | Get current user | Yes |
| `PUT` | `/api/auth/profile` | Update profile | Yes |

### Tasks

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/tasks` | List tasks (filter by status, priority, category) | Yes |
| `GET` | `/api/tasks/risky` | Get at-risk tasks with AI risk scores | Yes |
| `GET` | `/api/tasks/:id` | Get task with subtasks | Yes |
| `POST` | `/api/tasks` | Create task (triggers AI analysis) | Yes |
| `PUT` | `/api/tasks/:id` | Update task fields | Yes |
| `DELETE` | `/api/tasks/:id` | Delete task and subtasks | Yes |
| `PATCH` | `/api/tasks/:id/archive` | Archive task | Yes |

### AI

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/ai/analyze-task` | Analyze and break down a task | Yes |
| `POST` | `/api/ai/schedule` | Generate daily schedule | Yes |
| `POST` | `/api/ai/rescue` | Generate holistic rescue plan (all pending tasks) | Yes |
| `GET` | `/api/ai/daily-report` | AI daily productivity report | Yes |
| `GET` | `/api/ai/weekly-report` | AI weekly productivity report | Yes |
| `POST` | `/api/ai/plan-goal` | Plan goal milestones | Yes |
| `POST` | `/api/ai/generate-reminder` | Generate smart reminder | Yes |

### Study Plans

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/study-plans/generate` | Generate AI study plan from tasks | Yes |
| `GET` | `/api/study-plans` | List saved study plans | Yes |

### Patterns

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/patterns` | Get detected behavioral patterns | Yes |

### Analytics

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/analytics/dashboard` | Dashboard metrics (score, dist, risk, trend, streak, focus) | Yes |
| `GET` | `/api/analytics` | Full analytics data | Yes |

### Notifications

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/notifications` | List notifications | Yes |
| `GET` | `/api/notifications/important` | Important notifications | Yes |
| `POST` | `/api/notifications/generate` | Generate smart AI notifications | Yes |
| `POST` | `/api/notifications/generate-deadline` | Generate deadline reminders | Yes |
| `PATCH` | `/api/notifications/:id/read` | Mark as read | Yes |
| `PATCH` | `/api/notifications/read-all` | Mark all as read | Yes |

---

## Database Models

### User
| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Required |
| `email` | String | Unique, lowercase |
| `password` | String | bcrypt hashed (12 rounds) |
| `timezone` | String | Default: "UTC" |
| `productivityScore` | Number | Default: 0 |
| `focusPreferences` | Object | Pomodoro config |
| `avatar` | String | Emoji avatar |
| `bio` | String | Short bio |
| `dailyGoal` | Number | Daily task completion target |
| `weeklyGoal` | Number | Weekly task completion target |
| `theme` | String | "light" or "dark" |
| `studyPreferences` | Object | Study planner settings |
| `defaultView` | String | Default dashboard view |
| `notificationPreferences` | Object | Per-type notification toggles |

### Task
| Field | Type | Notes |
|-------|------|-------|
| `title` | String | Required |
| `deadline` | Date | Required |
| `targetDeadline` | Date | Optional personal deadline |
| `estimatedDuration` | Number | Minutes, default: 60 |
| `priority` | Enum | low / medium / high |
| `status` | Enum | pending / in-progress / completed / missed |
| `progress` | Number | 0–100 |
| `riskScore` | Number | 0–100, AI-calculated |
| `riskReason` | String | AI explanation |
| `aiRecommendation` | String | AI suggestion |

### ActionLog
| Field | Type | Notes |
|-------|------|-------|
| `user` | ObjectId | Ref User |
| `task` | ObjectId | Ref Task |
| `actionType` | String | created, started, paused, completed, missed, etc. |
| `timestamp` | Date | When the action occurred |
| `metadata` | Object | Additional context (duration, notes) |

### StudyPlan
| Field | Type | Notes |
|-------|------|-------|
| `user` | ObjectId | Ref User |
| `tasks` | Array | Tasks included in the plan |
| `plan` | Object | AI-generated plan with time blocks |
| `date` | Date | The day this plan is for |

### Subtask, Goal, Notification, CalendarEvent, Analytics
(Full schemas available in `backend/models/`)

---

## Deployment

The production app is live at:
- **Frontend:** [rs-duepilot.vercel.app](https://rs-duepilot.vercel.app)
- **Backend API:** [duepilot-backend-production.up.railway.app](https://duepilot-backend-production.up.railway.app)

### Frontend (Vercel)

The frontend is auto-deployed from GitHub via the Vercel dashboard (project: `duepilot-ai`).

```bash
cd frontend
# Deploy with Vercel CLI
vercel --prod --env VITE_API_URL=https://duepilot-backend-production.up.railway.app
```

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://duepilot-backend-production.up.railway.app` |

### Backend (Railway)

The backend is deployed from GitHub (`Riddhishah43/duepilot`) with **rootDirectory** set to `backend`. Builds use **Railpack** (auto-detect).

Environment variables set in the Railway dashboard:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | `7d` |
| `GROQ_API_KEY` | Groq AI API key |
| `CLIENT_URL` | `https://rs-duepilot.vercel.app` |

### Database
- MongoDB Atlas cluster — the connection string goes into `MONGODB_URI`
- IP whitelist: `0.0.0.0/0` (allow from anywhere, required for Railway dynamic IPs)

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

Built with ❤️ by [Riddhi Shah](https://github.com/Riddhishah43)

</div>
