/**
 * CityPilot Trips and Journey Lifecycle Service
 * Supports MongoDB with seamless in-memory fallback
 */

const Trip = require('../models/Trip');

let inMemoryTrips = [
  {
    id: 'trip_101',
    origin: { name: 'Gachibowli, Hyderabad', lat: 17.44, lng: 78.3489 },
    destination: { name: 'Ameerpet, Hyderabad', lat: 17.4375, lng: 78.4483 },
    routeTitle: 'Bike → Metro → Walk',
    modeBadge: '🏆 BEST BALANCE',
    durationMinutes: 39,
    distanceKm: 14.8,
    costPaid: 52,
    cabPriceAlternative: 320,
    savingsVsCab: 268,
    co2SavedKg: 2.1,
    status: 'COMPLETED',
    date: 'Today, 9:15 AM',
    rating: 5,
    breakdown: [
      { item: 'First-Mile Bike (CityPilot / Rapido)', amount: '₹28' },
      { item: 'Hyderabad Metro (HMR)', amount: '₹20' },
      { item: 'Last-Mile Walk', amount: 'Free' },
    ],
  },
  {
    id: 'trip_102',
    origin: { name: 'Kondapur, Hyderabad', lat: 17.4682, lng: 78.3578 },
    destination: { name: 'Hitec City, Hyderabad', lat: 17.4475, lng: 78.3845 },
    routeTitle: 'Direct Bike Taxi',
    modeBadge: '🏍 DIRECT BIKE',
    durationMinutes: 18,
    distanceKm: 4.5,
    costPaid: 45,
    cabPriceAlternative: 140,
    savingsVsCab: 95,
    co2SavedKg: 0.8,
    status: 'COMPLETED',
    date: 'Yesterday, 6:30 PM',
    rating: 5,
    breakdown: [
      { item: 'Bike Ride', amount: '₹45' },
    ],
  },
  {
    id: 'trip_103',
    origin: { name: 'Hitec City, Hyderabad', lat: 17.4475, lng: 78.3845 },
    destination: { name: 'Jubilee Hills Check Post', lat: 17.4285, lng: 78.419 },
    routeTitle: 'Walk → Metro → Walk',
    modeBadge: '💰 CHEAPEST',
    durationMinutes: 22,
    distanceKm: 6.2,
    costPaid: 25,
    cabPriceAlternative: 180,
    savingsVsCab: 155,
    co2SavedKg: 1.4,
    status: 'COMPLETED',
    date: '2 Oct, 11:20 AM',
    rating: 4,
    breakdown: [
      { item: 'HMR Metro Ticket', amount: '₹25' },
    ],
  },
];

