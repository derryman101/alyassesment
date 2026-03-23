const request = require('supertest');
const app = require('../app/index');

describe('API Endpoints', () => {
  test('GET / returns welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Hello from 10aly assement derry!');
    expect(res.body).toHaveProperty('timestamp');
  });

  test('GET /health returns healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body).toHaveProperty('uptime');
  });

  test('GET /api/items returns item list', async () => {
    const res = await request(app).get('/api/items');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.count).toBe(3);
  });

  test('GET /api/items items have required fields', async () => {
    const res = await request(app).get('/api/items');
    res.body.items.forEach(item => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('done');
    });
  });

  test('GET unknown route returns 404', async () => {
    const res = await request(app).get('/nonexistent');
    expect(res.statusCode).toBe(404);
  });
});
