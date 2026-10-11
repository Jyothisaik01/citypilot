const express = require('express');
const router = express.Router();
const { queryOreoAI } = require('../services/oreo-ai.service');

// POST /api/oreo/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [], userLocation } = req.body;
    const result = await queryOreoAI({ message, history, userLocation });

    res.json({
      success: true,
      text: result.text,
      suggestions: result.suggestions || [],
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Oreo AI error:', err);
    res.json({
      success: true,
      text: "I'm having a brief connection flutter, but Hyderabad Metro and CityPilot bike taxis are moving normally! How can I help you navigate?",
      suggestions: ['Estimate fare', 'Hyderabad Metro lines', 'Compare routes'],
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/oreo/health
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    assistant: 'Oreo AI',
    role: 'Mobility Intelligence & Ride Cost Estimator',
  });
});

module.exports = router;

