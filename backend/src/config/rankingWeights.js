/**
 * CityPilot Route Ranking Configuration
 * Configurable weights for routing preference calculation
 */

const RANKING_PROFILES = {
  balanced: {
    id: 'balanced',
    name: 'Best Balance',
    costWeight: 0.40,
    timeWeight: 0.35,
    walkingWeight: 0.15,
    transferWeight: 0.10,
    description: 'Optimal balance of time, price and physical comfort',
  },
  cheapest: {
    id: 'cheapest',
    name: 'Cheapest',
    costWeight: 0.70,
    timeWeight: 0.15,
    walkingWeight: 0.10,
    transferWeight: 0.05,
    description: 'Maximizes cost savings utilizing affordable public transit',
  },
  fastest: {
    id: 'fastest',
    name: 'Fastest',
    timeWeight: 0.70,
    costWeight: 0.15,
    walkingWeight: 0.10,
    transferWeight: 0.05,
    description: 'Minimizes overall journey travel time',
  },
  comfort: {
    id: 'comfort',
    name: 'Most Comfortable',
    walkingWeight: 0.40,
    transferWeight: 0.30,
    timeWeight: 0.20,
    costWeight: 0.10,
    description: 'Minimizes walking distances and vehicular transfers',
  },
};

module.exports = {
  RANKING_PROFILES,
};

