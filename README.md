# Virtual Wallet with Marketplace

**⚠️ DISCLAIMER: This is a SIMULATED wallet for educational purposes ONLY. It does NOT handle real money or integrate with any real payment processors. All transactions are fictional and stored in a local database.**

A full-stack TypeScript application featuring a virtual wallet system with user-to-user transfers, a marketplace for buying/selling products, real-time notifications via WebSocket, and an admin panel for transaction management.

## Features

- 🔐 **Authentication**: JWT-based auth with bcrypt password hashing
- 💰 **Virtual Wallet**: Check balance, view transaction history
- 💸 **Transfers**: Send money to other users with ACID guarantees
- 🏪 **Marketplace**: Create stores, list products, purchase items
- 🔔 **Real-time Notifications**: WebSocket notifications for transfers and purchases
- 👑 **Admin Panel**: View all users, transactions, orders, and reverse transactions
- 🔒 **Security**: Rate limiting, input validation (Zod), SQL injection prevention
- 🎨 **Dark Theme**: Responsive UI with Tailwind CSS

## Tech Stack

### Backend
- Node.js 18+ with TypeScript
- Express.js for REST API
- Prisma ORM with PostgreSQL
- Socket.IO for WebSocket
- JWT for authentication
- Zod for validation
- bcrypt for password hashing

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS (dark theme)
- React Router for navigation
- Socket.IO client for real-time updates

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 14+ (or use Docker Compose)
- npm or yarn

## Installation

### 1. Clone or Extract the Project

```bash
cd wallet_def
```

### 2. Setup Database

**Option A: Using Docker (Recommended)**

```bash
docker-compose up -d
```

This will start a PostgreSQL database on port 5432.

**Option B: Using Local PostgreSQL**

Install PostgreSQL locally and create a database named `wallet_virtual`.

### 3. Configure Backend

```bash
cd backend
npm install
```

Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wallet_virtual?schema=public"
PORT=3001
NODE_ENV=development
JWT_SECRET="change-this-to-a-random-secret-key"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:5173"
```

**IMPORTANT**: Change `JWT_SECRET` to a random string in production!

### 4. Run Database Migrations

```bash
npm run migrate
```

This creates all database tables. When prompted, enter a migration name like `init`.

### 5. Seed the Database

```bash
npm run seed
```

This creates test users, stores, and products:
- **Admin**: admin@wallet.com / password123 (Balance: $10,000)
- **User 1**: alice@example.com / password123 (Balance: $1,000)
- **User 2**: bob@example.com / password123 (Balance: $500)

### 6. Start Backend Server

```bash
npm run dev
```

Backend runs on **http://localhost:3001**

### 7. Setup Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

## Usage Guide

### 1. Register a New User

**UI**: Visit http://localhost:5173/register

**API**:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "name": "New User"
  }'
```

Response includes `token` and `user` object.

### 2. Login

**UI**: Visit http://localhost:5173/login

**API**:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123"
  }'
```

Save the `token` from the response.

### 3. Check Balance

```bash
curl -X GET http://localhost:3001/api/account/balance \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Transfer Money

**UI**: Dashboard → Send Money form

**API**:
```bash
curl -X POST http://localhost:3001/api/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "receiverEmail": "bob@example.com",
    "amount": 50,
    "description": "Payment for lunch"
  }'
```

### 5. Create a Store

**UI**: Marketplace → Create Store/Product tab

**API**:
```bash
curl -X POST http://localhost:3001/api/stores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "My Awesome Store",
    "description": "Selling cool stuff"
  }'
```

### 6. Create a Product

**API**:
```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "storeId": "STORE_ID_HERE",
    "name": "Cool Gadget",
    "description": "A very cool gadget",
    "price": 99.99,
    "stock": 10
  }'
```

### 7. Buy a Product

**UI**: Marketplace → Products → Buy Now

**API**:
```bash
curl -X POST http://localhost:3001/api/orders/buy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "productId": "PRODUCT_ID_HERE",
    "quantity": 1
  }'
```

### 8. Admin: View All Transactions

