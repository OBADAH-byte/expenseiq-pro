# 💎 ExpenseIQ Pro v3.0

**Understand Your Money. Master Your Future.**

A production-ready full-stack personal finance management platform.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### 1. Clone and setup
```bash
cd expenseiq-pro/backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and email credentials
```

### 2. Configure environment
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expenseiq-pro
JWT_SECRET=your_super_secret_key_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLIENT_URL=http://localhost:5000
```

### 3. Run
```bash
# Development
npm run dev

# Production
npm start
```

Open **http://localhost:5000**

---

## 📁 Project Structure

```
expenseiq-pro/
├── frontend/           # Static HTML/CSS/JS files
│   ├── index.html      # Landing page
│   ├── login.html      # Login
│   ├── signup.html     # Registration + OTP
│   ├── dashboard.html  # Main dashboard
│   ├── expenses.html   # Expense management
│   ├── goals.html      # Savings goals
│   ├── badges.html     # Achievement badges
│   ├── reports.html    # Monthly reports
│   ├── settings.html   # User settings
│   ├── developer.html  # Developer info
│   ├── css/            # Stylesheets
│   └── js/             # JavaScript modules
└── backend/
    ├── server.js        # Express server
    ├── config/          # DB & email config
    ├── models/          # Mongoose schemas
    ├── routes/          # API routes
    ├── controllers/     # Business logic
    ├── middleware/      # Auth & error handlers
    └── utils/           # Helpers
```

---

## 🔌 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/verify-otp` | Verify email OTP |
| POST | `/api/auth/resend-otp` | Resend OTP |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/guest` | Guest login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/change-password` | Change password |

### Expenses
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/expenses` | Get all expenses |
| POST | `/api/expenses` | Add expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/expenses/stats` | Get statistics |

### Goals
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/goals` | Get all goals |
| POST | `/api/goals` | Create goal |
| PUT | `/api/goals/:id` | Update goal |
| DELETE | `/api/goals/:id` | Delete goal |
| POST | `/api/goals/:id/add` | Add funds to goal |

### Badges
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/badges` | Get user badges |
| POST | `/api/badges/award` | Award badge |

---

## 🛡️ Security Features
- JWT authentication with 7-day expiry
- bcrypt password hashing (12 rounds)
- Email OTP verification (10-min expiry)
- Rate limiting (100 req/15min globally, 20 for auth)
- Helmet.js security headers
- CORS protection
- Input validation
- MongoDB injection prevention

---

## 🎨 Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JS
- **Libraries**: Chart.js, Three.js, GSAP
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Auth**: JWT + bcrypt
- **Email**: Nodemailer

---

## 👨‍💻 Developer

**Obadah Furquan**

© 2026 Obadah Furquan — All intellectual property rights reserved.  
Made in India 🇮🇳 · Version 3.0
