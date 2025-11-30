import prisma from '../config/database';
import { TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { notifyUser } from '../utils/websocket';

export async function createStore(userId: string, name: string, description?: string) {
  const store = await prisma.store.create({
    data: {
      name,
      description,
      ownerId: userId,
    },
  });

  return store;
}

export async function getStores() {
  const stores = await prisma.store.findMany({
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: { products: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return stores;
}

export async function getStoreById(storeId: string) {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
      products: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!store) {
    throw new Error('Store not found');
  }

  return store;
}

export async function createProduct(
  userId: string,
  storeId: string,
  name: string,
  price: number,
  stock: number,
  description?: string
) {
  // Verify ownership
  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!store) {
    throw new Error('Store not found');
  }

  if (store.ownerId !== userId) {
    throw new Error('Not authorized to add products to this store');
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price: new Decimal(price),
      stock,
      storeId,
    },
  });

  return product;
}

export async function getProducts() {
  const products = await prisma.product.findMany({
    where: { stock: { gt: 0 } },
    include: {
      store: {
        include: {
          owner: {
            select: { id: true, name: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return products;
}

export async function purchaseProduct(buyerId: string, productId: string, quantity: number) {
  if (quantity <= 0) {
    throw new Error('Quantity must be positive');
  }

  // Get buyer
  const buyer = await prisma.user.findUnique({
    where: { id: buyerId },
    include: { account: true },
  });

  if (!buyer || !buyer.account) {
    throw new Error('Buyer account not found');
  }

  // Get product with store and owner
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      store: {
        include: {
          owner: {
            include: { account: true },
          },
        },
      },
    },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  if (product.stock < quantity) {
    throw new Error('Insufficient stock');
  }

  // Prevent buying from own store
  if (product.store.ownerId === buyerId) {
    throw new Error('Cannot buy from your own store');
  }

  const totalPrice = parseFloat(product.price.toString()) * quantity;
  const buyerBalance = parseFloat(buyer.account.balance.toString());

  if (buyerBalance < totalPrice) {
    throw new Error('Insufficient balance');
  }

  const seller = product.store.owner;

  // Execute purchase using transaction (ACID guarantee)
  const result = await prisma.$transaction(async (tx) => {
    // Deduct from buyer
    const updatedBuyer = await tx.account.update({
      where: { userId: buyerId },
      data: { balance: { decrement: new Decimal(totalPrice) } },
    });

    // Add to seller
    const updatedSeller = await tx.account.update({
      where: { userId: seller.id },
      data: { balance: { increment: new Decimal(totalPrice) } },
    });

    // Reduce stock
    await tx.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } },
    });

    // Create order
    const order = await tx.order.create({
      data: {
        quantity,
        totalPrice: new Decimal(totalPrice),
        buyerId,
        productId,
      },
    });

    // Create transaction records
    const purchaseTransaction = await tx.transaction.create({
      data: {
        amount: new Decimal(totalPrice),
        type: TransactionType.PURCHASE,
        description: `Purchase: ${quantity}x ${product.name}`,
        senderId: buyerId,
        receiverId: seller.id,
        orderId: order.id,
      },
    });

    const saleTransaction = await tx.transaction.create({
      data: {
        amount: new Decimal(totalPrice),
        type: TransactionType.SALE,
        description: `Sale: ${quantity}x ${product.name}`,
        senderId: buyerId,
        receiverId: seller.id,
        orderId: order.id,
      },
    });

    return { updatedBuyer, updatedSeller, order, purchaseTransaction };
  });

  // Send real-time notifications
  notifyUser(buyerId, 'purchase_completed', {
    product: product.name,
    quantity,
    totalPrice,
    newBalance: result.updatedBuyer.balance.toString(),
  });

  notifyUser(seller.id, 'sale_completed', {
    product: product.name,
    quantity,
    totalPrice,
    buyer: buyer.name,
    newBalance: result.updatedSeller.balance.toString(),
  });

  return {
    success: true,
    order: result.order,
    newBalance: result.updatedBuyer.balance,
  };
}
