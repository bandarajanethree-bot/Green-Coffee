# 🌿 Green Coffee Café — Full Stack Web Application

A complete full-stack web application for **Green Coffee Café** featuring a beautifully designed frontend with Bootstrap 5 and a secure Node.js + Express + MongoDB backend.

---

## 📁 Project Structure

```
green-coffee-cafe/
├── frontend/               ← HTML, Bootstrap 5, CSS, JavaScript
│   ├── index.html          ← All pages (SPA: Home, About, Menu, Services, Contact, Login, Register, Dashboard)
│   ├── css/
│   │   └── style.css       ← Custom styles, animations, design system
│   └── js/
│       └── app.js          ← API integration, routing, auth logic
│
├── backend/                ← Node.js + Express API
│   ├── server.js           ← Express app entry point
│   ├── package.json
│   ├── .env.example        ← Environment variables template
│   ├── routes/
│   │   ├── auth.js         ← Register, login, profile endpoints
│   │   └── contact.js      ← Contact form endpoint
│   ├── middleware/
│   │   └── auth.js         ← JWT authentication middleware
│   └── models/
│       ├── User.js         ← User schema (bcrypt, validation)
│       └── Contact.js      ← Contact message schema
│
└── database/
    └── db.js               ← MongoDB connection (Mongoose)
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ — [nodejs.org](https://nodejs.org)
- **MongoDB** — [mongodb.com/try/download](https://www.mongodb.com/try/download/community) (local) OR [MongoDB Atlas](https://cloud.mongodb.com) (free cloud)
- A code editor (VS Code recommended)
- Live Server extension for VS Code (or any static file server)

---

### Step 1 — Clone / Download the Project

```bash
# If using git
git clone <your-repo-url>
cd green-coffee-cafe
```

---

### Step 2 — Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
```

Edit `.env` with your settings:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/green_coffee_cafe
JWT_SECRET=change_this_to_a_long_random_secret_string
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://127.0.0.1:5500
```

> **MongoDB Atlas (cloud):** Replace `MONGODB_URI` with your Atlas connection string:
> `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/green_coffee_cafe`

---

### Step 3 — Start the Backend

```bash
# Development mode (auto-restart)
npm run dev

# OR production mode
npm start
```

✅ You should see:
```
🌿 Green Coffee Café Server running on port 5000
🔗 API URL: http://localhost:5000/api
```

Test the API: Open `http://localhost:5000/api/health` in your browser.

---

### Step 4 — Start the Frontend

**Option A — VS Code Live Server (Recommended)**
1. Open the `green-coffee-cafe` folder in VS Code
2. Right-click `frontend/index.html` → **Open with Live Server**
3. The site opens at `http://127.0.0.1:5500/frontend/`

**Option B — Python simple server**
```bash
cd frontend
python3 -m http.server 5500
# Open http://localhost:5500
```

**Option C — npx serve**
```bash
cd frontend
npx serve -p 5500
```

---

## 🔗 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Server health check |
| GET | `/api/menu` | No | Get full menu items |
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login user |
| GET | `/api/auth/me` | JWT | Get current user |
| PUT | `/api/auth/profile` | JWT | Update profile |
| POST | `/api/contact` | No | Submit contact form |

---

## 🔐 Authentication Flow

1. User registers → password hashed with **bcrypt** (12 salt rounds)
2. Server returns **JWT token** (7-day expiry)
3. Token stored in `localStorage`
4. Protected requests include `Authorization: Bearer <token>` header
5. Server middleware validates token on every protected route
6. Dashboard redirects to Login if no valid token found

---

## 🎨 Frontend Pages

| Page | Route | Protected |
|------|-------|-----------|
| Home | `home` | No |
| About | `about` | No |
| Menu | `menu` | No |
| Services | `services` | No |
| Contact | `contact` | No |
| Login | `login` | No |
| Register | `register` | No |
| Dashboard | `dashboard` | ✅ Yes |

---

## 🛠️ Tech Stack

### Frontend
- **Bootstrap 5.3** — Responsive UI framework
- **Bootstrap Icons** — Icon library
- **Vanilla JavaScript** — API calls, routing, state management
- **Google Fonts** — Playfair Display, DM Sans, Cormorant Garamond
- **CSS Variables** — Design system tokens

### Backend
- **Node.js** — Runtime
- **Express.js 4** — Web framework
- **MongoDB + Mongoose** — Database & ODM
- **bcryptjs** — Password hashing
- **jsonwebtoken** — JWT authentication
- **express-validator** — Input validation
- **helmet** — HTTP security headers
- **express-rate-limit** — API rate limiting
- **cors** — Cross-origin resource sharing

---

## 📦 Dependencies

```json
{
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "express": "^4.18.2",
  "express-rate-limit": "^7.1.5",
  "express-validator": "^7.0.1",
  "helmet": "^7.1.0",
  "jsonwebtoken": "^9.0.2",
  "mongoose": "^8.0.3"
}
```

---

## 🔒 Security Features

- ✅ Password hashing (bcrypt, 12 rounds)
- ✅ JWT-based stateless authentication
- ✅ HTTP security headers (Helmet)
- ✅ Rate limiting (100 req/15min general, 10 req/15min auth)
- ✅ Input validation & sanitization (express-validator)
- ✅ CORS configuration
- ✅ Environment variables for secrets
- ✅ MongoDB injection protection (Mongoose)
- ✅ Passwords never returned in API responses

---

## 🐛 Troubleshooting

**"Connection error" on login/register:**
- Ensure backend is running on port 5000
- Check `FRONTEND_URL` in `.env` matches your frontend URL
- Verify MongoDB is running locally OR Atlas URI is correct

**MongoDB connection fails:**
- Local: Run `mongod` in terminal
- Atlas: Check IP whitelist (add `0.0.0.0/0` for development)

**CORS errors:**
- Update `FRONTEND_URL` in `.env` to match exactly where frontend is served

---

## 📈 Production Deployment

**Backend:** Deploy to Railway, Render, or Heroku
**Frontend:** Deploy to Vercel, Netlify, or GitHub Pages
**Database:** Use MongoDB Atlas (free M0 tier available)

Update `API_BASE` in `frontend/js/app.js` to your production API URL.

---

## 📝 License

MIT — Free to use and modify.

---

*Built with ☕ for Green Coffee Café — Organic, Artisan, Conscious*
