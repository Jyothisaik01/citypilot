const express = require('express');
const router = express.Router();
const mobilityIntelligence = require('../mobility/mobility-intelligence.service');
const metroProvider = require('../providers/metroProvider');
const fareObservationService = require('../services/fareObservation.service');

// POST /api/mobility/routes - Core Mobility Intelligence Endpoint
router.post('/routes', async (req, res) => {
  try {
    const { origin, destination, preference, mode, maxWalkingKm } = req.body;
    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        error: 'origin and destination objects are required',
      });
    }

    const result = await mobilityIntelligence.calculateBestRoutes(
      origin,
      destination,
      preference || 'balanced',
      mode || 'normal',
      parseFloat(maxWalkingKm) || 6.0
    );

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error calculating multimodal routes:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unable to calculate routes at this moment',
    });
  }
});

// GET /api/mobility/metro/stations - All Hyderabad Metro Stations
router.get('/metro/stations', (req, res) => {
  res.json({
    success: true,
    stations: metroProvider.getAllStations(),
  });
});

// GET /api/mobility/metro/journey - Calculate dedicated metro segment
router.get('/metro/journey', (req, res) => {
  const { originId, destId } = req.query;
  const all = metroProvider.getAllStations();
  const originStation = all.find((s) => s.id === originId);
  const destStation = all.find((s) => s.id === destId);

  if (!originStation || !destStation) {
    return res.status(404).json({ success: false, error: 'Stations not found' });
  }

  const journey = metroProvider.calculateMetroJourney(originStation, destStation);
  res.json({ success: true, journey });
});

// POST /api/mobility/fare-observation
router.post('/fare-observation', (req, res) => {
  try {
    const observation = fareObservationService.recordObservation(req.body);
    res.json({ success: true, observation });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/mobility/fare-observation/recent
router.get('/fare-observation/recent', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 20;
  res.json({
    success: true,
    observations: fareObservationService.getRecentObservations(limit),
  });
});

module.exports = router;

