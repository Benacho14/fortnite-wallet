import prisma from '../config/database';
import { TransactionType } from '@prisma/client';

export async function getBalance(userId: string) {
  const account = await prisma.account.findUnique({
    where: { userId },
    select: { balance: true },
  });

  if (!account) {
    throw new Error('Account not found');
  }

  return { balance: account.balance };
}

export async function getTransactionHistory(userId: string, limit = 50) {
  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      sender: {
        select: { id: true, name: true, email: true },
      },
      receiver: {
        select: { id: true, name: true, email: true },
      },
      order: {
        include: {
          product: {
            select: { name: true },
          },
        },
      },
    },
  });

  return transactions;
}

export async function getAccountDetails(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      account: {
        select: { balance: true },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}
