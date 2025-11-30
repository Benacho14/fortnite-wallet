# Installation Checklist

Use this checklist to verify your setup is complete and working.

---

## ✅ Pre-Installation

- [ ] Node.js 18+ installed
  ```bash
  node --version  # Should show v18.x.x or higher
  ```

- [ ] npm installed
  ```bash
  npm --version  # Should show 9.x.x or higher
  ```

- [ ] Docker installed (for database)
  ```bash
  docker --version  # Should show Docker version
  ```

- [ ] PostgreSQL database available
  - **Option A**: Docker Compose (recommended)
  - **Option B**: Local PostgreSQL installation

---

## ✅ Database Setup

- [ ] Docker Compose started
  ```bash
  docker-compose up -d
  ```

- [ ] PostgreSQL running on port 5432
  ```bash
  docker ps  # Should show postgres container
  ```

- [ ] Database connection works
  ```bash
  # Try connecting (if using Docker)
  docker exec -it wallet_postgres psql -U postgres -d wallet_virtual
  # Type \q to exit
  ```

---

## ✅ Backend Setup

- [ ] Navigate to backend directory
  ```bash
  cd backend
  ```

- [ ] Dependencies installed
  ```bash
  npm install
  # Should complete without errors
  ```

- [ ] `.env` file created
  ```bash
  ls -la .env  # File should exist
  cat .env     # Check DATABASE_URL is correct
  ```

- [ ] Prisma Client generated
  ```bash
  npx prisma generate
  ```

- [ ] Database migrations run
  ```bash
  npm run migrate
  # Should create tables
  ```

- [ ] Database seeded
  ```bash
  npm run seed
  # Should show "Seeding completed!"
  ```

- [ ] Backend server starts
  ```bash
  npm run dev
  # Should show:
  # ╔═══════════════════════════════════════╗
  # ║   🏦 Virtual Wallet API Server       ║
  # ╠═══════════════════════════════════════╣
  # ║   Port: 3001                         ║
  # ...
  ```

- [ ] Health check works
  ```bash
  curl http://localhost:3001/health
  # Should return: {"status":"ok","timestamp":"..."}
  ```

---

## ✅ Frontend Setup

- [ ] Navigate to frontend directory (new terminal)
  ```bash
  cd frontend
  ```

- [ ] Dependencies installed
  ```bash
  npm install
  # Should complete without errors
  ```

- [ ] Frontend server starts
  ```bash
  npm run dev
  # Should show:
  # VITE v5.x.x  ready in xxx ms
  # ➜  Local:   http://localhost:5173/
  ```

- [ ] Browser opens and shows app
  - Visit http://localhost:5173
  - Should see dark-themed login page

---

## ✅ Functionality Testing

### Basic UI

- [ ] Login page loads
  - Visit http://localhost:5173/login

- [ ] Test credentials displayed
  - Should see "Test credentials" box

- [ ] Login works
  - Email: alice@example.com
  - Password: password123
  - Click "Sign in"
  - ✅ Redirects to Dashboard

- [ ] Dashboard loads
  - Shows balance
  - Shows "Send Money" form
  - Shows "Recent Transactions"

- [ ] Marketplace loads
  - Visit http://localhost:5173/marketplace
  - Shows products, stores, create tabs

- [ ] Admin panel loads (admin only)
  - Logout, login as admin@wallet.com
  - Visit http://localhost:5173/admin
  - Shows users, transactions, orders tabs

### API Endpoints

- [ ] Register endpoint works
  ```bash
  curl -X POST http://localhost:3001/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test123","name":"Test"}'
  # Should return: {"token":"...","user":{...}}
  ```

- [ ] Login endpoint works
  ```bash
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"alice@example.com","password":"password123"}'
  # Should return: {"token":"...","user":{...}}
  ```

- [ ] Protected endpoint requires auth
  ```bash
  curl http://localhost:3001/api/account/balance
  # Should return: {"error":"No token provided"}
  ```

### Database

- [ ] Prisma Studio opens
  ```bash
  cd backend && npm run studio
  # Opens http://localhost:5555
  ```

