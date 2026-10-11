# CityPilot 🚖⚡

**Smart Multimodal Transit & Mobility Intelligence App for Hyderabad**

CityPilot is a comprehensive urban mobility ecosystem comparing real-time rides, multimodal metro combinations, and AI-powered transit copiloting across Hyderabad.

---

## 🌟 Key Features

- **Multimodal Routing Engine**: Dynamic combinations of First-Mile Bike/Auto + Hyderabad Metro + Last-Mile transit.
- **Provider Comparisons**: Real-time fare and ETA comparison across Uber, Ola, Rapido, and CityPilot Dedicated.
- **Oreo AI Copilot**: Transit intelligence assistant providing fare estimates, station guidance, and smart commute advice.
- **Live Ride Tracking**: Real-time pilot tracking with Socket.io location updates and automated safety PIN verification.
- **Push & WhatsApp Notifications**: Automated ride confirmation and OTP dispatch.

---

## 📁 Project Structure

```
citypilot/
├── mobile-app/          # React Native Expo cross-platform mobile application
├── backend/             # Node.js Express mobility API & Socket.io server
└── shared/              # Shared schemas, constants, and utilities
```

---

## 🚀 Getting Started

### Mobile App
```bash
cd mobile-app
npm install
npx expo start
```

### Backend
```bash
cd backend
npm install
npm run dev
```

---

## 🌐 Production API
Production backend deployed on Render:
`https://inventory-backend-api-jdfa.onrender.com`
