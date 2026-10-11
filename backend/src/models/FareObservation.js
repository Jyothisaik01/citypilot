const mongoose = require('mongoose');

const fareObservationSchema = new mongoose.Schema(
  {
    provider: {
      type: String, // 'uber', 'rapido', 'citypilot', 'metro'
      required: true,
    },
    vehicleType: {
      type: String, // 'cab', 'bike', 'auto', 'metro'
      required: true,
    },
    city: {
      type: String,
      default: 'Hyderabad',
    },
    pickup: {
      name: String,
      lat: Number,
      lng: Number,
    },
    destination: {
      name: String,
      lat: Number,
      lng: Number,
    },
    distanceKm: {
      type: Number,
      required: true,
    },
    durationMin: {
      type: Number,
      required: true,
    },
    estimatedFare: {
      type: Number,
      required: true,
    },
    hour: {
      type: Number,
      default: () => new Date().getHours(),
    },
    dayOfWeek: {
      type: Number,
      default: () => new Date().getDay(),
    },
    trafficLevel: {
      type: String,
      enum: ['low', 'moderate', 'high', 'severe'],
      default: 'moderate',
    },
    source: {
      type: String,
      enum: ['authorized_api', 'official_tariff', 'citypilot_model', 'user_reported'],
      default: 'citypilot_model',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FareObservation', fareObservationSchema);
