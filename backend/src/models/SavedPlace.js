const mongoose = require('mongoose');

const savedPlaceSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
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
      lowercase: true,
      trim: true,
    },
    label: {
      type: String,
      default: 'Favorite', // 'Home', 'Office', 'Metro', 'Favorite'
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    icon: {
      type: String,
      enum: ['home', 'briefcase', 'train', 'bookmark', 'heart', 'star', 'building'],
      default: 'bookmark',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for quick user-scoped lookup
savedPlaceSchema.index({ userId: 1, userPhone: 1, userEmail: 1 });

module.exports = mongoose.model('SavedPlace', savedPlaceSchema);

