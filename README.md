# Bug_Busters

# NyayaSetu ⚖️

### AI-Powered Judiciary Assistance Platform

NyayaSetu is an AI-driven platform designed to simplify and streamline interactions with the Indian judicial system. Built for a hackathon, it bridges the gap between citizens, lawyers, and judges by making legal processes more accessible, transparent, and efficient.

---

## 🚀 Overview

Navigating legal systems can be complex and intimidating. NyayaSetu solves this by using AI to:

* Simplify legal language
* Automate case understanding
* Assist in decision-making
* Improve communication between stakeholders

---

## ✨ Key Features

### 👤 Citizen Dashboard

* Upload FIR documents
* View AI-generated case summaries
* Understand applicable IPC/BNS sections
* Get predicted case timelines and punishment ranges
* Hire lawyers via marketplace
* Chat with AI assistant (voice + text support)

### ⚖️ Lawyer Dashboard

* Manage incoming case requests
* Track active and pending cases
* Upload and manage evidence
* View hearing schedules

### 🧑‍⚖️ Judge Dashboard

* Monitor active and pending cases
* Schedule and update hearings
* AI-powered case analysis
* Calendar-based hearing management

### 🛠️ Admin Panel

* Manage users and roles
* Verify lawyers and judges
* Monitor system activity via audit logs

---

## 🤖 AI Capabilities

* FIR parsing into structured data
* Plain-language case summarization
* IPC/BNS section detection
* Punishment prediction
* Case timeline estimation
* Similar case recommendations
* Context-aware legal chatbot

---

## 🎤 Voice Integration

* Supports English (en-IN) and Hindi (hi-IN)
* Powered by Azure Speech Recognition
* Enables voice-based interaction with AI assistant

---

## 🧱 Tech Stack

**Frontend**

* Next.js 14 (App Router)
* Tailwind CSS + ShadCN UI
* Firebase Authentication
* Azure Speech SDK

**Backend**
* google auth
* Node.js + Express
* MongoDB (Mongoose)
* Firebase Admin SDK 
---

## 📁 Project Structure

```
NyayaSetu/
├── frontend/   # Next.js application
├── backend/    # Express API server
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd NyayaSetu
```

### 2. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Configure environment variables

Create the following files:

* `backend/.env`
* `frontend/.env.local`

Add required keys for:

* MongoDB Atlas
* Firebase
* AWS S3
* Azure Speech
* Claude API

---

## ▶️ Running the Application

Start backend:

```bash
cd backend
npm run dev
```

Start frontend:

```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:3000`
Backend runs on: `http://localhost:5000`

---

## 🔐 Important Notes

* All APIs are secured using Firebase Authentication
* Role-based access control is enforced
* Evidence becomes immutable after 15 minutes
* Audit logs track all critical actions
* AI responses are generated dynamically and may vary

---

## ⚠️ Disclaimer

NyayaSetu is a hackathon prototype and is **not a substitute for professional legal advice**. AI-generated outputs are for informational purposes only.

---

## 📌 Future Improvements

* Real court database integration
* Advanced legal analytics
* Multi-language support expansion
* Mobile application version
* Blockchain-based audit logs

---

## 👨‍💻 Team

Built as part of a hackathon project to demonstrate the potential of AI in transforming the judicial ecosystem.

---

## ⭐ If you like this project

Give it a star ⭐ and support the idea of accessible justice for everyone.
