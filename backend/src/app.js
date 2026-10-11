const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth.routes');
const configRoutes = require('./routes/config.routes');
const mobilityRoutes = require('./routes/mobility.routes');
const providerRoutes = require('./routes/providers.routes');
const placesRoutes = require('./routes/places.routes');
const tripsRoutes = require('./routes/trips.routes');
const cityPilotRidesRoutes = require('./routes/citypilot-rides.routes');
const oreoRoutes = require('./routes/oreo.routes');

const app = express();
const server = http.createServer(app);

// Socket.io for real-time navigation updates and live driver tracking
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('⚡ CityPilot Client Connected:', socket.id);

  // Simulation for live turn-by-turn navigation updates
  socket.on('start_navigation_simulation', (data) => {
    let step = 0;
    const interval = setInterval(() => {
      step++;
      socket.emit('navigation_update', {
        step,
        remainingDistanceMeters: Math.max(0, 3200 - step * 350),
        remainingTimeMinutes: Math.max(0, 12 - step),
        instruction: step < 4 ? 'Continue straight towards Raidurg Metro' : 'Arriving at Station in 200m',
      });
      if (step >= 8) clearInterval(interval);
    }, 2000);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${req.method} ${req.url}`);
  next();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/mobility', mobilityRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/citypilot-rides', cityPilotRidesRoutes);
app.use('/api/oreo', oreoRoutes);

// Root healthcheck
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    app: 'CityPilot Mobility Intelligence API',
    version: '1.0.0',
    tagline: 'Find the smartest way there.',
    modesSupported: [
      { mode: 'normal', description: 'Aggregator Mode - Smart Routes with Uber/Rapido deep links & Metro transit' },
      { mode: 'full', description: 'Full Mode - Native CityPilot First-Mile & Direct Ride Booking' },
    ],
    endpoints: [
      '/api/auth/send-otp',
      '/api/auth/verify-otp',
      '/api/auth/login-email',
      '/api/config/features',
      '/api/mobility/routes',
      '/api/mobility/metro/stations',
      '/api/places/search',
      '/api/trips',
    ],
  });
});

module.exports = { app, server, io };
