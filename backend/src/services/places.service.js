/**
 * Places & Search Location Service
 * Comprehensive Hyderabad Places Database + Live Geocoding
 */

let SavedPlace = null;
let User = null;
try {
  SavedPlace = require('../models/SavedPlace');
  User = require('../models/User');
} catch (e) {}

const HYDERABAD_HUBS = [
  // IT Corridor & Major Tech Hubs
  { id: 'gachibowli', name: 'Gachibowli', subtitle: 'Financial District & ORR, Hyderabad', lat: 17.4400, lng: 78.3489, category: 'hub' },
  { id: 'hitec_city', name: 'Hitec City', subtitle: 'Cyber Towers & Madhapur, Hyderabad', lat: 17.4475, lng: 78.3845, category: 'hub' },
  { id: 'madhapur', name: 'Madhapur', subtitle: 'Durgam Cheruvu & Ayyappa Society, Hyderabad', lat: 17.4385, lng: 78.3995, category: 'hub' },
  { id: 'kondapur', name: 'Kondapur', subtitle: 'Near Botanical Gardens, Hyderabad', lat: 17.4682, lng: 78.3578, category: 'residential' },
  { id: 'financial_district', name: 'Financial District', subtitle: 'Nanakramguda, Waverock, Hyderabad', lat: 17.4162, lng: 78.3427, category: 'hub' },
  { id: 'nanakramguda', name: 'Nanakramguda', subtitle: 'Wipro Circle & Amazon Campus, Hyderabad', lat: 17.4190, lng: 78.3480, category: 'hub' },
  { id: 'dlf_cybercity', name: 'DLF Cyber City', subtitle: 'Gachibowli Gate 2, Hyderabad', lat: 17.4485, lng: 78.3590, category: 'hub' },
  { id: 'inorbit_mall', name: 'Inorbit Mall', subtitle: 'Durgam Cheruvu Road, Madhapur', lat: 17.4334, lng: 78.3869, category: 'mall' },
  { id: 'ikea_hyderabad', name: 'IKEA Hyderabad', subtitle: 'Raidurg, Hitec City', lat: 17.4395, lng: 78.3755, category: 'landmark' },

  // Blue Line Metro Stations (Raidurg <-> Nagole)
  { id: 'raidurg', name: 'Raidurg Metro Station', subtitle: 'Mindspace IT Park, Blue Line, Hyderabad', lat: 17.4428, lng: 78.3772, category: 'metro' },
  { id: 'durgam_cheruvu_metro', name: 'Durgam Cheruvu Metro Station', subtitle: 'Blue Line, Madhapur, Hyderabad', lat: 17.4412, lng: 78.3912, category: 'metro' },
  { id: 'madhapur_metro', name: 'Madhapur Metro Station', subtitle: 'Blue Line, Hyderabad', lat: 17.4385, lng: 78.3995, category: 'metro' },
  { id: 'peddamma_gudi_metro', name: 'Peddamma Gudi Metro Station', subtitle: 'Road No. 36, Jubilee Hills, Hyderabad', lat: 17.4312, lng: 78.4110, category: 'metro' },
  { id: 'jubilee_hills_check_post', name: 'Jubilee Hills Check Post', subtitle: 'Blue Line, Road No. 36, Hyderabad', lat: 17.4285, lng: 78.4190, category: 'metro' },
  { id: 'road_no_5_metro', name: 'Road No 5 Jubilee Hills Metro', subtitle: 'Blue Line, Hyderabad', lat: 17.4320, lng: 78.4280, category: 'metro' },
  { id: 'yousufguda_metro', name: 'Yousufguda Metro Station', subtitle: 'Blue Line, Hyderabad', lat: 17.4360, lng: 78.4380, category: 'metro' },
  { id: 'madhura_nagar_metro', name: 'Madhura Nagar Metro Station', subtitle: 'Blue Line, Hyderabad', lat: 17.4368, lng: 78.4425, category: 'metro' },
  { id: 'ameerpet', name: 'Ameerpet Metro Interchange', subtitle: 'Blue & Red Line Hub, Hyderabad', lat: 17.4375, lng: 78.4483, category: 'metro' },
  { id: 'begumpet_metro', name: 'Begumpet Metro Station', subtitle: 'Blue Line, Airport Road, Hyderabad', lat: 17.4440, lng: 78.4600, category: 'metro' },
  { id: 'prakash_nagar_metro', name: 'Prakash Nagar Metro Station', subtitle: 'Blue Line, Begumpet, Hyderabad', lat: 17.4450, lng: 78.4710, category: 'metro' },
  { id: 'rasoolpura_metro', name: 'Rasoolpura Metro Station', subtitle: 'Blue Line, Secunderabad Road, Hyderabad', lat: 17.4420, lng: 78.4810, category: 'metro' },
  { id: 'paradise_metro', name: 'Paradise Metro Station', subtitle: 'Blue Line, Secunderabad, Hyderabad', lat: 17.4410, lng: 78.4900, category: 'metro' },
  { id: 'parade_ground_metro', name: 'Parade Ground Metro Interchange', subtitle: 'Blue & Green Line Hub, Secunderabad', lat: 17.4435, lng: 78.4990, category: 'metro' },
  { id: 'secunderabad_east_metro', name: 'Secunderabad East Metro Station', subtitle: 'Blue Line, Secunderabad Station, Hyderabad', lat: 17.4344, lng: 78.5020, category: 'metro' },
  { id: 'mettuguda_metro', name: 'Mettuguda Metro Station', subtitle: 'Blue Line, Hyderabad', lat: 17.4350, lng: 78.5130, category: 'metro' },
  { id: 'tarnaka_metro', name: 'Tarnaka Metro Station', subtitle: 'Blue Line, Osmania University, Hyderabad', lat: 17.4280, lng: 78.5280, category: 'metro' },
  { id: 'habsiguda_metro', name: 'Habsiguda Metro Station', subtitle: 'Blue Line, Hyderabad', lat: 17.4180, lng: 78.5410, category: 'metro' },
  { id: 'uppal_metro', name: 'Uppal Metro Station', subtitle: 'Blue Line, Stadium Road, Hyderabad', lat: 17.4020, lng: 78.5590, category: 'metro' },
  { id: 'nagole_metro', name: 'Nagole Metro Station', subtitle: 'Blue Line Terminal, Hyderabad', lat: 17.3780, lng: 78.5670, category: 'metro' },

  // Red Line Metro Stations (Miyapur <-> LB Nagar)
  { id: 'miyapur_metro', name: 'Miyapur Metro Station', subtitle: 'Red Line Terminal, Hyderabad', lat: 17.4965, lng: 78.3615, category: 'metro' },
  { id: 'jntu_metro', name: 'JNTU College Metro Station', subtitle: 'Red Line, Kukatpally, Hyderabad', lat: 17.4940, lng: 78.3880, category: 'metro' },
  { id: 'kphb_metro', name: 'KPHB Colony Metro Station', subtitle: 'Red Line, Kukatpally, Hyderabad', lat: 17.4870, lng: 78.4010, category: 'metro' },
  { id: 'kukatpally_metro', name: 'Kukatpally Metro Station', subtitle: 'Red Line, Hyderabad', lat: 17.4810, lng: 78.4110, category: 'metro' },
  { id: 'bharat_nagar_metro', name: 'Bharat Nagar Metro Station', subtitle: 'Red Line, Moosapet, Hyderabad', lat: 17.4640, lng: 78.4280, category: 'metro' },
  { id: 'erragadda_metro', name: 'Erragadda Metro Station', subtitle: 'Red Line, Hyderabad', lat: 17.4560, lng: 78.4350, category: 'metro' },
  { id: 'sr_nagar_metro', name: 'SR Nagar Metro Station', subtitle: 'Red Line, Sanjeeva Reddy Nagar, Hyderabad', lat: 17.4430, lng: 78.4440, category: 'metro' },
  { id: 'punjagutta_metro', name: 'Punjagutta Metro Station', subtitle: 'Red Line, Hyderabad Central, Hyderabad', lat: 17.4260, lng: 78.4520, category: 'metro' },
  { id: 'irrum_manzil_metro', name: 'Irrum Manzil Metro Station', subtitle: 'Red Line, Somajiguda, Hyderabad', lat: 17.4180, lng: 78.4570, category: 'metro' },
  { id: 'khairatabad_metro', name: 'Khairatabad Metro Station', subtitle: 'Red Line, Near IMAX, Hyderabad', lat: 17.4110, lng: 78.4610, category: 'metro' },
  { id: 'lakdikapul_metro', name: 'Lakdi-ka-pul Metro Station', subtitle: 'Red Line, Assembly Road, Hyderabad', lat: 17.4040, lng: 78.4650, category: 'metro' },
  { id: 'nampally_metro', name: 'Nampally Railway Station Metro', subtitle: 'Red Line, Hyderabad Deccan, Hyderabad', lat: 17.3920, lng: 78.4710, category: 'metro' },
  { id: 'mgbs_metro', name: 'MGBS Metro Interchange', subtitle: 'Red & Green Line, Central Bus Station, Hyderabad', lat: 17.3780, lng: 78.4820, category: 'metro' },
  { id: 'malakpet_metro', name: 'Malakpet Metro Station', subtitle: 'Red Line, Old City, Hyderabad', lat: 17.3750, lng: 78.4970, category: 'metro' },
  { id: 'dilsukhnagar_metro', name: 'Dilsukhnagar Metro Station', subtitle: 'Red Line, Hyderabad', lat: 17.3680, lng: 78.5250, category: 'metro' },
  { id: 'lb_nagar_metro', name: 'LB Nagar Metro Station', subtitle: 'Red Line Terminal, Hyderabad', lat: 17.3550, lng: 78.5520, category: 'metro' },

  // Major Areas & Landmarks
  { id: 'banjara_hills', name: 'Banjara Hills', subtitle: 'Road No. 1, 10 & 12, Hyderabad', lat: 17.4156, lng: 78.4435, category: 'hub' },
  { id: 'jubilee_hills', name: 'Jubilee Hills', subtitle: 'Road No. 36 & 45, Hyderabad', lat: 17.4312, lng: 78.4110, category: 'residential' },
  { id: 'manikonda', name: 'Manikonda', subtitle: 'Puppalaguda & Lanco Hills, Hyderabad', lat: 17.4042, lng: 78.3756, category: 'residential' },
  { id: 'tolichowki', name: 'Tolichowki', subtitle: 'Mehdipatnam Road, Hyderabad', lat: 17.3995, lng: 78.4124, category: 'residential' },
  { id: 'mehdipatnam', name: 'Mehdipatnam', subtitle: 'PVNR Expressway Hub, Hyderabad', lat: 17.3916, lng: 78.4385, category: 'transit' },
  { id: 'secunderabad_stn', name: 'Secunderabad Junction Railway Station', subtitle: 'Secunderabad, Hyderabad', lat: 17.4344, lng: 78.5015, category: 'transit' },
  { id: 'charminar', name: 'Charminar', subtitle: 'Historic Monument, Old City, Hyderabad', lat: 17.3616, lng: 78.4747, category: 'landmark' },
  { id: 'rgia_airport', name: 'Rajiv Gandhi International Airport (RGIA)', subtitle: 'Shamshabad, Hyderabad', lat: 17.2403, lng: 78.4294, category: 'transit' },
];

