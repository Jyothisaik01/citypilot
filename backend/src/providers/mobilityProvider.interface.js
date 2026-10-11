/**
 * Mobility Provider Interface Definition
 */

class MobilityProvider {
  constructor(name, type) {
    this.name = name;
    this.type = type; // 'transit' | 'ride_hailing' | 'micromobility' | 'internal'
  }

  async getRoute(origin, destination, options = {}) {
    throw new Error('Method getRoute() must be implemented');
  }

  async getFare(origin, destination, distanceKm, durationMinutes) {
    throw new Error('Method getFare() must be implemented');
  }

  async getAvailability(origin) {
    throw new Error('Method getAvailability() must be implemented');
  }

  async getDeepLink(params) {
    return null;
  }
}

module.exports = MobilityProvider;

