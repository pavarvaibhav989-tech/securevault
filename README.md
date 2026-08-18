# 🔐 SecureVault – Complete Information Security Suite

**CY5008 – Information Security | Semester Project**  
**Author:** Vaibhav Pawar  
**Stack:** MERN (MongoDB · Express.js · React.js · Node.js)

---

## 📋 Project Overview

SecureVault demonstrates the **entire Information Security syllabus** through a unified, interactive web application:

| Module | Technology | Features |
|--------|-----------|---------|
| 🔐 Encryption Lab | AES / DES / 3DES / Blowfish / RC4 | File encryption, metrics, ECB/CBC modes |
| #️⃣ Hash Generator | SHA-256/512, MD5, HMAC, Tiger | Text/file hashing, verification, avalanche effect |
| 🗝️ RSA Signatures | RSA-2048, SHA256withRSA | Key generation, document signing & verification |
| 🤝 Diffie-Hellman | Prime-based DH | Key exchange simulation |
| 💬 Secure Chat | AES-256-CBC, Socket.io | Real-time encrypted messaging |
| 🔥 Firewall Sim | Priority-based rule engine | Packet filtering simulation |
| 🚨 IDS Monitor | Regex pattern matching | SQL Injection, XSS, brute-force detection |
| 📚 Learning Center | Animated step diagrams | AES, DES, RSA, Feistel, ECB/CBC |
| 🧬 Birthday Attack | Probability math | Collision probability graph + live simulator |
| 👤 Auth System | CAPTCHA, OTP, lockout | Registration, login, 2FA, forgot password |
| 📊 Dashboard | Chart.js | Real-time security metrics |

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & Install

```bash
git clone <repo-url>
cd securevault
```

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` in the `server/` directory and fill in:

```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/securevault
JWT_SECRET=your_very_long_secret
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
PORT=5000
```

### 3. Run

**Backend** (port 5000):
```bash
cd server
npm run dev
```

**Frontend** (port 5173):
```bash
cd client
npm run dev
```

Then open **http://localhost:5173** 🎉

---

## 🏗️ Architecture

```
securevault/
├── server/                 # Express.js API + Socket.io
│   ├── config/             # DB + env config
│   ├── controllers/        # Auth, Encryption, Hash, RSA, Firewall, IDS, Chat, Dashboard
│   ├── middleware/         # JWT auth, rate limiting, passive IDS
│   ├── models/             # Mongoose schemas (7 models)
│   ├── routes/             # API routes
│   ├── utils/              # Crypto, hash, firewall, IDS, CAPTCHA, email utils
│   └── socketHandler.js    # Real-time events
│
└── client/                 # Vite + React
    ├── src/
    │   ├── context/        # AuthContext
    │   ├── hooks/          # useSocket
    │   ├── services/       # Axios API services (per module)
    │   ├── components/     # Navbar, Sidebar, ProtectedRoute
    │   └── pages/          # 11 module pages + auth pages
    └── tailwind.config.js  # Navy/cyan/neon theme
```

---

## 🔒 Security Features

- **JWT Authentication** with RS256, 7-day expiry
- **Math CAPTCHA** on login to prevent bot attacks
- **Account Lockout** after 5 failed attempts (30-minute lock)
- **Email OTP** for registration verification
- **Rate Limiting** (15 req/15min on auth routes)
- **Passive IDS** middleware inspecting all API requests
- **Password Policy**: 8+ chars, uppercase, lowercase, number, special char
- **Bcrypt hashing** with salt rounds = 12

---

## 📚 Syllabus Coverage (CY5008)

| Unit | Topics Covered |
|------|---------------|
| Unit 1 | Symmetric cryptography (AES, DES, 3DES), Feistel cipher, ECB/CBC modes |
| Unit 2 | Asymmetric cryptography (RSA), Diffie-Hellman, PKI concepts |
| Unit 3 | Hash functions (SHA-256/512, MD5, HMAC), Birthday problem, digital signatures |
| Unit 4 | Authentication, CAPTCHA, OTP, password security, account lockout |
| Unit 5 | Firewall design, packet filtering, rule priority systems |
| Unit 6 | Intrusion Detection Systems, SQL injection, XSS, brute-force patterns |

---

## 🎨 Tech Stack

| Category | Technology |
|----------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS v3 |
| Routing | React Router v6 |
| Animations | Framer Motion |
| Charts | Chart.js + react-chartjs-2 |
| Icons | Lucide React |
| Real-time | Socket.io-client |
| Backend | Express.js + Node.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Crypto | Node.js `crypto` + CryptoJS |
| Email | Nodemailer |

---

*Built for CY5008 – Information Security · 2024*