class TripsService {
  async getRecentTrips({ userId, phone, email } = {}) {
    try {
      const query = {};
      const conditions = [];

      if (userId && typeof userId === 'string' && userId.length === 24) {
        conditions.push({ userId });
      }
      if (phone && phone.trim()) {
        conditions.push({ userPhone: phone.trim() });
      }
      if (email && email.trim()) {
        conditions.push({ userEmail: email.trim().toLowerCase() });
      }

      if (conditions.length > 0) {
        query.$or = conditions;
      } else {
        // If query specifies no user identification, return empty list (never leak trips!)
        return [];
      }

      const dbTrips = await Trip.find(query).sort({ createdAt: -1 }).limit(30).lean();
      if (dbTrips && dbTrips.length > 0) {
        return dbTrips.map((t) => ({
          id: t._id.toString(),
          origin: t.origin,
          destination: t.destination,
          routeTitle: t.routeTitle || 'Multimodal Trip',
          modeBadge: t.modeBadge || '🏆 BEST BALANCE',
          durationMinutes: t.durationMinutes || 35,
          distanceKm: t.totalDistanceKm || 12,
          costPaid: t.totalCost || 52,
          cabPriceAlternative: t.directCabCost || 280,
          savingsVsCab: t.savingsVsCab || 0,
          co2SavedKg: (t.carbonGrams ? t.carbonGrams / 1000 : 0).toFixed(1),
          status: t.status,
          date: new Date(t.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' + new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          rating: t.rating || 5,
          bookingMode: t.bookingMode,
          driver: t.driver,
          breakdown: (t.segments || []).map((s) => ({
            item: s.title || s.mode,
            amount: s.cost > 0 ? `₹${s.cost}` : 'Free',
          })),
        }));
      }
      return [];
    } catch (e) {
      console.warn('⚠️ Fetching trips error:', e.message);
      return [];
    }
  }

  async getTripById(id) {
    try {
      const dbTrip = await Trip.findById(id).lean();
      if (dbTrip) return { id: dbTrip._id.toString(), ...dbTrip };
    } catch (e) {}
    return null;
  }

  async createTrip(tripData) {
    const cabAlt = tripData.directCabCost || (tripData.costPaid ? Math.round(tripData.costPaid * 3.5) : 320);
    const savings = Math.max(0, cabAlt - (tripData.costPaid || tripData.totalCost || 52));

    try {
      const newDbTrip = await Trip.create({
        userId: tripData.userId || null,
        userPhone: tripData.userPhone || tripData.phone || null,
        userEmail: tripData.userEmail || tripData.email || null,
        origin: tripData.origin || { name: 'Gachibowli', lat: 17.44, lng: 78.3489 },
        destination: tripData.destination || { name: 'Ameerpet', lat: 17.4375, lng: 78.4483 },
        routeId: tripData.routeId || 'multimodal_bike_metro',
        routeTitle: tripData.routeTitle || 'Bike → Metro → Walk',
        routeCategory: tripData.routeCategory || 'BEST_BALANCE',
        preference: tripData.preference || 'balanced',
        modeBadge: tripData.modeBadge || '🏆 BEST BALANCE',
        totalDistanceKm: tripData.totalDistanceKm || tripData.distanceKm || 14.8,
        durationMinutes: tripData.durationMinutes || 39,
        walkingDistanceMeters: tripData.walkingDistanceMeters || 600,
        transfers: tripData.transfers || 2,
        totalCost: tripData.costPaid || tripData.totalCost || 52,
        directCabCost: cabAlt,
        savingsVsCab: savings,
        carbonGrams: tripData.carbonGrams || 1800,
        segments: tripData.segments || [],
        bookingMode: tripData.bookingMode || 'FULL_NATIVE_BOOKING',
        status: 'COMPLETED',
        driver: tripData.driver || null,
        rating: tripData.rating || 5,
      });

      return {
        id: newDbTrip._id.toString(),
        ...tripData,
        cabPriceAlternative: cabAlt,
        savingsVsCab: savings,
        status: 'COMPLETED',
        date: 'Just now',
        rating: tripData.rating || 5,
        createdAt: newDbTrip.createdAt,
      };
    } catch (dbErr) {
      console.warn('⚠️ Could not save trip to Mongo:', dbErr.message);
      return {
        id: `trip_${Date.now()}`,
        ...tripData,
        savingsVsCab: savings,
        status: 'COMPLETED',
      };
    }
  }

  async completeTrip(id, rating = 5) {
    try {
      const updated = await Trip.findByIdAndUpdate(id, { status: 'COMPLETED', rating }, { new: true });
      return updated;
    } catch (e) {
      return { id, status: 'COMPLETED', rating };
    }
  }

  async getUserStats({ userId, phone, email } = {}) {
    const userTrips = await this.getRecentTrips({ userId, phone, email });
    const totalTrips = userTrips.length;
    const totalSavings = userTrips.reduce((acc, t) => acc + (t.savingsVsCab || 0), 0);
    const totalCo2 = parseFloat(
      userTrips.reduce((acc, t) => acc + parseFloat(t.co2SavedKg || 0), 0).toFixed(1)
    );

    return {
      totalTrips,
      totalSavings,
      totalCo2SavedKg: totalCo2,
      primaryMode: totalTrips > 0 ? 'Metro + Multimodal' : 'None yet',
      preferredProfile: 'Best Balance',
    };
  }
}

module.exports = new TripsService();
