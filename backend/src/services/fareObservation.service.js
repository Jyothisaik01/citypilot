/**
 * CityPilot Fare Observation System
 * Records and indexes historical fare data across providers without mislabeling sources
 */

class FareObservationService {
  constructor() {
    this.observations = [];
  }

  recordObservation({
    provider,
    vehicleType,
    city = 'Hyderabad',
    pickup,
    destination,
    distanceKm,
    durationMinutes,
    estimatedFare,
    currency = 'INR',
    source, // 'official_api' | 'official_transit' | 'citypilot_estimate' | 'user_observation'
  }) {
    const validSources = ['official_api', 'official_transit', 'citypilot_estimate', 'user_observation'];
    const safeSource = validSources.includes(source) ? source : 'citypilot_estimate';

    const observation = {
      id: `fare_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      provider: provider || 'Unknown',
      vehicleType: vehicleType || 'cab',
      city,
      pickup: pickup?.name || pickup || 'Origin',
      destination: destination?.name || destination || 'Destination',
      distanceKm: parseFloat(distanceKm || 0),
      durationMinutes: parseInt(durationMinutes || 0, 10),
      estimatedFare: parseFloat(estimatedFare || 0),
      currency,
      source: safeSource,
      capturedAt: new Date().toISOString(),
    };

    this.observations.unshift(observation);
    if (this.observations.length > 500) {
      this.observations.pop();
    }

    return observation;
  }

  getRecentObservations(limit = 20) {
    return this.observations.slice(0, limit);
  }
}

module.exports = new FareObservationService();

