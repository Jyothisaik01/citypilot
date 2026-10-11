const mongoose = require('mongoose');

const tripSegmentSchema = new mongoose.Schema(
  {
    stepNumber: Number,
    mode: {
      type: String,
      enum: ['WALK', 'BIKE', 'METRO', 'AUTO', 'CAB', 'BUS'],
    },
    title: String,
    instruction: String,
    durationMinutes: Number,
    distanceKm: Number,
    cost: Number,
    costType: String,
    providerName: String,
    metroDetails: mongoose.Schema.Types.Mixed,
    driverDetails: mongoose.Schema.Types.Mixed,
    polyline: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    userPhone: {
      type: String,
      required: false,
      index: true,
      trim: true,
    },
    userEmail: {
      type: String,
      required: false,
      index: true,
      trim: true,
    },
    origin: {
      name: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    destination: {
      name: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    routeId: String,
    routeTitle: String,
    routeCategory: String, // 'BEST_BALANCE', 'CHEAPEST', 'FASTEST', 'COMFORT', 'CITYPILOT_NETWORK'
    preference: String, // 'balanced', 'cheapest', 'fastest', etc.
    modeBadge: String,
    totalDistanceKm: Number,
    durationMinutes: Number,
    walkingDistanceMeters: Number,
    transfers: Number,
    totalCost: Number,
    directCabCost: Number,
    savingsVsCab: Number,
    carbonGrams: Number,
    segments: [tripSegmentSchema],
    bookingMode: {
      type: String,
      enum: ['NORMAL_AGGREGATOR', 'FULL_NATIVE_BOOKING'],
      default: 'NORMAL_AGGREGATOR',
    },
    status: {
      type: String,
      enum: ['REQUESTED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'COMPLETED',
    },
    driver: {
      name: String,
      vehicle: String,
      phone: String,
      rating: Number,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    feedback: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Trip', tripSchema);
