# Quick Start Guide

Get the Virtual Wallet running in under 5 minutes!

## Step 1: Start Database

```bash
docker-compose up -d
```

Wait ~10 seconds for PostgreSQL to initialize.

## Step 2: Setup Backend

```bash
cd backend
npm install
npm run migrate    # Press Enter when prompted for migration name
npm run seed       # Creates test users and data
npm run dev        # Starts backend on port 3001
```

## Step 3: Setup Frontend (New Terminal)

```bash
cd frontend
npm install
npm run dev        # Starts frontend on port 5173
```

## Step 4: Open Browser

Visit **http://localhost:5173**

## Step 5: Login with Test Account

Use one of these test accounts:

- **Admin**: admin@wallet.com / password123
- **User 1**: alice@example.com / password123
- **User 2**: bob@example.com / password123

## Test Scenarios

### A. Transfer Money
1. Login as Alice
2. Go to Dashboard
3. Send $50 to bob@example.com
4. See real-time notification
5. Check transaction history

### B. Buy a Product
1. Go to Marketplace
2. Click "Buy Now" on any product
3. Enter quantity (e.g., 1)
4. Confirm purchase
5. See notification and updated balance

### C. Create Store & Product
1. Marketplace → Create Store/Product tab
2. Create a new store
3. Add a product to your store
4. Other users can now buy it

### D. Admin Panel
1. Logout and login as admin@wallet.com
2. Visit Admin page (top menu)
3. View all users, transactions, orders
4. Try reversing a transaction

## API Testing with curl

Get Alice's token:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'
```

Transfer $25 from Alice to Bob:
```bash
curl -X POST http://localhost:3001/api/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"receiverEmail":"bob@example.com","amount":25,"description":"Test"}'
```

## Stopping the App

Press `Ctrl+C` in both terminal windows (backend and frontend).

Stop database:
```bash
docker-compose down
```

## Troubleshooting

**Database won't start?**
- Ensure Docker is running
- Check port 5432 isn't in use: `docker ps`

**Migration fails?**
- Delete `backend/prisma/migrations` folder
- Re-run `npm run migrate`

**WebSocket not connecting?**
- Ensure backend is running on port 3001
- Check browser console for errors

---

Enjoy testing your virtual wallet! 🏦
