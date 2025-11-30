# 🏦 Virtual Wallet - START HERE

**Welcome to the Virtual Wallet project!** 👋

This is a complete, ready-to-run virtual wallet application with marketplace functionality.

---

## ⚡ Quick Start (5 Minutes)

**1. Start the database:**
```bash
docker-compose up -d
```

**2. Setup backend (new terminal):**
```bash
cd backend
npm install
npm run migrate
npm run seed
npm run dev
```

**3. Setup frontend (new terminal):**
```bash
cd frontend
npm install
npm run dev
```

**4. Open your browser:**
- Visit: http://localhost:5173
- Login: **alice@example.com** / **password123**
- Or Admin: **admin@wallet.com** / **password123**

**Done!** 🎉 You can now transfer money, buy products, and manage transactions.

---

## 📚 What This Project Does

✅ **Virtual Wallet**: Check balance, send/receive money
✅ **Marketplace**: Create stores, list products, buy items
✅ **Real-time**: WebSocket notifications for all transactions
✅ **Admin Panel**: View all users, transactions, reverse payments
✅ **Security**: JWT auth, bcrypt passwords, rate limiting
✅ **ACID Transactions**: Guaranteed consistency with no double-spending

---

## 🗂️ Documentation

| Document | Purpose |
|----------|---------|
| **[INDEX.md](INDEX.md)** | Master index of all docs |
| **[QUICKSTART.md](QUICKSTART.md)** | Detailed 5-min setup |
| **[README.md](README.md)** | Complete guide with API examples |
| **[INSTALLATION_CHECKLIST.md](INSTALLATION_CHECKLIST.md)** | Step-by-step verification |
| **[TESTING_GUIDE.md](TESTING_GUIDE.md)** | 10 test scenarios |
| **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** | Features & tech stack |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | How transactions work |

---

## 🎯 Next Steps

1. **✅ Run the app** (see Quick Start above)
2. **🧪 Try test scenarios** → [TESTING_GUIDE.md](TESTING_GUIDE.md)
3. **📖 Understand the code** → [PROJECT_STRUCTURE.txt](PROJECT_STRUCTURE.txt)
4. **🔧 Extend features** → Browse source files

---

## 🆘 Need Help?

**Common Issues:**

❓ **Database won't start?**
→ Ensure Docker is running: `docker ps`

❓ **Migration fails?**
→ Delete `backend/prisma/migrations`, re-run `npm run migrate`

❓ **WebSocket not connecting?**
→ Ensure backend is on port 3001, check browser console

❓ **More help?**
→ See [INSTALLATION_CHECKLIST.md](INSTALLATION_CHECKLIST.md)

---

## ⚠️ Important

This is a **SIMULATED** wallet for **educational purposes ONLY**.
❌ No real money
❌ No real payment processors
❌ Not production-ready

---

## 📊 Quick Stats

- **Backend**: Node.js + TypeScript + Express + Prisma + PostgreSQL
- **Frontend**: React + TypeScript + Vite + Tailwind (dark theme)
- **API Endpoints**: 17 endpoints
- **Database Models**: 8 models
- **Tests**: 16+ integration tests
- **Lines of Code**: ~4,500 lines

---

**Ready?** → Run the Quick Start commands above! 🚀

Or explore the docs → **[INDEX.md](INDEX.md)**
