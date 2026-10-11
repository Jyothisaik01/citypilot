const MobilityProvider = require('./mobilityProvider.interface');

/**
 * Hyderabad Metro Official Data & Routing Provider
 */

const HYDERABAD_METRO_STATIONS = [
  // BLUE LINE (Raidurg <-> Nagole)
  { id: 'raidurg', name: 'Raidurg', line: 'Blue', lat: 17.4428, lng: 78.3772, order: 1 },
  { id: 'hitec_city', name: 'Hitec City', line: 'Blue', lat: 17.4475, lng: 78.3845, order: 2 },
  { id: 'durgam_cheruvu', name: 'Durgam Cheruvu', line: 'Blue', lat: 17.4412, lng: 78.3912, order: 3 },
  { id: 'madhapur', name: 'Madhapur', line: 'Blue', lat: 17.4385, lng: 78.3995, order: 4 },
  { id: 'peddamma_gudi', name: 'Peddamma Gudi', line: 'Blue', lat: 17.4312, lng: 78.4110, order: 5 },
  { id: 'jubilee_hills', name: 'Jubilee Hills Check Post', line: 'Blue', lat: 17.4285, lng: 78.4190, order: 6 },
  { id: 'road_no_5', name: 'Road No 5 Jubilee Hills', line: 'Blue', lat: 17.4320, lng: 78.4280, order: 7 },
  { id: 'yousufguda', name: 'Yousufguda', line: 'Blue', lat: 17.4360, lng: 78.4380, order: 8 },
  { id: 'madhura_nagar', name: 'Madhura Nagar', line: 'Blue', lat: 17.4370, lng: 78.4440, order: 9 },
  { id: 'ameerpet', name: 'Ameerpet', line: 'Interchange', lat: 17.4375, lng: 78.4483, order: 10, isInterchange: true },
  { id: 'begumpet', name: 'Begumpet', line: 'Blue', lat: 17.4440, lng: 78.4600, order: 11 },
  { id: 'prakash_nagar', name: 'Prakash Nagar', line: 'Blue', lat: 17.4445, lng: 78.4710, order: 12 },
  { id: 'rasoolpura', name: 'Rasoolpura', line: 'Blue', lat: 17.4420, lng: 78.4810, order: 13 },
  { id: 'paradise', name: 'Paradise', line: 'Interchange', lat: 17.4435, lng: 78.4900, order: 14, isInterchange: true },
  { id: 'parade_ground', name: 'Parade Ground', line: 'Interchange', lat: 17.4440, lng: 78.4990, order: 15, isInterchange: true },
  { id: 'secunderabad_east', name: 'Secunderabad East', line: 'Blue', lat: 17.4380, lng: 78.5060, order: 16 },
  { id: 'mettuguda', name: 'Mettuguda', line: 'Blue', lat: 17.4320, lng: 78.5180, order: 17 },
  { id: 'tarnaka', name: 'Tarnaka', line: 'Blue', lat: 17.4280, lng: 78.5300, order: 18 },
  { id: 'habsiguda', name: 'Habsiguda', line: 'Blue', lat: 17.4190, lng: 78.5420, order: 19 },
  { id: 'ngri', name: 'NGRI', line: 'Blue', lat: 17.4110, lng: 78.5520, order: 20 },
  { id: 'stadium', name: 'Stadium', line: 'Blue', lat: 17.4050, lng: 78.5590, order: 21 },
  { id: 'uppal', name: 'Uppal', line: 'Blue', lat: 17.3990, lng: 78.5620, order: 22 },
  { id: 'nagole', name: 'Nagole', line: 'Blue', lat: 17.3910, lng: 78.5650, order: 23 },

  // RED LINE (Miyapur <-> LB Nagar)
  { id: 'miyapur', name: 'Miyapur', line: 'Red', lat: 17.4965, lng: 78.3610, order: 1 },
  { id: 'jntu', name: 'JNTU College', line: 'Red', lat: 17.4920, lng: 78.3880, order: 2 },
  { id: 'kphb_colony', name: 'KPHB Colony', line: 'Red', lat: 17.4870, lng: 78.4010, order: 3 },
  { id: 'kukatpally', name: 'Kukatpally', line: 'Red', lat: 17.4810, lng: 78.4110, order: 4 },
  { id: 'bharat_nagar', name: 'Bharat Nagar', line: 'Red', lat: 17.4650, lng: 78.4280, order: 5 },
  { id: 'erragadda', name: 'Erragadda', line: 'Red', lat: 17.4560, lng: 78.4360, order: 6 },
  { id: 'esi_hospital', name: 'ESI Hospital', line: 'Red', lat: 17.4490, lng: 78.4420, order: 7 },
  { id: 'sr_nagar', name: 'S.R. Nagar', line: 'Red', lat: 17.4430, lng: 78.4450, order: 8 },
  // ameerpet is interchange
  { id: 'punjagutta', name: 'Punjagutta', line: 'Red', lat: 17.4260, lng: 78.4520, order: 11 },
  { id: 'irrum_manzil', name: 'Irrum Manzil', line: 'Red', lat: 17.4180, lng: 78.4580, order: 12 },
  { id: 'khairatabad', name: 'Khairatabad', line: 'Red', lat: 17.4110, lng: 78.4620, order: 13 },
  { id: 'lakdikapul', name: 'Lakdi-ka-pul', line: 'Red', lat: 17.4040, lng: 78.4660, order: 14 },
  { id: 'assembly', name: 'Assembly', line: 'Red', lat: 17.3990, lng: 78.4710, order: 15 },
  { id: 'nampally', name: 'Nampally', line: 'Red', lat: 17.3920, lng: 78.4730, order: 16 },
  { id: 'gandhi_bhavan', name: 'Gandhi Bhavan', line: 'Red', lat: 17.3870, lng: 78.4760, order: 17 },
  { id: 'mgbs', name: 'MGBS', line: 'Interchange', lat: 17.3780, lng: 78.4820, order: 18, isInterchange: true },
  { id: 'malakpet', name: 'Malakpet', line: 'Red', lat: 17.3720, lng: 78.4980, order: 19 },
  { id: 'new_market', name: 'New Market', line: 'Red', lat: 17.3680, lng: 78.5080, order: 20 },
  { id: 'musarambagh', name: 'Musarambagh', line: 'Red', lat: 17.3640, lng: 78.5170, order: 21 },
  { id: 'dilsukhnagar', name: 'Dilsukhnagar', line: 'Red', lat: 17.3680, lng: 78.5270, order: 22 },
  { id: 'chaitanyapuri', name: 'Chaitanyapuri', line: 'Red', lat: 17.3620, lng: 78.5380, order: 23 },
  { id: 'victoria_memorial', name: 'Victoria Memorial', line: 'Red', lat: 17.3570, lng: 78.5470, order: 24 },
  { id: 'lb_nagar', name: 'LB Nagar', line: 'Red', lat: 17.3480, lng: 78.5530, order: 25 },
];

