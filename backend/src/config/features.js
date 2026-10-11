/**
 * CityPilot Feature Flag Configuration
 * Central source of truth for V1 (Smart Travel / External Providers) and V2 (CityPilot Ride Network)
 */

let featureState = {
  ownRideNetworkEnabled: true,
  externalProvidersEnabled: true,
  uberEnabled: true,
  rapidoEnabled: true,
  metroEnabled: true,
  busEnabled: true,
  liveDriverTrackingEnabled: true,
};

const getFeatures = () => ({ ...featureState });

const updateFeatures = (overrides) => {
  featureState = {
    ...featureState,
    ...overrides,
  };
  return { ...featureState };
};

module.exports = {
  getFeatures,
  updateFeatures,
};