Login as admin (admin@wallet.com) and visit http://localhost:5173/admin

**API**:
```bash
curl -X GET http://localhost:3001/api/admin/transactions \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### 9. Admin: Reverse a Transaction

**API**:
```bash
curl -X POST http://localhost:3001/api/admin/reverse-transaction \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -d '{
    "transactionId": "TRANSACTION_ID_HERE",
    "reason": "Fraudulent transaction detected"
  }'
```

### 10. Real-time Notifications

When logged in, you'll see toast notifications in the top-right corner for:
- Money received
- Money sent
- Product purchased
- Product sold
- Transaction reversals

## Running Tests

```bash
cd backend
npm test
```

Tests cover:
- Authentication (register, login)
- Transfers (successful, insufficient balance, negative amount)
- Purchases (successful, invalid quantity)
- Admin operations (view users/transactions, reverse transaction)

## Project Structure

```
wallet_def/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.ts             # Seed data
│   ├── src/
│   │   ├── config/             # Environment and database config
│   │   ├── middleware/         # Auth, rate limiting, error handling
│   │   ├── routes/             # API route handlers
│   │   ├── services/           # Business logic (ACID transactions)
│   │   ├── validators/         # Zod schemas
│   │   ├── utils/              # JWT, WebSocket utilities
│   │   └── index.ts            # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── contexts/           # Auth and WebSocket context
│   │   ├── pages/              # Page components
│   │   ├── services/           # API client
│   │   └── types/              # TypeScript types
│   └── package.json
├── tests/                      # Jest integration tests
├── docker-compose.yml          # PostgreSQL container
└── README.md
```

## How Transaction Consistency is Guaranteed

**ACID Transactions with Prisma**:
1. All money transfers and purchases use `prisma.$transaction()` to wrap multiple database operations.
2. Within a transaction block:
   - Balances are debited from sender/buyer
   - Balances are credited to receiver/seller
   - Stock is decremented (for purchases)
   - Transaction records are created
3. If ANY operation fails (e.g., insufficient balance, stock error), the entire transaction is **rolled back** atomically.
4. Database-level constraints ensure decimal precision (15,2) to avoid floating-point errors.
5. Validations (Zod) prevent negative amounts, self-transfers, and invalid inputs before hitting the database.

This ensures **no double-spending**, **no partial transactions**, and **consistent balances** at all times.

## Scripts Reference

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production build
- `npm run migrate` - Run Prisma migrations
- `npm run seed` - Populate database with test data
- `npm run studio` - Open Prisma Studio (database GUI)
- `npm test` - Run Jest tests

### Frontend
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Security Notes

- **Passwords**: Hashed with bcrypt (salt rounds: 10)
- **JWT**: Tokens expire in 7 days (configurable)
- **Rate Limiting**:
  - Auth endpoints: 5 attempts per 15 minutes
  - Transfer endpoint: 10 per minute
  - General API: 100 requests per 15 minutes
- **Input Validation**: All user inputs validated with Zod schemas
- **SQL Injection**: Prevented by Prisma's parameterized queries
- **Secrets**: Never commit `.env` file (use `.env.example` as template)

## Troubleshooting

### Database Connection Failed
- Ensure PostgreSQL is running (`docker-compose up -d` or local service)
- Check `DATABASE_URL` in `.env` matches your database credentials

### Migration Errors
- Delete `backend/prisma/migrations` folder and re-run `npm run migrate`
- Or reset database: `npx prisma migrate reset`

### WebSocket Not Connecting
- Ensure backend is running on port 3001
- Check CORS settings in `backend/src/index.ts`
- Verify token is being sent in WebSocket auth handshake

### Port Already in Use
- Change `PORT` in `backend/.env` (backend)
- Change `server.port` in `frontend/vite.config.ts` (frontend)

## License

MIT License - Educational Use Only

## Contributing

This is a demo project. Feel free to fork and extend for learning purposes.

---

**Remember**: This is a SIMULATION. Do NOT use this code to handle real money without proper security audits, PCI compliance, and licensed payment processor integration.
