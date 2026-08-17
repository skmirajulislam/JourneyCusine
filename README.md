# 🌍 JourneyCusine (JC Travels) — Next-Gen Culinary Travel & Stay Platform 🏨✨

<div align="center">

[![React 19](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Google Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![CodeQL Security](https://img.shields.io/badge/Security-CodeQL%20100%25%20Passed-brightgreen?style=for-the-badge&logo=github)](https://github.com/skmirajulislam/JourneyCusine)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<h3>🚀 Explore Stays, Taste Cultures, Connect Travelers.</h3>

</div>

---

## 🎉 The Grand Comeback: We Are Finally Back!

> **Dear JourneyCusine Community & Travelers Worldwide,**  
> After a **2-year long wait**, we are ecstatic to announce that **JourneyCusine is officially BACK and completely reborn!** 🌟  
> 
> What started as an Airbnb-inspired travel concept has evolved into a full-scale, enterprise-grade culinary accommodation ecosystem. We listened to all your feedback, rebuilt our core infrastructure from scratch, eliminated legacy bottlenecks, integrated cutting-edge AI capabilities, and hardened our application to enterprise security standards. 
> 
> *Thank you for your incredible patience and loyalty. The journey resumes now!* 🚀✈️🍽️

---

## 🌟 Brand-New Features & Capabilities

### 🤖 1. AI-Powered Travel Concierge & Smart Copilot
- **Interactive Travel Assistant**: Powered by Google Gemini AI with fallback contextual engines. Ask for trip itineraries, stay comparisons, culinary guides, or cost breakdowns.
- **AI Listing Description Generator**: Hosts can generate high-converting listing copywriting, titles, and neighborhood highlights in seconds.
- **Smart Dynamic Pricing**: Machine learning pricing engine providing intelligent rates based on seasonality, location demand, and room capacity.
- **Multimodal Image Safety Moderation**: Automated visual AI safety scanner checking uploaded images against community guidelines before publishing.

### 🍲 2. Culinary Experiences & Local Food Secrets
- **Signature Dining Add-ons**: Guests can add authentic host-prepared meals (Breakfast, Chef's Dinner, Wine Tastings, Vegan Feasts) directly to their motel booking with dietary preferences.
- **Curated Local Food Secrets**: Hosts showcase hidden street food gems, traditional markets, and authentic cafes with interactive maps and dish recommendations.

### 👥 3. Group Trip Collaboration & Split-Pay
- **Live Trip Boards**: Plan group vacations with custom destination timelines and activity boards.
- **Shareable Invite Codes**: Invite travel companions via unique 6-character room codes.
- **Automated Split-Payment Calculator**: Splits room and dining expenses transparently among travelers with individual settlement trackers.

### 🎁 4. Traveler Loyalty Tiers & Daily Rewards
- **Tier Progression Engine**: Earn XP on every booking to climb from *Explorer* (🥉) $\rightarrow$ *Voyager* (🥈) $\rightarrow$ *Nomad* (🥇) $\rightarrow$ *Legend* (💎).
- **Daily Login Streak Rewards**: Claim bonus Travel Coins daily to unlock discount vouchers ($10, $25, $50 off).
- **Exclusive Host Vouchers**: Hosts can issue custom discount promo codes with usage limits and expiration triggers.

### 💬 5. Real-Time Chat & Direct Host Inquiries (Socket.io)
- **Instant Messaging**: Connect with property hosts directly from listing preview cards with typing indicators and unread badges.
- **Push Notification Drawer**: Live in-app notifications for bookings, payment verifications, and travel alerts.

### 💳 6. Razorpay Payments & Instant Refund Engine
- **Seamless Checkout**: Native Razorpay payment integration with HMAC-SHA256 signature verification.
- **Dynamic Multi-Country Currency Mapping**: Automatic localization and currency conversions (USD, INR, EUR, GBP, AED, JPY, AUD, CAD, KRW, and more).
- **Guest Cancellation & Refund Processing**: Transparent cancellation workflows and host refund dispatching.

### 🛡️ 7. Enterprise Security Hardening (Zero Vulnerabilities)
- **CodeQL Security Cleared (260+ closed alerts)**: Protected against NoSQL injections, ReDoS attacks, DOM text XSS, and rate limiting brute-forces.
- **Global & Route API Rate Limiting**: Centralized `express-rate-limit` guards protecting against DDoS and bot automation.
- **Single-Session Enforcement**: Cryptographically secure token rotation with instant logout synchronization.
- **Community Safety Checkbox**: Mandatory Terms & Conditions and Community Guidelines validation on registration with quick links to `/terms` and `/privacy`.

---

## 🏗️ Architecture & Technology Stack

```
JourneyCusine Ecosystem
 ├── 🎨 Frontend (SPA)
 │    ├── React 19 + Vite (Zero Fast-Refresh Conflicts & Canonical Deduplication)
 │    ├── TailwindCSS + DaisyUI + Framer Motion (Smooth Micro-interactions)
 │    ├── TanStack React Query (State Caching & Background Sync)
 │    ├── Socket.io Client (Real-time Messaging & Notifications)
 │    └── Leaflet Maps (Interactive Spatial Exploration)
 │
 ├── ⚙️ Backend (REST + WebSockets API)
 │    ├── Node.js + Express.js (Modular Route Controllers & Error Handlers)
 │    ├── Express Rate Limit (Multi-Tier Security & DoS Protection)
 │    ├── Socket.io (Bi-directional Event Streaming)
 │    ├── JWT (JSON Web Tokens) + Bcrypt Password Encryption
 │    ├── UploadThing (High-Performance Cloud Media Pipeline)
 │    └── Google Gemini AI API (Smart Trip NLP & Image Moderation)
 │
 └── 🗄️ Database & Storage
      ├── MongoDB Atlas (High-Availability Cloud Cluster)
      └── Mongoose (Schema Validation & Typed ObjectIds)
```

---

## ⚡ Quick Start & Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/skmirajulislam/JourneyCusine.git
cd JourneyCusine
```

### 2. Configure Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/
DB_NAME=motel-develpoment-db
DB_USER=your_mongo_user
DB_PASSWORD=your_mongo_password
ACCESS_TOKEN_SECRET=your_super_secret_jwt_access_key
REFRESH_TOKEN_SECRET=your_super_secret_jwt_refresh_key
GEMINI_API_KEY=your_gemini_ai_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
UPLOADTHING_TOKEN=your_uploadthing_token
```

**Frontend (`frontend/.env`):**
```env
VITE_BACKEND_URL=http://localhost:5001
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 3. Run Backend
```bash
cd backend
npm install
npm run dev
```

### 4. Run Frontend
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## 🧪 Verification & Quality Assurance

| Quality Check | Tool / Standard | Result |
| :--- | :--- | :--- |
| **Linting & Code Style** | ESLint 9 (Strict Config) | `0 errors, 0 warnings` |
| **Security Auditing** | GitHub CodeQL | `All alerts resolved (260+ Closed)` |
| **Dependencies Safety** | `npm audit` | `0 vulnerabilities (Backend & Frontend)` |
| **Production Build** | Vite 8 + Rollup | `Passed in < 2.0s` |

---

## 👥 Contributors & Core Team

A heartfelt thank you to everyone who contributed to resurrecting JourneyCusine:

- **[Sk Mirajul Islam](https://github.com/skmirajulislam)** — Project Lead, Architecture, Security & Full-Stack Engineer
- **Susshrita Jana** — Frontend Development & Feature Workflows
- **Soumye** — Workflow Logic & UI Integration
- **Aishiki Mondal** — UI/UX Design & Aesthetic Styling
- **Arnab Das** — Quality Assurance & Testing Lead
- **Sk Sahil** — Support Engineering & User Experience

---

## 📄 License

This project is licensed under the [MIT License](https://github.com/skmirajulislam/JourneyCusine/blob/master/MIT-LICENSE) and [Mozilla Public License 2.0](https://github.com/skmirajulislam/JourneyCusine/blob/master/MOZILA-FIREFOX-LICENSE).

---

<div align="center">
  <sub>Built with ❤️ for travelers and food lovers everywhere. © 2026 JourneyCusine.</sub>
</div>