class MetroProvider extends MobilityProvider {
  constructor() {
    super('Hyderabad Metro Rail (HMR)', 'transit');
  }

  // Calculate distance in km between two lat/lng coords (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
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

  findNearestStation(lat, lng) {
    let nearest = null;
    let minDistance = Infinity;

    for (const station of HYDERABAD_METRO_STATIONS) {
      const dist = this.calculateDistance(lat, lng, station.lat, station.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = { ...station, distanceKm: parseFloat(dist.toFixed(2)) };
      }
    }
    return nearest;
  }

  getOfficialFare(distanceKm) {
    if (distanceKm <= 2) return 10;
    if (distanceKm <= 4) return 15;
    if (distanceKm <= 6) return 25;
    if (distanceKm <= 9) return 30;
    if (distanceKm <= 12) return 35;
    if (distanceKm <= 15) return 40;
    if (distanceKm <= 18) return 45;
    if (distanceKm <= 21) return 50;
    if (distanceKm <= 26) return 55;
    return 60;
  }

  calculateMetroJourney(originStation, destStation) {
    if (!originStation || !destStation) return null;
    if (originStation.id === destStation.id) return null;

    // Direct line journey
    const isSameLine =
      originStation.line === destStation.line ||
      originStation.line === 'Interchange' ||
      destStation.line === 'Interchange';

    const distanceKm = parseFloat(
      this.calculateDistance(
        originStation.lat,
        originStation.lng,
        destStation.lat,
        destStation.lng
      ).toFixed(1)
    );

    // Approximate stops based on order difference
    let stopCount = Math.abs(originStation.order - destStation.order);
    if (!isSameLine) {
      // Transfer through Ameerpet
      const ameerpet = HYDERABAD_METRO_STATIONS.find((s) => s.id === 'ameerpet');
      const stops1 = Math.abs(originStation.order - ameerpet.order);
      const stops2 = Math.abs(destStation.order - ameerpet.order);
      stopCount = stops1 + stops2;
    }

    if (stopCount === 0) stopCount = 1;

    // Average travel time: ~2.5 mins per stop + 2 mins wait/boarding
    const durationMinutes = Math.round(stopCount * 2.5 + (isSameLine ? 3 : 8));
    const fare = this.getOfficialFare(distanceKm * 1.2); // accounting for track curve

    return {
      provider: 'Hyderabad Metro',
      originStation,
      destStation,
      line: isSameLine ? originStation.line : 'Blue & Red (Via Ameerpet)',
      stopCount,
      durationMinutes,
      distanceKm,
      officialFare: fare,
      fareType: 'OFFICIAL_TRANSIT_FARE',
      firstTrain: '05:30 AM',
      lastTrain: '11:00 PM',
      frequencyMinutes: '3-5 min peak / 6-8 min regular',
      status: 'Normal Service',
      stationsList: this.getIntermediateStations(originStation, destStation),
    };
  }

