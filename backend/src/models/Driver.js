const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatarInitial: {
      type: String,
      default: 'CP',
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      default: 4.9,
    },
    totalTrips: {
      type: String,
      default: '1,200',
    },
    vehicleType: {
      type: String,
      enum: ['bike', 'auto', 'cab'],
      required: true,
      index: true,
    },
    vehicleModel: {
      type: String,
      required: true,
    },
    plateNumber: {
      type: String,
      required: true,
    },
    baseArea: {
      type: String,
      default: 'Gachibowli, Hyderabad',
    },
    isOnline: {
      type: Boolean,
      default: true,
    },
    currentLocation: {
      lat: { type: Number, default: 17.4412 },
      lng: { type: Number, default: 78.3512 },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Driver', driverSchema);

