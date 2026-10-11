const express = require('express');
const router = express.Router();
const tripsService = require('../services/trips.service');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'citypilot_secret_token_dev_2026';

// Helper to extract user identification from token or query
const extractUser = (req) => {
  let userId = req.query.userId;
  let phone = req.query.phone;
  let email = req.query.email;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
      if (decoded && decoded.id) {
        userId = userId || decoded.id;
      }
    } catch (e) {}
  }
  return { userId, phone, email };
};

// GET /api/trips
router.get('/', async (req, res) => {
  try {
    const userParams = extractUser(req);
    const trips = await tripsService.getRecentTrips(userParams);
    res.json({
      success: true,
      trips,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/trips/stats
router.get('/stats', async (req, res) => {
  try {
    const userParams = extractUser(req);
    const stats = await tripsService.getUserStats(userParams);
    res.json({
      success: true,
      stats,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/trips/:id
router.get('/:id', async (req, res) => {
  try {
    const trip = await tripsService.getTripById(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }
    res.json({ success: true, trip });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/trips
router.post('/', async (req, res) => {
  try {
    const newTrip = await tripsService.createTrip(req.body);
    res.json({ success: true, trip: newTrip });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/trips/:id/complete
router.post('/:id/complete', async (req, res) => {
  try {
    const rating = req.body.rating || 5;
    const completed = await tripsService.completeTrip(req.params.id, rating);
    if (!completed) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }
    res.json({ success: true, trip: completed });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
