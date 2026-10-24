# NEXUS // MEET — Real-Time Communication App (MERN) · CodeAlpha Task 4

React (Vite) + WebRTC + Socket.io frontend, Express + Socket.io + MongoDB (Mongoose) + JWT backend.

## Setup
1. **Backend**
   ```
   cd backend
   npm install
   copy .env.example .env      (Windows)   |   cp .env.example .env   (Mac/Linux)
   ```
   `.env` mein apni MongoDB Atlas URI (`MONGO_URI`, DB name `codealpha_videomeet`) daalo aur `JWT_SECRET` badlo.
   ```
   npm run dev     # http://localhost:5004  (API + signaling)
   ```
2. **Frontend** (naya terminal)
   ```
   cd frontend
   npm install
   npm run dev     # http://localhost:5175
   ```
Atlas mein Network Access me apna IP allow karna na bhoolna.

## Test kaise karein
- Register -> "Start meeting" -> "Invite link" copy karo.
- Dusre browser/incognito window (ya dusre device) mein dusra account banao, invite link kholo.
- Camera/mic permission allow karo. Same laptop pe test karte waqt headphones lagao (echo se bachne ke liye).
- Apne device par `localhost` secure context hai, isliye camera chalta hai. Dusre phone/laptop se test karne ke liye HTTPS chahiye (e.g. `ngrok`/Cloudflare tunnel).

## Features (PDF ke mutabiq)
- Multi-user video calling (WebRTC mesh, up to 8)
- Screen sharing (spotlight layout)
- File sharing (10 MB tak)
- Whiteboard (colors, brush size, eraser, clear, PNG download, late joiners ko history)
- Data encryption: WebRTC media DTLS-SRTP se encrypted hai; chat, files aur whiteboard AES-256-GCM se browser mein encrypt hote hain. Key sirf invite link ke `#fragment` mein hoti hai, server tak nahi jaati.
- User authentication: JWT + bcrypt, protected API aur authenticated Socket.io connection.

## Note
Free STUN servers use hue hain. Kuch strict networks (corporate / mobile data) par TURN server lagta hai. Local aur normal WiFi par ye theek chalega.

GitHub repo name: `CodeAlpha_VideoMeet`
