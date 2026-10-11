const express = require('express');
const router = express.Router();
const placesService = require('../services/places.service');

// GET /api/places/search?q=
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const results = await placesService.searchPlaces(query);
    res.json({
      success: true,
      results,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, results: [] });
  }
});

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'citypilot_secret_token_dev_2026';

const extractUser = (req) => {
  const auth = req.headers.authorization;
  let userId = req.query.userId || req.body?.userId;
  let phone = req.query.phone || req.body?.userPhone || req.body?.phone;
  let email = req.query.email || req.body?.userEmail || req.body?.email;

  if (auth && auth.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
      if (decoded && decoded.id) {
        userId = userId || decoded.id;
      }
    } catch (e) {}
  }
  return { userId, phone, email };
};

// GET /api/places/saved (User-Scoped from MongoDB)
router.get('/saved', async (req, res) => {
  try {
    const user = extractUser(req);
    const savedPlaces = await placesService.getSavedPlaces(user);
    res.json({
      success: true,
      savedPlaces,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, savedPlaces: [] });
  }
});

// POST /api/places/saved (Add Favorite Bound to User in MongoDB)
router.post('/saved', async (req, res) => {
  try {
    const user = extractUser(req);
    const payload = {
      ...req.body,
      userId: req.body.userId || user.userId,
      userPhone: req.body.userPhone || user.phone,
      userEmail: req.body.userEmail || user.email,
    };
    const created = await placesService.addSavedPlace(payload);
    res.json({
      success: true,
      place: created,
      message: 'Saved place added successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/places/saved/:id (Remove Favorite Place)
router.delete('/saved/:id', async (req, res) => {
  try {
    const user = extractUser(req);
    await placesService.removeSavedPlace(req.params.id, user);
    res.json({
      success: true,
      message: 'Saved place removed successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/places/recent
router.get('/recent', (req, res) => {
  res.json({
    success: true,
    recentSearches: placesService.getRecentSearches(),
  });
});

// POST /api/places/recent
router.post('/recent', (req, res) => {
  const updated = placesService.addRecentSearch(req.body);
  res.json({
    success: true,
    recentSearches: updated,
  });
});

module.exports = router;

