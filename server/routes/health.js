import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(200).json({
    status: 'ok',
    service: 'Smart College Complaint System API',
    institution: 'Soch College of IT, Pokhara',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbStatusMap[dbState] || 'unknown',
  });
});

export default router;
