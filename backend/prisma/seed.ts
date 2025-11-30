import { PrismaClient, UserRole, TransactionType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.transaction.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@wallet.com',
      password: hashedPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
      account: {
        create: {
          balance: 10000.00,
        },
      },
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      password: hashedPassword,
      name: 'Alice Smith',
      role: UserRole.USER,
      account: {
        create: {
          balance: 1000.00,
        },
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      password: hashedPassword,
      name: 'Bob Johnson',
      role: UserRole.USER,
      account: {
        create: {
          balance: 500.00,
        },
      },
    },
  });

  console.log('✅ Users created');

  // Create stores
  const store1 = await prisma.store.create({
    data: {
      name: 'Alice\'s Electronics',
      description: 'Best electronics in town',
      ownerId: user1.id,
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: 'Bob\'s Books',
      description: 'Quality books for everyone',
      ownerId: user2.id,
    },
  });

  console.log('✅ Stores created');

  // Create products
  const product1 = await prisma.product.create({
    data: {
      name: 'Wireless Headphones',
      description: 'Premium noise-cancelling headphones',
      price: 150.00,
      stock: 10,
      storeId: store1.id,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'Smartphone',
      description: 'Latest model smartphone',
      price: 800.00,
      stock: 5,
      storeId: store1.id,
    },
  });

  const product3 = await prisma.product.create({
    data: {
      name: 'TypeScript Handbook',
      description: 'Complete guide to TypeScript',
      price: 45.00,
      stock: 20,
      storeId: store2.id,
    },
  });

  console.log('✅ Products created');

  // Create sample transactions
  await prisma.transaction.create({
    data: {
      amount: 100.00,
      type: TransactionType.TRANSFER_SENT,
      description: 'Transfer to Bob',
      senderId: user1.id,
      receiverId: user2.id,
    },
  });

  await prisma.transaction.create({
    data: {
      amount: 100.00,
      type: TransactionType.TRANSFER_RECEIVED,
      description: 'Transfer from Alice',
      senderId: user1.id,
      receiverId: user2.id,
    },
  });

  console.log('✅ Sample transactions created');

  console.log('🎉 Seeding completed!');
  console.log('\n📋 Test credentials:');
  console.log('Admin: admin@wallet.com / password123');
  console.log('User 1: alice@example.com / password123');
  console.log('User 2: bob@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
