# Architecture & Transaction Consistency

## How the System Guarantees Transaction Consistency

### ACID Compliance via Prisma Transactions

All monetary operations (transfers, purchases) use **database transactions** to ensure ACID properties:

1. **Atomicity**: Operations either complete fully or roll back entirely
2. **Consistency**: Database constraints prevent invalid states
3. **Isolation**: Concurrent transactions don't interfere
4. **Durability**: Committed transactions persist permanently

### Transfer Example (backend/src/services/transferService.ts)

```typescript
await prisma.$transaction(async (tx) => {
  // 1. Deduct from sender (fails if insufficient balance)
  await tx.account.update({
    where: { userId: sender.id },
    data: { balance: { decrement: amount } }
  });

  // 2. Add to receiver
  await tx.account.update({
    where: { userId: receiver.id },
    data: { balance: { increment: amount } }
  });

  // 3. Create transaction records
  await tx.transaction.create({ ... });
});
```

**If ANY step fails** (e.g., insufficient balance causes constraint violation), the **entire transaction rolls back**—no partial transfers occur.

### Purchase Example (backend/src/services/storeService.ts)

Similar pattern with additional stock management:
- Deduct buyer balance
- Add to seller balance
- Decrement product stock
- Create order record
- Create transaction records

**All or nothing**: If stock runs out mid-transaction or buyer lacks funds, everything reverts.

### Decimal Precision

PostgreSQL `DECIMAL(15,2)` ensures no floating-point errors. Prisma's `Decimal` type maintains precision throughout the application stack.

### Validation Layers

1. **Zod schemas** validate inputs (positive amounts, valid emails)
2. **Business logic** checks (no self-transfers, sufficient balance)
3. **Database constraints** enforce data integrity (foreign keys, NOT NULL)

### Concurrency Safety

PostgreSQL row-level locking prevents race conditions when multiple users transact simultaneously. Prisma handles locking automatically within transactions.

---

**Result**: Zero double-spending, consistent balances, full audit trail.
