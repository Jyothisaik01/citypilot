const express = require('express');
const router = express.Router();
const { getFeatures, updateFeatures } = require('../config/features');
const { RANKING_PROFILES } = require('../config/rankingWeights');

// GET /api/config/features
router.get('/features', (req, res) => {
  res.json({
    success: true,
    features: getFeatures(),
  });
});

// POST /api/config/features (For mode switching & testing)
router.post('/features', (req, res) => {
  const updated = updateFeatures(req.body);
  res.json({
    success: true,
    message: 'Features updated successfully',
    features: updated,
  });
});

// GET /api/config/ranking-weights
router.get('/ranking-weights', (req, res) => {
  res.json({
    success: true,
    profiles: RANKING_PROFILES,
  });
});

module.exports = router;

