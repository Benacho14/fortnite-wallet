import prisma from '../config/database';
import { TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { notifyUser } from '../utils/websocket';

export async function getAllUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      account: {
        select: { balance: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return users;
}

export async function getAllTransactions(limit = 100) {
  const transactions = await prisma.transaction.findMany({
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

export async function getAllOrders(limit = 100) {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      buyer: {
        select: { id: true, name: true, email: true },
      },
      product: {
        include: {
          store: {
            include: {
              owner: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      },
    },
  });

  return orders;
}

export async function reverseTransaction(transactionId: string, reason: string) {
  // Get original transaction
  const originalTransaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      sender: {
        include: { account: true },
      },
      receiver: {
        include: { account: true },
      },
    },
  });

  if (!originalTransaction) {
    throw new Error('Transaction not found');
  }

  if (!originalTransaction.senderId || !originalTransaction.receiverId) {
    throw new Error('Cannot reverse this type of transaction');
  }

  const sender = originalTransaction.sender!;
  const receiver = originalTransaction.receiver!;

  if (!sender.account || !receiver.account) {
    throw new Error('Account not found');
  }

  const amount = parseFloat(originalTransaction.amount.toString());

  // Check if receiver has sufficient balance for reversal
  const receiverBalance = parseFloat(receiver.account.balance.toString());
  if (receiverBalance < amount) {
    throw new Error('Receiver has insufficient balance for reversal');
  }

  // Execute reversal using transaction (ACID guarantee)
  const result = await prisma.$transaction(async (tx) => {
    // Reverse the amounts
    const updatedReceiver = await tx.account.update({
      where: { userId: receiver.id },
      data: { balance: { decrement: new Decimal(amount) } },
    });

    const updatedSender = await tx.account.update({
      where: { userId: sender.id },
      data: { balance: { increment: new Decimal(amount) } },
    });

    // Create reversal transaction records
    const reversalSent = await tx.transaction.create({
      data: {
        amount: new Decimal(amount),
        type: TransactionType.REVERSAL,
        description: `REVERSAL: ${reason} (Original: ${originalTransaction.description})`,
        senderId: receiver.id,
        receiverId: sender.id,
        metadata: {
          originalTransactionId: transactionId,
          reason,
        },
      },
    });

    const reversalReceived = await tx.transaction.create({
      data: {
        amount: new Decimal(amount),
        type: TransactionType.ADMIN_ADJUSTMENT,
        description: `REVERSAL RECEIVED: ${reason}`,
        senderId: receiver.id,
        receiverId: sender.id,
        metadata: {
          originalTransactionId: transactionId,
          reason,
        },
      },
    });

    return { updatedReceiver, updatedSender, reversalSent };
  });

  // Notify users
  notifyUser(sender.id, 'reversal_completed', {
    amount,
    reason,
    newBalance: result.updatedSender.balance.toString(),
  });

  notifyUser(receiver.id, 'reversal_completed', {
    amount,
    reason,
    newBalance: result.updatedReceiver.balance.toString(),
  });

  return {
    success: true,
    reversal: result.reversalSent,
  };
}
