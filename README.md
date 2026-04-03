# Hospital Workflow Tracker

Hospital Workflow Tracker is a full-stack hospital operations project built around role-based staff access, patient admissions, bed management, clinical tasks, and staff shift scheduling.

## Live Links
- Web dashboard: `https://adarsh-narwade.github.io/hospital-workflow-tracker`
- API base URL: `https://hospital-workflow-tracker.onrender.com`
- Health check: `https://hospital-workflow-tracker.onrender.com/health`

## What The Project Covers
- JWT-based authentication for `admin`, `doctor`, and `nurse`
- Patient admission, update, transfer, and discharge flows
- Bed inventory and occupancy tracking
- Task creation, assignment, progress updates, and completion
- Staff directory and shift scheduling
- Role-based route protection in the backend
- Local static docs UI for desktop testing
- Mobile app client built with Expo React Native

## Tech Stack

| Layer | Stack |
| --- | --- |
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcrypt |
| Web UI | Static HTML, CSS, JavaScript |
| Mobile UI | Expo, React Native |

## Repository Structure

```text
hospital-workflow-tracker/
├── backend/          # Express API and MongoDB models
├── docs/             # Static web dashboard used for local/demo access
├── mobile/           # Expo mobile application
└── README.md
```

## Core Roles And Permissions

### Admin
- Can create staff accounts after initial bootstrap
- Can create, update, and discharge patients
- Can create and update beds
- Can create, update, and delete tasks
- Can create and delete shifts

### Doctor
- Can create, update, and discharge patients
- Can create, update, and delete tasks
- Can create and delete shifts

### Nurse
- Can view staff and shifts
- Can create and update tasks
- Cannot create staff
- Cannot create or delete shifts
- Cannot create, update, or discharge patients
- Cannot update beds

## Backend Improvements Included

The current codebase includes these important fixes:
- Patient-to-bed assignment is validated before saving
- Bed transfers keep patient and bed records in sync
- Reopened tasks clear `completedAt`
- Deleted users with stale JWTs now get a clean `401`
- Staff and shifts endpoints were added to support the web UI
- Public staff creation is blocked after the first bootstrap user
- The docs UI now hides restricted actions based on role
- Task assignment in the docs UI can clear staff and patient links correctly

## Local Setup

### 1. Backend Setup

From the backend folder:

```bash
cd hospital-workflow-tracker/backend
npm install
```

Create a `.env` file based on `.env.example`.

Example:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-host>/hospital_db?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=replace_with_a_real_secret
JWT_EXPIRES_IN=7d
```

Start the API:

```bash
npm run dev
```

Verify it is running:

```bash
curl http://localhost:5000/health
curl http://localhost:5000/
```

### 2. Docs Web UI Setup

The docs dashboard is a static frontend served from [docs/index.html](docs/index.html).

To use it locally:

1. Keep the backend running on port `5000`
2. Open [docs/index.html](docs/index.html) in your browser
3. Hard refresh with `Cmd + Shift + R` after code changes

The docs app automatically uses:
- `http://localhost:5000/api` when opened locally
- the deployed Render API when hosted online

### 3. Mobile App Setup

From the mobile folder:

```bash
cd mobile
npm install
npx expo install react-dom react-native-web
npx expo start --web --clear
```

If you want the mobile app to use local backend data, set the base URL in [mobile/src/services/api.js](mobile/src/services/api.js)
 to your local server.

## First-Time Access

If your database is empty:
- the first registered account is allowed for system bootstrap
- after that, only an authenticated `admin` can create additional staff accounts

Demo credentials shown in the UI only work if that account exists in your current database.

## Main API Routes

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Patients
- `GET /api/patients`
- `GET /api/patients/:id`
- `POST /api/patients`
- `PATCH /api/patients/:id`
- `PATCH /api/patients/:id/discharge`

### Beds
- `GET /api/beds`
- `GET /api/beds/stats`
- `GET /api/beds/:id`
- `POST /api/beds`
- `PATCH /api/beds/:id`

### Tasks
- `GET /api/tasks`
- `GET /api/tasks/:id`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

### Staff And Shifts
- `GET /api/staff`
- `GET /api/staff/shifts`
- `POST /api/staff/shifts`
- `DELETE /api/staff/shifts/:id`

## Manual Local Test Checklist

After starting the backend and opening the docs UI, verify these flows:

1. Sign in with a valid account
2. Try a wrong password and confirm the error appears
3. Confirm show/hide password works on login and registration fields
4. Check the dashboard critical count against critical patients
5. Create or update a patient as `admin` or `doctor`
6. Confirm nurses do not see restricted patient, bed, or shift actions
7. Create a task and assign it to a staff member
8. Clear a task assignment and confirm it saves
9. Create a shift as `admin` or `doctor`
10. Confirm a nurse cannot create or delete shifts

## Notes
- If MongoDB connection fails, verify the Atlas connection string, database user password, and network access rules
- If port `5000` is already in use, stop the old process before restarting the backend
- If the docs page behaves unexpectedly after changes, use a hard refresh to clear cached scripts
