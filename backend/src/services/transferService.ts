import prisma from '../config/database';
import { TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { notifyUser } from '../utils/websocket';

export async function transferFunds(
  senderUserId: string,
  receiverEmail: string,
  amount: number,
  description?: string
) {
  // Validation
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  // Get sender
  const sender = await prisma.user.findUnique({
    where: { id: senderUserId },
    include: { account: true },
  });

  if (!sender || !sender.account) {
    throw new Error('Sender account not found');
  }

  // Prevent self-transfer
  if (sender.email === receiverEmail) {
    throw new Error('Cannot transfer to yourself');
  }

  // Get receiver
  const receiver = await prisma.user.findUnique({
    where: { email: receiverEmail },
    include: { account: true },
  });

  if (!receiver || !receiver.account) {
    throw new Error('Receiver not found');
  }

  // Check sufficient balance
  const senderBalance = parseFloat(sender.account.balance.toString());
  if (senderBalance < amount) {
    throw new Error('Insufficient balance');
  }

  // Execute transfer using transaction (ACID guarantee)
  const result = await prisma.$transaction(async (tx) => {
    // Deduct from sender
    const updatedSender = await tx.account.update({
      where: { userId: sender.id },
      data: { balance: { decrement: new Decimal(amount) } },
    });

    // Add to receiver
    const updatedReceiver = await tx.account.update({
      where: { userId: receiver.id },
      data: { balance: { increment: new Decimal(amount) } },
    });

    // Create transaction records
    const transferSent = await tx.transaction.create({
      data: {
        amount: new Decimal(amount),
        type: TransactionType.TRANSFER_SENT,
        description: description || `Transfer to ${receiver.name}`,
        senderId: sender.id,
        receiverId: receiver.id,
      },
    });

    const transferReceived = await tx.transaction.create({
      data: {
        amount: new Decimal(amount),
        type: TransactionType.TRANSFER_RECEIVED,
        description: description || `Transfer from ${sender.name}`,
        senderId: sender.id,
        receiverId: receiver.id,
      },
    });

    return { updatedSender, updatedReceiver, transferSent, transferReceived };
  });

  // Send real-time notifications via WebSocket
  notifyUser(receiver.id, 'transfer_received', {
    amount,
    from: sender.name,
    description,
    newBalance: result.updatedReceiver.balance.toString(),
  });

  notifyUser(sender.id, 'transfer_sent', {
    amount,
    to: receiver.name,
    description,
    newBalance: result.updatedSender.balance.toString(),
  });

  return {
    success: true,
    transaction: result.transferSent,
    newBalance: result.updatedSender.balance,
  };
}
