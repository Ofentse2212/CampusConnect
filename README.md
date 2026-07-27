# CampusConnect

CampusConnect is a full-stack campus events platform designed to help students discover what is happening around them and participate more easily in university life.

The project grew from a simple idea: opportunities for connection, learning and belonging should not be lost because information is scattered across different channels. CampusConnect brings events, registrations and notifications into one accessible place while giving staff practical tools to manage activity.

## What the platform supports

- Student, guest and staff account flows
- Campus event discovery and event details
- RSVPs and ticket records
- Recent-event notifications
- Staff and administrator event management
- Event statistics, including registrations, tickets and revenue
- Role-based access control and server-managed sessions

## Technology

- **Frontend:** React, TypeScript, Vite and Tailwind CSS
- **Backend:** Node.js and Express
- **Data:** Supabase
- **Authentication:** Password hashing, HTTP-only session cookies and role-based access control

## Project structure

```text
CampusConnect/
├── src/                 # React application
├── public/              # Images and static assets
└── Backend/
    └── src/server.js    # Express API, authentication and event endpoints
```

## Local setup

### Frontend

```bash
npm install
cp .env.example .env
npm run dev
```

### Backend

```bash
cd Backend
npm install
cp .env.example .env
npm run dev
```

Add your own Supabase configuration to `Backend/.env`. Never commit real credentials.

## Environment variables

Frontend:

```env
VITE_API_URL=http://localhost:4000
```

Backend:

```env
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_server_only_key
COOKIE_SECURE=false
SESSION_TTL_SECONDS=604800
```

A Supabase service-role key has elevated access and must only be used on the server. Rotate any credential that has previously been committed.

## Current status

CampusConnect is an active prototype. The core event, authentication and administration journeys are implemented. The next priorities are automated testing, database migration documentation, stronger input validation and deployment hardening.

## Why I built it

Campus life is shaped by more than classes. Students also need access to communities, opportunities and experiences that help them feel connected. CampusConnect explores how thoughtful technology can make those opportunities easier to find and manage.

## Author

Built by Ofentse Seko as part of a growing portfolio focused on socially useful, human-centred technology.
