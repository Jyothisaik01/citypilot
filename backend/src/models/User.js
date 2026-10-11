const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: false,
      index: true,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      index: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      default: '',
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say', ''],
      default: '',
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    authProvider: {
      type: String,
      enum: ['phone', 'email', 'google'],
      default: 'phone',
    },
    avatar: {
      type: String,
      default: null,
    },
    appMode: {
      type: String,
      enum: ['normal', 'full'],
      default: 'normal', // Normal = Aggregator (Uber/Rapido links), Full = CityPilot Native Booking
    },
    preference: {
      type: String,
      enum: ['balanced', 'cheapest', 'fastest', 'comfort', 'eco'],
      default: 'balanced',
    },
    otpCode: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
    emailOtpCode: {
      type: String,
      default: null,
    },
    emailOtpExpires: {
      type: Date,
      default: null,
    },
    savedPlaces: [
      {
        id: String,
        label: String, // 'Home', 'Office', etc.
        name: String,
        address: String,
        lat: Number,
        lng: Number,
        icon: String,
      },
    ],
    walletBalance: {
      type: Number,
      default: 500, // ₹500 starting wallet bonus
    },
    totalSavingsVsCab: {
      type: Number,
      default: 1240, // ₹1,240 cumulative savings
    },
    carbonSavedKg: {
      type: Number,
      default: 14.2, // 14.2 kg CO2 saved
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
