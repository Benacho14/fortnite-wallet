import request from 'supertest';
import app from '../backend/src/index';

describe('Product Purchase', () => {
  let bobToken: string;
  let productId: string;

  beforeAll(async () => {
    // Login as Bob
    const bobLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bob@example.com', password: 'password123' });
    bobToken = bobLogin.body.token;

    // Get a product to purchase
    const productsRes = await request(app).get('/api/products');
    if (productsRes.body.length > 0) {
      productId = productsRes.body[0].id;
    }
  });

  it('should purchase a product successfully', async () => {
    if (!productId) {
      console.log('No products available, skipping test');
      return;
    }

    const response = await request(app)
      .post('/api/orders/buy')
      .set('Authorization', `Bearer ${bobToken}`)
      .send({
        productId,
        quantity: 1,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('order');
  });

  it('should fail purchase with insufficient balance', async () => {
    if (!productId) return;

    const response = await request(app)
      .post('/api/orders/buy')
      .set('Authorization', `Bearer ${bobToken}`)
      .send({
        productId,
        quantity: 99999,
      });

    expect(response.status).toBe(500);
  });

  it('should fail purchase with invalid quantity', async () => {
    if (!productId) return;

    const response = await request(app)
      .post('/api/orders/buy')
      .set('Authorization', `Bearer ${bobToken}`)
      .send({
        productId,
        quantity: -1,
      });

    expect(response.status).toBe(400);
  });
});
