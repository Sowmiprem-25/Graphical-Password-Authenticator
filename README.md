# Memory-Assisted Graphical Password Authentication System

A full-stack zero-trust, memory-assisted graphical authentication system designed to replace traditional text passwords. Instead of typing characters, users select multiple personal memory cues (like `mom22` or `pet07`) and map each to a predefined graphical icon. During login, they are presented with a randomized, shuffled 4x4 grid containing their correct images plus decoys, and they must select their mapped sequence in the correct relative order.

## Project Architecture & Tech Stack

This project is built using a modern decoupled architecture:

*   **Frontend (client):** React, Tailwind CSS, React Router, Framer Motion for animations, Lucide React for UI icons.
*   **Backend (server):** Node.js, Express.js.
*   **Database:** PostgreSQL (using `pg` driver).
*   **Security:** `bcryptjs` for hashing the graphical sequence, `jsonwebtoken` for secure stateless sessions, `helmet` and `express-rate-limit` for DDoS and brute-force protection.

## Core Features Flow

### 1. Registration Flow
1. User enters their basic profile details (Name, Email).
2. User provides 3 to 5 alphanumeric memory cues (e.g. `14`, `A14`, `mom22`).
3. The system generates a randomized selection of 6 image options from the internal 150-icon library for *each* cue.
4. The user selects exactly one unique image per cue.
5. The chosen sequence of image IDs is combined, hashed via `bcrypt`, and securely stored. **The raw sequence is never stored.**

### 2. Login Flow
1. User enters their email address.
2. The backend retrieves the length of their graphical sequence.
3. The frontend displays a securely generated 4x4 grid (16 images) containing the correct ordered images (3-5) and random decoy images (11-13).
4. The grid positions are entirely shuffled on every single login attempt.
5. The user clicks their image sequence in the correct mapped order.
6. The backend verifies the sequence hash.

### 3. Security Protections
*   **Anti-Brute Force:** Max 5 attempts per minute per IP/Email pair.
*   **Account Lockout:** 10 consecutive failed attempts locks the account for 15 minutes.
*   **Decoys:** Shoulder-surfing is mitigated by decoy injection and position scrambling. 
*   **Audit Logging:** Every login attempt (success or failure) is logged.
*   **Security Alerts:** Rapid failures or suspicious behaviors proactively trigger backend alerts visible in the Admin Dashboard.

## Project Structure

```text
/GRAPHICAL
├── client/              # React Frontend Portal
│   ├── public/          # Static assets
│   ├── src/             
│   │   ├── components/  # Reusable UI components (Navbar, Layout)
│   │   ├── context/     # React Context for global state (AuthContext)
│   │   ├── data/        # Internal predefined image/icon library
│   │   ├── pages/       # Route-level components (Register, Login, Admin)
│   │   └── services/    # API integration layers (Axios)
│   └── package.json     # Frontend dependencies
├── server/              # Node/Express Backend API
│   ├── config/          # PostgreSQL database configuration
│   ├── controllers/     # Route logic handlers (auth, admin)
│   ├── data/            # Internal image ID verification library
│   ├── middleware/      # JWT guards, rate limiters, validation
│   ├── routes/          # API route definitions
│   └── scripts/         # DB Migration scripts
├── database/            # SQL schemas and structural definition
└── README.md            # This documentation file
```

## How to Run Locally

### 1. Prerequisites
*   Node.js (v18 or higher)
*   PostgreSQL running locally (port 5432)

### 2. Database Setup
Ensure PostgreSQL is running, then create the database:
```sql
CREATE DATABASE graphical_auth;
```

### 3. Backend Setup
Navigate to the server directory:
```bash
cd server
npm install
```

Configure environment logic by copying `.env.example` to `.env` and updating the `DATABASE_URL` with your postgres credentials.

Run the automatic schema migration to set up the tables:
```bash
npm run migrate
```

Start the backend API server (runs on `http://localhost:5000`):
```bash
npm run dev
```

### 4. Frontend Setup
Open a new terminal and navigate to the client directory:
```bash
cd client
npm install
```

Start the React development server:
```bash
npm start
```
The application will launch at `http://localhost:3000`.

## Demo & Usage

1. Open `http://localhost:3000` and click "Get Started".
2. Create an account with 3 memory anchors (e.g., `dog`, `cat`, `bird`).
3. Select an image for each anchor.
4. Log out, then try to log back in.
5. Click your mapped images from the shuffled grid in the original order.
6. Once logged in, navigate the top menu to access the **Admin** dashboard to review logs, locked accounts, and security alerts.
