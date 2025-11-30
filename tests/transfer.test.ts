import request from 'supertest';
import app from '../backend/src/index';

describe('Transfer Functionality', () => {
  let aliceToken: string;
  let bobToken: string;
  let aliceInitialBalance: number;

  beforeAll(async () => {
    // Login as Alice
    const aliceLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@example.com', password: 'password123' });
    aliceToken = aliceLogin.body.token;

    // Login as Bob
    const bobLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bob@example.com', password: 'password123' });
    bobToken = bobLogin.body.token;

    // Get Alice's initial balance
    const balanceRes = await request(app)
      .get('/api/account/balance')
      .set('Authorization', `Bearer ${aliceToken}`);
    aliceInitialBalance = parseFloat(balanceRes.body.balance);
  });

  it('should transfer funds successfully', async () => {
    const transferAmount = 50;

    const response = await request(app)
      .post('/api/transfer')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        receiverEmail: 'bob@example.com',
        amount: transferAmount,
        description: 'Test transfer',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should fail transfer with insufficient balance', async () => {
    const response = await request(app)
      .post('/api/transfer')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        receiverEmail: 'bob@example.com',
        amount: 999999,
      });

    expect(response.status).toBe(500);
  });

  it('should fail transfer to self', async () => {
    const response = await request(app)
      .post('/api/transfer')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        receiverEmail: 'alice@example.com',
        amount: 10,
      });

    expect(response.status).toBe(500);
  });

  it('should fail transfer with negative amount', async () => {
    const response = await request(app)
      .post('/api/transfer')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        receiverEmail: 'bob@example.com',
        amount: -50,
      });

    expect(response.status).toBe(400);
  });
});
