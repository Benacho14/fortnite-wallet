import request from 'supertest';
import app from '../backend/src/index';

describe('Admin Functionality', () => {
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    // Login as admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@wallet.com', password: 'password123' });
    adminToken = adminLogin.body.token;

    // Login as regular user
    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@example.com', password: 'password123' });
    userToken = userLogin.body.token;
  });

  it('should allow admin to get all users', async () => {
    const response = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should allow admin to get all transactions', async () => {
    const response = await request(app)
      .get('/api/admin/transactions')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should deny regular user access to admin routes', async () => {
    const response = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(403);
  });

  it('should allow admin to reverse a transaction', async () => {
    // Get a transaction
    const txRes = await request(app)
      .get('/api/admin/transactions')
      .set('Authorization', `Bearer ${adminToken}`);

    const transferTx = txRes.body.find(
      (tx: any) => tx.type === 'TRANSFER_SENT' && tx.senderId && tx.receiverId
    );

    if (!transferTx) {
      console.log('No transfer transaction found, skipping test');
      return;
    }

    const response = await request(app)
      .post('/api/admin/reverse-transaction')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        transactionId: transferTx.id,
        reason: 'Testing reversal functionality',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
