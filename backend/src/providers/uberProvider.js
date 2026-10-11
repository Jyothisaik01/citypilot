const MobilityProvider = require('./mobilityProvider.interface');

/**
 * Uber Official Ride Handoff & Deep Linking Provider
 * Reference: https://developer.uber.com/docs/riders/ride-requests/tutorials/deep-links/introduction
 */

class UberProvider extends MobilityProvider {
  constructor() {
    super('Uber', 'ride_hailing');
    this.clientId = process.env.UBER_CLIENT_ID || 'CityPilot-Transit-V1';
  }

  /**
   * Generates official Universal & Native App Deep Link into Uber Ride Flow
   */
  getDeepLink({ pickup, destination, product = 'UberGo' }) {
    if (!pickup || !destination) return 'https://m.uber.com';

    const pLat = pickup.lat || pickup.latitude;
    const pLng = pickup.lng || pickup.longitude;
    const pName = encodeURIComponent(pickup.name || 'Current Location');

    const dLat = destination.lat || destination.latitude;
    const dLng = destination.lng || destination.longitude;
    const dName = encodeURIComponent(destination.name || 'Destination');

    // Official Universal Web / App deep link that opens Uber app directly if installed,
    // or falls back smoothly to Uber mobile web ride experience
    const universalLink = `https://m.uber.com/ul/?action=setPickup&client_id=${encodeURIComponent(
      this.clientId
    )}&pickup[latitude]=${pLat}&pickup[longitude]=${pLng}&pickup[nickname]=${pName}&dropoff[latitude]=${dLat}&dropoff[longitude]=${dLng}&dropoff[nickname]=${dName}`;

    // Native app scheme deep link
    const nativeScheme = `uber://?action=setPickup&pickup[latitude]=${pLat}&pickup[longitude]=${pLng}&pickup[nickname]=${pName}&dropoff[latitude]=${dLat}&dropoff[longitude]=${dLng}&dropoff[nickname]=${dName}`;

    return {
      universalLink,
      nativeScheme,
      provider: 'Uber',
      displayName: 'Open in Uber',
      pickupName: pickup.name || 'Current Location',
      destinationName: destination.name || 'Destination',
    };
  }

  /**
   * Model estimate for local Hyderabad market (Cab / Auto / Moto)
   * Labeled strictly as 'CITYPILOT_ESTIMATE' (unless live authorized partner API is connected)
   */
  getFareEstimate(distanceKm, durationMinutes, vehicleType = 'cab') {
    const safeDist = Math.max(1, distanceKm || 1);
    const safeTime = Math.max(3, durationMinutes || 5);

    let baseFare = 50;
    let perKm = 14;
    let perMin = 1.5;
    let label = 'UberGo / Premier';

    if (vehicleType === 'bike') {
      baseFare = 20;
      perKm = 6.5;
      perMin = 0.8;
      label = 'Uber Moto';
    } else if (vehicleType === 'auto') {
      baseFare = 30;
      perKm = 11;
      perMin = 1.0;
      label = 'Uber Auto';
    }

    const calculatedFare = Math.round(baseFare + safeDist * perKm + safeTime * perMin);
    const low = Math.round(calculatedFare * 0.95);
    const high = Math.round(calculatedFare * 1.15);

    return {
      provider: 'Uber',
      serviceName: label,
      estimatedFare: calculatedFare,
      fareRange: `₹${low}–₹${high}`,
      currency: 'INR',
      fareType: 'CITYPILOT_ESTIMATE',
      disclaimer: 'Estimated fare — Live pricing and availability will be shown in Uber app.',
    };
  }
}

module.exports = new UberProvider();

