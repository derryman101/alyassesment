const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Hello from 10aly assement!',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', uptime: process.uptime() });
});

app.get('/api/items', (req, res) => {
  const items = [
    { id: 1, name: 'Deploy Pipeline', done: true },
    { id: 2, name: 'Write Tests', done: true },
    { id: 3, name: 'Provision with Terraform', done: false }
  ];
  res.json({ items, count: items.length });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