- [ ] All models visible
  - User (3 users: admin, alice, bob)
  - Account (3 accounts with balances)
  - Transaction (2+ sample transactions)
  - Store (2 stores)
  - Product (3 products)

### WebSocket

- [ ] WebSocket connects
  - Login to UI
  - Open browser console (F12)
  - Should see: "✅ WebSocket connected"

- [ ] Real-time notifications work
  - Login as Alice in browser 1
  - Login as Bob in browser 2 (incognito)
  - Alice sends $10 to Bob
  - ✅ Bob sees notification appear

---

## ✅ Automated Tests

- [ ] Tests run successfully
  ```bash
  cd backend
  npm test
  # Should show:
  # Test Suites: 4 passed, 4 total
  # Tests:       16 passed, 16 total
  ```

- [ ] All test suites pass
  - ✅ Authentication (5/5)
  - ✅ Transfer (4/4)
  - ✅ Purchase (3/3)
  - ✅ Admin (4/4)

---

## ✅ Security Checks

- [ ] Passwords are hashed
  - Open Prisma Studio
  - Check User model
  - Password field should be: `$2b$10$...` (bcrypt hash)

- [ ] JWT works
  - Login via API
  - Copy token
  - Use token in Authorization header
  - ✅ Should access protected routes

- [ ] Rate limiting works
  - Make 6+ failed login attempts quickly
  - ✅ Should see "Too many attempts" error

- [ ] Admin routes protected
  - Login as regular user (Alice)
  - Try to visit /admin
  - ✅ Should redirect to /dashboard

---

## ✅ Documentation

- [ ] README.md exists and is readable
- [ ] QUICKSTART.md exists
- [ ] TESTING_GUIDE.md exists
- [ ] All markdown files render correctly

---

## ✅ Optional Verifications

### Docker

- [ ] Database persists after restart
  ```bash
  docker-compose down
  docker-compose up -d
  # Login to UI - data should still exist
  ```

### Production Build

- [ ] Backend builds successfully
  ```bash
  cd backend
  npm run build
  # Should create dist/ folder
  ```

- [ ] Frontend builds successfully
  ```bash
  cd frontend
  npm run build
  # Should create dist/ folder
  ```

---

## 🐛 Troubleshooting

If any check fails, see common solutions:

### Backend won't start
- Check `.env` file exists in `backend/`
- Check DATABASE_URL is correct
- Run `docker ps` to verify postgres is running

### Database connection fails
- Run `docker-compose down && docker-compose up -d`
- Wait 10 seconds for postgres to initialize
- Check port 5432 is not in use

### Frontend won't start
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Check port 5173 is not in use

### WebSocket won't connect
- Ensure backend is running on port 3001
- Check CORS settings in `backend/src/index.ts`
- Check browser console for errors

### Tests fail
- Ensure database is seeded: `npm run seed`
- Ensure backend is not running (tests start their own server)
- Clear database and re-migrate: `npm run migrate -- --force`

---

## ✅ Final Verification

**Run this complete test:**

1. Open 3 browser windows:
   - Window 1: Login as Alice
   - Window 2: Login as Bob
   - Window 3: Login as Admin

2. Alice sends $25 to Bob
3. ✅ Bob's window shows notification immediately
4. ✅ Bob's balance increases
5. ✅ Admin sees new transaction in admin panel

6. Bob buys a product from Alice's store
7. ✅ Alice sees sale notification
8. ✅ Product stock decreases
9. ✅ Admin sees new order

10. Admin reverses a transaction
11. ✅ Both users see reversal notification
12. ✅ Balances revert

**If all above works** → ✅ **Installation Complete!**

---

## 📋 Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Database | ⬜ | PostgreSQL via Docker |
| Backend | ⬜ | Express + Prisma + Socket.IO |
| Frontend | ⬜ | React + Vite + Tailwind |
| Tests | ⬜ | 16+ passing tests |
| WebSocket | ⬜ | Real-time notifications |
| Security | ⬜ | JWT + bcrypt + rate limiting |

**Mark with ✅ as you complete each section!**

---

Need help? See [README.md](README.md) or [TESTING_GUIDE.md](TESTING_GUIDE.md)
