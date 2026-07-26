CommApp\_ | Real-Time Collaborative Workspace
A real-time video conferencing, collaborative whiteboard, and instant messaging web application built for seamless remote communication using MERN Stack, WebRTC, and Socket.io.

🚀 Key Features
📹 Multi-User Video Calling: P2P WebRTC mesh conferencing with sub-second latency and Google Meet-style participant cards (with avatar fallback when cameras are off).

📝 Live Whiteboard: Real-time synchronized HTML5 Canvas drawing with mobile touch support and custom brush/color controls.

💬 Instant Room Chat: Live bidirectional messaging data channel built on Socket.io.

🔒 Secure & Verified Rooms: JWT-based user authentication and database-verified room IDs to prevent unauthorized access.

📱 100% Responsive UI: Minimalist developer-focused theme built with Tailwind CSS.

📁 Project Folder Structure

CodeAlpha_RealTimeComm/
│
├── backend/                    # Node.js + Express + WebRTC Signaling Server
│   ├── config/db.js            # MongoDB Atlas Connection
│   ├── controllers/            # Auth & Room Route Logic
│   ├── models/                 # Mongoose Schemas (User, Room)
│   ├── routes/                 # REST API Endpoints
│   ├── sockets/                # WebRTC & Socket.io Event Handlers
│   ├── .env                    # PORT, MONGO_URI, JWT_SECRET
│   ├── package.json
│   └── server.js               # Backend Entry Point
│
└── frontend/                   # React + Vite + Tailwind CSS Client
    ├── src/
    │   ├── api/axios.js        # Axios Client with JWT Interceptors
    │   ├── components/         # ChatBox, Navbar, Whiteboard
    │   ├── context/            # AuthContext, SocketContext
    │   ├── pages/              # Home, Login, Register, Room
    │   ├── App.jsx             # SPA Routing
    │   ├── main.jsx
    │   └── index.css           # Tailwind Directives
    ├── .env                    # VITE_BACKEND_URL
    ├── package.json
    ├── tailwind.config.js
    ├── vercel.json             # SPA Routing Rewrite Rules
    └── vite.config.js


🛠️ Tech Stack & Dependencies
Frontend: React 18, Vite, Tailwind CSS, Lucide React Icons, React Router DOM, Socket.io Client, Axios.

Backend: Node.js, Express.js, Socket.io (Signaling Server), Mongoose (MongoDB Atlas), JWT, Bcrypt.js, CORS, Dotenv.

Protocols: WebRTC (P2P Media Stream / DTLS & SRTP Encryption), WebSockets.

⚙️ Local Setup & Installation
1. Clone Repo & Start Backend
git clone https://github.com/manikkori/codealpha__RealTimeCommunicationApp.git
cd CodeAlpha_RealTimeComm/backend
npm install

Create /backend/.env file:  
    PORT=5000
    MONGO_URI=your_mongodb_atlas_connection_string
    JWT_SECRET=your_secret_key

Run backend server:
    npm run dev
# Server starts on http://localhost:5000

2. Start Frontend Client
Open a new terminal and navigate to /frontend:

    cd ../frontend
    npm install

Create /frontend/.env file:
VITE_BACKEND_URL=http://localhost:5000

Run frontend app:

npm run dev
# App opens on http://localhost:5173

☁️ Live Deployment Guide
Backend (Render): Deploy /backend folder as a Web Service. Add MONGO_URI and JWT_SECRET in Environment Variables.

Frontend (Vercel): Import repo, set root directory to /frontend, and framework to Vite. Add Environment Variable: VITE_BACKEND_URL = [https://your-render-backend.onrender.com](https://your-render-backend.onrender.com). The included vercel.json automatically handles React SPA routing.

👨‍💻 Author
Built by Manik as part of the CodeAlpha Full-Stack Internship Program.