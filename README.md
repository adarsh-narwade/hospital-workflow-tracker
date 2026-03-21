# 🏥 Hospital Workflow Tracker

A REST API for managing hospital operations built from scratch with Node.js, Express, and MongoDB.

## Features
- JWT Authentication with role-based access (admin, doctor, nurse)
- Patient admissions and discharges
- Bed and room management
- Clinical task and order tracking
- Protected routes with middleware

## Tech Stack
| Layer | Technology |
|---|---|
| Server | Node.js + Express |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcrypt |

## Run Locally
\`\`\`bash
cd backend
cp .env.example .env
npm install
npm run dev
\`\`\`

## API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get profile |
| GET | /api/patients | List patients |
| POST | /api/patients | Admit patient |
| PATCH | /api/patients/:id/discharge | Discharge patient |
| GET | /api/beds | List beds |
| GET | /api/beds/stats | Bed occupancy stats |
| POST | /api/beds | Create bed (admin only) |
| GET | /api/tasks | List tasks |
| POST | /api/tasks | Create task |
| PATCH | /api/tasks/:id | Update task status |
