# NIMBUS — Project Management Tool (MERN + Socket.io) · CodeAlpha Task 3

React (Vite) + Framer Motion + CSS 3D frontend, Express + MongoDB (Mongoose) + JWT + Socket.io backend.

## Features
Auth (JWT + bcrypt) · group projects · invite teammates by email · kanban board (To do / In progress / In review / Done) with drag & drop · task cards (assignee, priority, due date, labels) · comments inside tasks · **notifications** and **real-time updates via WebSockets** (live board sync, online presence, live comments) · dashboard with stats, progress rings and "My focus" list · search/filter on board.

## Setup
1. **Backend**
   ```
   cd backend
   npm install
   copy .env.example .env      (Windows)   |   cp .env.example .env   (Mac/Linux)
   ```
   `.env` mein `MONGO_URI` daalo (DB name `codealpha_projects`) aur `JWT_SECRET` badlo.
   ```
   npm run seed    # demo users + 2 projects
   npm run dev     # http://localhost:5003
   ```
2. **Frontend** (naya terminal)
   ```
   cd frontend
   npm install
   npm run dev     # http://localhost:5175
   ```

Demo logins (password `password123`): `amna@nimbus.dev`, `bilal@nimbus.dev`, `carla@nimbus.dev`.
Real-time test: do alag browsers (ya ek normal + ek incognito) mein alag users se login karo, same project kholo aur card drag karo.

## API (short)
- `POST /api/auth/register|login`, `GET /api/auth/me`
- `GET/POST /api/projects`, `GET/PUT/DELETE /api/projects/:id`, `POST /api/projects/:id/members`, `DELETE /api/projects/:id/members/:uid`
- `POST /api/projects/:id/tasks`, `GET/PUT/DELETE /api/tasks/:id`, `PUT /api/tasks/:id/move`
- `POST /api/tasks/:id/comments`, `DELETE /api/comments/:cid`
- `GET /api/notifications`, `POST /api/notifications/read-all`
- WebSocket events: `tasks:sync`, `comment:added`, `notification`, `presence`, `project:updated`

GitHub repo name: `CodeAlpha_ProjectManager`
