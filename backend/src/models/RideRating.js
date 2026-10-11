const mongoose = require('mongoose');

const rideRatingSchema = new mongoose.Schema(
  {
    rideId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: false,
    },
    driverName: {
      type: String,
      default: 'Ramesh Kumar',
    },
    vehicleType: {
      type: String,
      default: 'bike',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    feedbackTags: {
      type: [String],
      default: [],
    },
    tip: {
      type: Number,
      default: 0,
    },
    comment: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RideRating', rideRatingSchema);

