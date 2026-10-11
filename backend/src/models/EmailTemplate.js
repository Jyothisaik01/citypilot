const mongoose = require('mongoose');

const EmailTemplateSchema = new mongoose.Schema(
  {
    templateKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      default: 'CityPilot OTP Verification',
    },
    subject: {
      type: String,
      default: 'Your CityPilot Verification Code: {{otp}}',
    },
    htmlContent: {
      type: String,
      required: true,
    },
    textContent: {
      type: String,
      default: 'Your CityPilot verification code is: {{otp}}. Valid for 10 minutes.',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmailTemplate', EmailTemplateSchema);