let savedPlaces = [
  { id: 'sp_1', type: 'home', name: 'Home', address: 'Gachibowli, Hyderabad', lat: 17.4400, lng: 78.3489, icon: 'home' },
  { id: 'sp_2', type: 'work', name: 'Office', address: 'Hitech City, Hyderabad', lat: 17.4475, lng: 78.3845, icon: 'briefcase' },
  { id: 'sp_3', type: 'metro', name: 'Ameerpet Metro', address: 'Ameerpet, Hyderabad', lat: 17.4375, lng: 78.4483, icon: 'train' },
  { id: 'sp_4', type: 'metro', name: 'L&T Metro - Raidurg', address: 'Raidurg, Hyderabad', lat: 17.4428, lng: 78.3772, icon: 'train' },
];

let recentSearches = [
  { id: 'rec_1', name: 'Ameerpet, Hyderabad', lat: 17.4375, lng: 78.4483, timestamp: 'Today' },
  { id: 'rec_2', name: 'Jubilee Hills, Hyderabad', lat: 17.4312, lng: 78.4110, timestamp: 'Yesterday' },
  { id: 'rec_3', name: 'Kondapur, Hyderabad', lat: 17.4682, lng: 78.3578, timestamp: '3 days ago' },
];

class PlacesService {
  async searchPlaces(query) {
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return HYDERABAD_HUBS.slice(0, 8);
    }
    const cleanQ = query.trim();
    const q = cleanQ.toLowerCase();

