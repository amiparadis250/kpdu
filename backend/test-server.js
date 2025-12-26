const express = require('express');
const cors = require('cors');
const votingRoutes = require('./src/routes/voting');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', blockchain: 'connected' });
});

// Blockchain routes
app.use('/api/blockchain', votingRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Blockchain API server running on port ${PORT}`);
  console.log(`🔗 Test endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/blockchain/register`);
  console.log(`   GET  http://localhost:${PORT}/api/blockchain/verify/:memberId`);
  console.log(`   POST http://localhost:${PORT}/api/blockchain/vote`);
  console.log(`   GET  http://localhost:${PORT}/api/blockchain/results/:positionId`);
});