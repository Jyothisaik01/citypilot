const MobilityProvider = require('./mobilityProvider.interface');

/**
 * Rapido Ride Handoff & App Linking Provider
 */

class RapidoProvider extends MobilityProvider {
  constructor() {
    super('Rapido', 'ride_hailing');
  }

  getDeepLink({ pickup, destination, serviceType = 'bike' }) {
    if (!pickup || !destination) return 'https://www.rapido.bike';

    const pLat = pickup.lat || pickup.latitude;
    const pLng = pickup.lng || pickup.longitude;
    const dLat = destination.lat || destination.latitude;
    const dLng = destination.lng || destination.longitude;

    const nativeScheme = `rapido://ride?pickup_lat=${pLat}&pickup_lng=${pLng}&drop_lat=${dLat}&drop_lng=${dLng}&service=${serviceType}`;
    const universalLink = `https://m.rapido.bike/booking?pickup_lat=${pLat}&pickup_lng=${pLng}&drop_lat=${dLat}&drop_lng=${dLng}`;

    return {
      universalLink,
      nativeScheme,
      provider: 'Rapido',
      displayName: 'Open Rapido',
      pickupName: pickup.name || 'Current Location',
      destinationName: destination.name || 'Destination',
    };
  }

  getFareEstimate(distanceKm, durationMinutes, vehicleType = 'bike') {
    const safeDist = Math.max(1, distanceKm || 1);
    const safeTime = Math.max(3, durationMinutes || 5);

    let baseFare = 15;
    let perKm = 6;
    let label = 'Rapido Bike';

    if (vehicleType === 'auto') {
      baseFare = 28;
      perKm = 10.5;
      label = 'Rapido Auto';
    } else if (vehicleType === 'cab') {
      baseFare = 45;
      perKm = 13;
      label = 'Rapido Cab';
    }

    const calculatedFare = Math.round(baseFare + safeDist * perKm + safeTime * 0.7);
    const low = Math.round(calculatedFare * 0.9);
    const high = Math.round(calculatedFare * 1.15);

    return {
      provider: 'Rapido',
      serviceName: label,
      estimatedFare: calculatedFare,
      fareRange: `₹${low}–₹${high}`,
      currency: 'INR',
      fareType: 'CITYPILOT_ESTIMATE',
      disclaimer: 'Estimated fare — Live pricing and availability will be shown in Rapido app.',
    };
  }
}

module.exports = new RapidoProvider();

