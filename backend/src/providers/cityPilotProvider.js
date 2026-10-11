const MobilityProvider = require('./mobilityProvider.interface');
const { getFeatures } = require('../config/features');

/**
 * CityPilot Proprietary Ride Network Provider (Mode 2)
 * Active only when ownRideNetworkEnabled === true
 */

class CityPilotProvider extends MobilityProvider {
  constructor() {
    super('CityPilot Rides', 'internal');
  }

  isNetworkActive() {
    return Boolean(getFeatures().ownRideNetworkEnabled);
  }

  getFleetOptions(distanceKm, durationMinutes) {
    const isActive = this.isNetworkActive();

    if (!isActive) {
      return {
        isEnabled: false,
        status: 'COMING_SOON',
        message: 'CityPilot Rides are coming soon. Use Smart Travel with existing providers.',
      };
    }

    // When Mode 2 is enabled, CityPilot provides direct fleet options
    return {
      isEnabled: true,
      status: 'ACTIVE',
      vehicles: [
        {
          id: 'citypilot_bike',
          name: 'CityPilot Bike',
          type: 'bike',
          icon: 'bike',
          basePrice: 18,
          perKm: 5.8,
          fare: Math.round(18 + distanceKm * 5.8),
          etaMinutes: 2,
          etaText: '2 min away',
          driverName: 'Rahul Kumar',
          vehiclePlate: 'TS09 AB 1234',
          rating: 4.8,
          action: 'BOOK_CITYPILOT',
        },
        {
          id: 'citypilot_auto',
          name: 'CityPilot Auto',
          type: 'auto',
          icon: 'auto',
          basePrice: 28,
          perKm: 10.0,
          fare: Math.round(28 + distanceKm * 10.0),
          etaMinutes: 4,
          etaText: '4 min away',
          driverName: 'Syed Imran',
          vehiclePlate: 'TS10 UA 5678',
          rating: 4.9,
          action: 'BOOK_CITYPILOT',
        },
        {
          id: 'citypilot_cab',
          name: 'CityPilot Cab',
          type: 'cab',
          icon: 'car',
          basePrice: 48,
          perKm: 13.5,
          fare: Math.round(48 + distanceKm * 13.5),
          etaMinutes: 5,
          etaText: '5 min away',
          driverName: 'K. Venkatesh',
          vehiclePlate: 'TS07 EX 9012',
          rating: 4.85,
          action: 'BOOK_CITYPILOT',
        },
      ],
    };
  }
}

module.exports = new CityPilotProvider();

