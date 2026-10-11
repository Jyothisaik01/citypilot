const User = require('../models/User');
const FareObservation = require('../models/FareObservation');

const DEFAULT_SAVED_PLACES = [
  {
    id: 'place_home',
    label: 'Home',
    name: 'Gachibowli, Hyderabad',
    address: 'Near Financial District, Gachibowli',
    lat: 17.4401,
    lng: 78.3489,
    icon: 'home',
  },
  {
    id: 'place_office',
    label: 'Office',
    name: 'Hitech City, Hyderabad',
    address: 'Cyber Towers, Hitech City, Madhapur',
    lat: 17.4504,
    lng: 78.3808,
    icon: 'briefcase',
  },
  {
    id: 'place_metro_ameerpet',
    label: 'Ameerpet Metro',
    name: 'Ameerpet Metro Station',
    address: 'Metro Interchange Station, Ameerpet',
    lat: 17.4375,
    lng: 78.4483,
    icon: 'train',
  },
  {
    id: 'place_metro_raidurg',
    label: 'L&T Metro - Raidurg',
    name: 'Raidurg Metro Station',
    address: 'Blue Line Terminal, Mindspace Junction',
    lat: 17.4428,
    lng: 78.3772,
    icon: 'train',
  },
];

async function seedInitialData() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.create({
        phone: '+91 98765 43210',
        email: 'anusha@citypilot.app',
        name: 'Anusha',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
        appMode: 'normal',
        preference: 'balanced',
        savedPlaces: DEFAULT_SAVED_PLACES,
        walletBalance: 500,
        totalSavingsVsCab: 1240,
        carbonSavedKg: 14.2,
      });
      console.log('🌱 Seeded default user Anusha in MongoDB');
    }

    const obsCount = await FareObservation.countDocuments();
    if (obsCount === 0) {
      await FareObservation.create([
        {
          provider: 'uber',
          vehicleType: 'cab',
          city: 'Hyderabad',
          pickup: { name: 'Gachibowli', lat: 17.44, lng: 78.3489 },
          destination: { name: 'Ameerpet', lat: 17.4375, lng: 78.4483 },
          distanceKm: 18.2,
          durationMin: 42,
          estimatedFare: 345,
          hour: 8,
          dayOfWeek: 1,
          trafficLevel: 'high',
          source: 'citypilot_model',
        },
        {
          provider: 'rapido',
          vehicleType: 'bike',
          city: 'Hyderabad',
          pickup: { name: 'Gachibowli', lat: 17.44, lng: 78.3489 },
          destination: { name: 'Ameerpet', lat: 17.4375, lng: 78.4483 },
          distanceKm: 18.2,
          durationMin: 34,
          estimatedFare: 110,
          hour: 8,
          dayOfWeek: 1,
          trafficLevel: 'high',
          source: 'citypilot_model',
        },
      ]);
      console.log('🌱 Seeded initial Hyderabad FareObservations');
    }

    const Driver = require('../models/Driver');
    const driverCount = await Driver.countDocuments();
    if (driverCount === 0) {
      const drivers = [
        // 4 Bike Pilots
        {
          name: 'Ramesh Kumar',
          avatarInitial: 'RK',
          phone: '+91 98490 12345',
          rating: 4.9,
          totalTrips: '1,420',
          vehicleType: 'bike',
          vehicleModel: 'TVS Raider 125 (Neon Blue)',
          plateNumber: 'TS 09 UB 4821',
          baseArea: 'Gachibowli Junction',
        },
        {
          name: 'Kiran Varma',
          avatarInitial: 'KV',
          phone: '+91 98491 23456',
          rating: 4.8,
          totalTrips: '980',
          vehicleType: 'bike',
          vehicleModel: 'Honda Activa 6G (Pearl White)',
          plateNumber: 'TS 07 EK 2190',
          baseArea: 'Hitec City, Cyber Towers',
        },
        {
          name: 'Suresh Reddy',
          avatarInitial: 'SR',
          phone: '+91 98492 34567',
          rating: 4.9,
          totalTrips: '1,840',
          vehicleType: 'bike',
          vehicleModel: 'Bajaj Pulsar N160 (Ebony Black)',
          plateNumber: 'TS 08 FK 9032',
          baseArea: 'Madhapur Metro',
        },
        {
          name: 'Mohammed Imran',
          avatarInitial: 'MI',
          phone: '+91 98493 45678',
          rating: 4.9,
          totalTrips: '2,100',
          vehicleType: 'bike',
          vehicleModel: 'Yamaha FZ-S (Matte Dark)',
          plateNumber: 'TS 09 EA 4112',
          baseArea: 'Jubilee Hills Check Post',
        },

        // 3 Auto Drivers
        {
          name: 'Satyanarayana M.',
          avatarInitial: 'SM',
          phone: '+91 98494 56789',
          rating: 4.8,
          totalTrips: '2,450',
          vehicleType: 'auto',
          vehicleModel: 'Bajaj RE 4S Auto (Green & Yellow)',
          plateNumber: 'TS 08 EA 6543',
          baseArea: 'Ameerpet Metro Hub',
        },
        {
          name: 'Venkataiah G.',
          avatarInitial: 'VG',
          phone: '+91 98495 67890',
          rating: 4.9,
          totalTrips: '1,320',
          vehicleType: 'auto',
          vehicleModel: 'Mahindra Treo Electric Auto (Silent EV)',
          plateNumber: 'TS 07 EV 3219',
          baseArea: 'Financial District, Nanakramguda',
        },
        {
          name: 'Ravi Teja P.',
          avatarInitial: 'RP',
          phone: '+91 98496 78901',
          rating: 4.7,
          totalTrips: '3,100',
          vehicleType: 'auto',
          vehicleModel: 'Piaggio Ape City Plus',
          plateNumber: 'TS 10 TA 8871',
          baseArea: 'Kondapur RTO Circle',
        },

        // 3 Cab Drivers
        {
          name: 'Venkat Rao',
          avatarInitial: 'VR',
          phone: '+91 98497 89012',
          rating: 4.9,
          totalTrips: '3,650',
          vehicleType: 'cab',
          vehicleModel: 'Maruti Suzuki Dzire Sedan (Arctic White)',
          plateNumber: 'TS 07 CD 8765',
          baseArea: 'Gachibowli Flyover',
        },
        {
          name: 'Srinivas Raju',
          avatarInitial: 'SR',
          phone: '+91 98498 90123',
          rating: 4.9,
          totalTrips: '2,890',
          vehicleType: 'cab',
          vehicleModel: 'Hyundai Aura S-CNG (Titan Grey)',
          plateNumber: 'TS 08 UB 1144',
          baseArea: 'Mindspace Junction, Raidurg',
        },
        {
          name: 'Anand Mohan',
          avatarInitial: 'AM',
          phone: '+91 98499 01234',
          rating: 4.9,
          totalTrips: '1,780',
          vehicleType: 'cab',
          vehicleModel: 'Tata Tigor EV Express (Electric Blue)',
          plateNumber: 'TS 09 EV 9901',
          baseArea: 'Durgam Cheruvu Inorbit Mall',
        },
      ];

      await Driver.insertMany(drivers);
      console.log('🌱 Seeded 10 verified CityPilot fleet drivers in MongoDB (Bikes, Autos, Cabs)');
    }
  } catch (err) {
    console.warn('⚠️ Seeding skipped:', err.message);
  }
}

module.exports = { seedInitialData };
