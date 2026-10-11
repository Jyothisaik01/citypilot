require('dotenv').config();
const { server } = require('./src/app');
const { connectDB, LOCAL_MONGO_URI } = require('./src/config/db');

const PORT = process.env.PORT || 5050;

async function startServer() {
  // Connect to MongoDB (local database: citypilot)
  await connectDB();
  const { seedInitialData } = require('./src/config/seed');
  await seedInitialData();

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`===============================================`);
    console.log(`🚀 CityPilot Mobility Backend running on port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`💾 Database: ${LOCAL_MONGO_URI}`);
    console.log(`🗺️ Healthcheck: http://localhost:${PORT}/api/config/features`);
    console.log(`🔐 Auth: http://localhost:${PORT}/api/auth/send-otp`);
    console.log(`===============================================`);
  });
}

startServer();
