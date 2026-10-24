# AURUM — Luxury E-commerce Store (MERN) · CodeAlpha Task 1

React (Vite) + Three.js + Framer Motion frontend, Express + MongoDB (Mongoose) + JWT backend.

## Setup
1. **Backend**
   ```
   cd backend
   npm install
   copy .env.example .env      (Windows)   |   cp .env.example .env   (Mac/Linux)
   ```
   `.env` mein apni MongoDB Atlas URI daalo (`MONGO_URI`) aur `JWT_SECRET` badlo. DB name `codealpha_ecommerce` rakho.
   ```
   npm run seed    # 14 products insert karta hai
   npm run dev     # http://localhost:5001
   ```
2. **Frontend** (naya terminal)
   ```
   cd frontend
   npm install
   npm run dev     # http://localhost:5173
   ```
Atlas mein Network Access me apna IP (ya 0.0.0.0/0) allow karna na bhoolna.

## Features
Product listing + search/filter/sort, product details (hover zoom), cart drawer (persistent), register/login (JWT + bcrypt), checkout and order processing (server-side totals, stock deduction), order history, 3D hero.

GitHub repo name: `CodeAlpha_EcommerceStore`
