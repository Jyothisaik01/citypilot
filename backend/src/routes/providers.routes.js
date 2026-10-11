const express = require('express');
const router = express.Router();
const uberProvider = require('../providers/uberProvider');
const rapidoProvider = require('../providers/rapidoProvider');

// POST /api/providers/uber/deeplink
router.post('/uber/deeplink', (req, res) => {
  const { pickup, destination, product } = req.body;
  if (!pickup || !destination) {
    return res.status(400).json({ success: false, error: 'pickup and destination are required' });
  }

  const handoff = uberProvider.getDeepLink({ pickup, destination, product });
  res.json({
    success: true,
    handoff,
  });
});

// POST /api/providers/rapido/deeplink
router.post('/rapido/deeplink', (req, res) => {
  const { pickup, destination, serviceType } = req.body;
  if (!pickup || !destination) {
    return res.status(400).json({ success: false, error: 'pickup and destination are required' });
  }

  const handoff = rapidoProvider.getDeepLink({ pickup, destination, serviceType });
  res.json({
    success: true,
    handoff,
  });
});

module.exports = router;