  getIntermediateStations(originStation, destStation) {
    if (!originStation || !destStation) return [];

    // Check Blue line (Raidurg <-> Nagole)
    const isBothOnBlue =
      (originStation.line === 'Blue' || originStation.isInterchange) &&
      (destStation.line === 'Blue' || destStation.isInterchange);

    // Check Red line (Miyapur <-> LB Nagar)
    const isBothOnRed =
      (originStation.line === 'Red' || originStation.isInterchange) &&
      (destStation.line === 'Red' || destStation.isInterchange);

    if (isBothOnBlue) {
      const blueStations = HYDERABAD_METRO_STATIONS.filter(
        (s) => s.line === 'Blue' || (s.isInterchange && s.order <= 23)
      ).sort((a, b) => a.order - b.order);

      const startIdx = blueStations.findIndex((s) => s.id === originStation.id);
      const endIdx = blueStations.findIndex((s) => s.id === destStation.id);

      if (startIdx !== -1 && endIdx !== -1) {
        const step = startIdx < endIdx ? 1 : -1;
        const result = [];
        for (let i = startIdx; i !== endIdx + step; i += step) {
          result.push({
            ...blueStations[i],
            activeLine: 'Blue',
            lineColor: '#0284C7',
          });
        }
        return result;
      }
    }

    if (isBothOnRed) {
      const redStations = HYDERABAD_METRO_STATIONS.filter(
        (s) => s.line === 'Red' || s.isInterchange
      ).sort((a, b) => a.order - b.order);

      const startIdx = redStations.findIndex((s) => s.id === originStation.id);
      const endIdx = redStations.findIndex((s) => s.id === destStation.id);

      if (startIdx !== -1 && endIdx !== -1) {
        const step = startIdx < endIdx ? 1 : -1;
        const result = [];
        for (let i = startIdx; i !== endIdx + step; i += step) {
          result.push({
            ...redStations[i],
            activeLine: 'Red',
            lineColor: '#EF4444',
          });
        }
        return result;
      }
    }

    // Interchange route via Ameerpet (e.g. Raidurg [Blue] -> KPHB [Red])
    const ameerpet = HYDERABAD_METRO_STATIONS.find((s) => s.id === 'ameerpet');
    if (ameerpet && originStation.id !== ameerpet.id && destStation.id !== ameerpet.id) {
      const leg1 = this.getIntermediateStations(originStation, ameerpet);
      const leg2 = this.getIntermediateStations(ameerpet, destStation);
      return leg1.concat(leg2.slice(1));
    }

    return [
      { ...originStation, activeLine: originStation.line || 'Blue', lineColor: '#0284C7' },
      { ...destStation, activeLine: destStation.line || 'Blue', lineColor: '#0284C7' }
    ];
  }

  getAllStations() {
    return HYDERABAD_METRO_STATIONS;
  }
}

module.exports = new MetroProvider();

