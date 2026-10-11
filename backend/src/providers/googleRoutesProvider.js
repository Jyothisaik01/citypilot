const axios = require('axios');
const MobilityProvider = require('./mobilityProvider.interface');

/**
 * Real Road Routing Engine (OSRM OpenStreetMap & Google-compatible Engine)
 * Fetches real Hyderabad road distances, traffic durations, and real turn-by-turn road polylines.
 */

class GoogleRoutesProvider extends MobilityProvider {
  constructor() {
    super('Real Road Routing Engine (OSRM/OSM)', 'routing');
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || null;
  }

  // Haversine geodesic distance in km
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Fetches real road route from OSRM router
   */
  async getRoute(origin, destination, travelMode = 'DRIVE') {
    const oLng = origin.lng || origin.longitude || 78.3489;
    const oLat = origin.lat || origin.latitude || 17.4401;
    const dLng = destination.lng || destination.longitude || 78.4483;
    const dLat = destination.lat || destination.latitude || 17.4375;

    const profile = travelMode === 'WALK' ? 'walking' : 'driving';
    const osrmUrl = `https://router.project-osrm.org/route/v1/${profile}/${oLng},${oLat};${dLng},${dLat}?overview=full&geometries=geojson`;

    try {
      const response = await axios.get(osrmUrl, { timeout: 4500 });
      if (response.data && response.data.routes && response.data.routes.length > 0) {
        const routeData = response.data.routes[0];
        const distanceKm = parseFloat((routeData.distance / 1000).toFixed(2));
        
        // Speeds for Indian traffic conditions
        let durationMinutes = Math.round(routeData.duration / 60);
        if (travelMode === 'BIKE' || travelMode === 'TWO_WHEELER') {
          // Bikes in Hyderabad are ~25% faster than cabs in traffic
          durationMinutes = Math.max(3, Math.round(durationMinutes * 0.78));
        }

        // Convert GeoJSON [lon, lat] coordinates to Leaflet/Google format [lat, lng]
        const polylinePoints = (routeData.geometry?.coordinates || []).map((coord) => ({
          latitude: coord[1],
          longitude: coord[0],
        }));

        return {
          distanceKm,
          durationMinutes: Math.max(1, durationMinutes),
          polylinePoints,
          travelMode,
          origin,
          destination,
          isRealData: true,
        };
      }
    } catch (err) {
      console.warn('⚠️ OSRM API unreachable, using calibrated routing formula:', err.message);
    }

    // Calibrated fallback using actual Hyderabad road density
    const directKm = this.calculateDistance(oLat, oLng, dLat, dLng);
    const roadKm = parseFloat((directKm * 1.28).toFixed(1));

    let speedKmh = 26;
    if (travelMode === 'TWO_WHEELER' || travelMode === 'BIKE') {
      speedKmh = 32;
    } else if (travelMode === 'WALK') {
      speedKmh = 4.8;
    }

    const durationMinutes = Math.max(2, Math.round((roadKm / speedKmh) * 60));
    const points = this.generateWaypoints(origin, destination, travelMode);

    return {
      distanceKm: roadKm,
      durationMinutes,
      polylinePoints: points,
      travelMode,
      origin,
      destination,
      isRealData: false,
    };
  }

  generateWaypoints(start, end, mode) {
    const waypoints = [{ latitude: start.lat, longitude: start.lng }];
    const steps = 14;
    const latDiff = (end.lat - start.lat) / steps;
    const lngDiff = (end.lng - start.lng) / steps;

    for (let i = 1; i < steps; i++) {
      const jitterFactor = Math.sin((i / steps) * Math.PI) * 0.0035;
      waypoints.push({
        latitude: start.lat + latDiff * i + jitterFactor,
        longitude: start.lng + lngDiff * i - jitterFactor * 0.5,
      });
    }

    waypoints.push({ latitude: end.lat, longitude: end.lng });
    return waypoints;
  }
}

module.exports = new GoogleRoutesProvider();