    // 1. Search curated Hyderabad hubs first
    const localMatches = HYDERABAD_HUBS.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.subtitle.toLowerCase().includes(q) ||
        h.category.toLowerCase().includes(q)
    );

    // 2. Query live Photon & OpenStreetMap geocoders for real world addresses & locations
    try {
      const photonPromise = fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQ)}&limit=8`,
        { headers: { 'User-Agent': 'CityPilot/1.0' } }
      )
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (!d || !d.features || d.features.length === 0) return [];
          return d.features.map((f) => {
            const p = f.properties;
            const subParts = [p.street, p.district || p.county, p.city, p.state, p.postcode].filter(Boolean);
            const subtitle = subParts.length > 0 ? subParts.join(', ') : (p.country || 'India');
            return {
              id: `geo_${p.osm_id || Math.random().toString(36).substr(2, 7)}`,
              name: p.name || cleanQ,
              subtitle,
              lat: f.geometry.coordinates[1],
              lng: f.geometry.coordinates[0],
              category: p.type === 'station' ? 'metro' : 'landmark',
            };
          });
        })
        .catch(() => []);

      const nomPromise = fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQ)}&addressdetails=1&limit=5`,
        { headers: { 'User-Agent': 'CityPilotApp/1.0' } }
      )
        .then((r) => (r.ok ? r.json() : null))
        .then((list) => {
          if (!Array.isArray(list) || list.length === 0) return [];
          return list.map((item) => ({
            id: `nom_${item.place_id}`,
            name: item.name || item.display_name.split(',')[0],
            subtitle: item.display_name.split(',').slice(1, 4).join(',').trim(),
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            category: 'landmark',
          }));
        })
        .catch(() => []);

      const [pRes, nRes] = await Promise.allSettled([photonPromise, nomPromise]);
      const photonResults = pRes.status === 'fulfilled' ? pRes.value : [];
      const nomResults = nRes.status === 'fulfilled' ? nRes.value : [];

      const combinedGeocoded = [...photonResults];
      for (const item of nomResults) {
        if (!combinedGeocoded.some((g) => g.name.toLowerCase() === item.name.toLowerCase())) {
          combinedGeocoded.push(item);
        }
      }

      // Merge local curated matches with real geocoded results
      const finalResults = [...localMatches];
      for (const item of combinedGeocoded) {
        if (!finalResults.some((m) => m.name.toLowerCase() === item.name.toLowerCase())) {
          finalResults.push(item);
        }
      }

      if (finalResults.length > 0) {
        return finalResults;
      }
    } catch (err) {
      console.warn('Geocoding search failed:', err.message);
    }

    return localMatches;
  }

  async getSavedPlaces({ userId, phone, email } = {}) {
    try {
      const orConditions = [];
      if (userId) orConditions.push({ userId: String(userId) });
      if (phone) orConditions.push({ userPhone: String(phone) });
      if (email) orConditions.push({ userEmail: String(email).toLowerCase() });

      if (orConditions.length > 0 && SavedPlace) {
        const places = await SavedPlace.find({ $or: orConditions }).sort({ createdAt: -1 }).lean();
        return places.map((p) => ({
          id: String(p._id),
          name: p.name,
          label: p.label || 'Favorite',
          address: p.address || '',
          lat: p.lat,
          lng: p.lng,
          icon: p.icon || 'bookmark',
        }));
      }
    } catch (e) {
      console.warn('Error reading saved places from DB:', e.message);
    }
    return [];
  }

  async addSavedPlace(placeData = {}) {
    const { userId, userPhone, userEmail, label, name, address, icon } = placeData;
    const lat = placeData.lat ?? placeData.latitude ?? placeData.coordinates?.lat ?? 17.4400;
    const lng = placeData.lng ?? placeData.longitude ?? placeData.coordinates?.lng ?? 78.3489;
    try {
      if (SavedPlace && name) {
        const doc = new SavedPlace({
          userId: userId ? String(userId) : undefined,
          userPhone: userPhone ? String(userPhone) : undefined,
          userEmail: userEmail ? String(userEmail).toLowerCase() : undefined,
          label: label || 'Favorite',
          name,
          address: address || '',
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          icon: icon || 'bookmark',
        });
        const saved = await doc.save();
        return {
          id: String(saved._id),
          name: saved.name,
          label: saved.label,
          address: saved.address,
          lat: saved.lat,
          lng: saved.lng,
          icon: saved.icon,
        };
      }
    } catch (e) {
      console.warn('Error saving place to DB:', e.message);
    }
    return {
      id: `sp_${Date.now()}`,
      name: name || 'Saved Place',
      address: address || '',
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      icon: icon || 'bookmark',
    };
  }

  async removeSavedPlace(id) {
    try {
      if (SavedPlace && id) {
        await SavedPlace.findByIdAndDelete(id);
        return true;
      }
    } catch (e) {
      console.warn('Error deleting saved place from DB:', e.message);
    }
    return false;
  }

  getRecentSearches() {
    return [...recentSearches];
  }

  addRecentSearch(search) {
    recentSearches = recentSearches.filter((s) => s.name !== search.name);
    recentSearches.unshift({
      id: `rec_${Date.now()}`,
      ...search,
      timestamp: 'Just now',
    });
    if (recentSearches.length > 8) recentSearches.pop();
    return recentSearches;
  }
}

module.exports = new PlacesService();
