import request from 'supertest';
import app from '../backend/src/index';

describe('Authentication', () => {
  let authToken: string;

  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        name: 'Test User',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBeDefined();
  });

  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alice@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe('alice@example.com');
    authToken = response.body.token;
  });

  it('should reject login with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alice@example.com',
        password: 'wrongpassword',
      });

    expect(response.status).toBe(500);
  });

  it('should access protected route with valid token', async () => {
    const response = await request(app)
      .get('/api/account/balance')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('balance');
  });

  it('should reject protected route without token', async () => {
    const response = await request(app).get('/api/account/balance');

    expect(response.status).toBe(401);
  });
});
