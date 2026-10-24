# ORBIT — Social Media Platform (MERN) · CodeAlpha Task 2

React (Vite) + Framer Motion + CSS 3D frontend, Express + MongoDB (Mongoose) + JWT backend.

## Features
User registration/login (JWT + bcrypt) · profiles (edit name, bio, emoji avatar, colour) · posts (text, image link, card colour) · comments · like system · follow/unfollow · followers/following lists · "For you" and "Following" feeds · Explore (people search + trending posts).

## Setup
1. **Backend**
   ```
   cd backend
   npm install
   copy .env.example .env      (Windows)   |   cp .env.example .env   (Mac/Linux)
   ```
   `.env` mein `MONGO_URI` daalo (DB name `codealpha_social`) aur `JWT_SECRET` badlo.
   ```
   npm run seed    # demo users + posts (login: zara@orbit.dev / password123)
   npm run dev     # http://localhost:5002
   ```
2. **Frontend** (naya terminal)
   ```
   cd frontend
   npm install
   npm run dev     # http://localhost:5174
   ```

## API
| Method | Route | Description |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | Auth |
| GET | /api/posts?scope=all\|following\|explore | Feed |
| POST / DELETE | /api/posts, /api/posts/:id | Create / delete post |
| POST | /api/posts/:id/like | Toggle like |
| GET / POST | /api/posts/:id/comments | Comments |
| DELETE | /api/posts/comments/:cid | Delete comment |
| GET | /api/users/:username | Profile + posts |
| PUT | /api/users/me | Edit profile |
| POST | /api/users/:id/follow | Toggle follow |
| GET | /api/users/suggestions, /api/users/search?q= | Discover people |

GitHub repo name: `CodeAlpha_SocialMedia`
