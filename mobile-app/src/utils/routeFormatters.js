/**
 * CityPilot Standard Route Data Normalizer, Validator & Formatters
 * 
 * INTERNAL UNITS CONTRACT:
 * - distance: integer meters (e.g. 12400)
 * - duration: integer seconds (e.g. 2220)
 * - fare: numeric INR (e.g. 81)
 * 
 * Display conversions occur ONLY at the UI formatting layer.
 */

/**
 * Format distance in meters to clean user-facing string
 * @param {number} meters 
 * @returns {string} e.g. "500 m", "1.2 km", "12.4 km"
 */
export function formatDistance(meters) {
  const m = Number(meters);
  if (isNaN(m) || m <= 0) return '0 m';
  if (m < 1000) {
    return `${Math.round(m)} m`;
  }
  const km = m / 1000;
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
}

/**
 * Format duration in seconds to clean user-facing string
 * @param {number} seconds 
 * @returns {string} e.g. "5 min", "37 min", "1 hr 30 min"
 */
export function formatDuration(seconds) {
  const s = Number(seconds);
  if (isNaN(s) || s <= 0) return '0 min';
  const totalMinutes = Math.round(s / 60);
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;
  if (remainingMins === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${remainingMins} min`;
}

/**
 * Format fare to clean INR currency string
 * @param {number} fare 
 * @returns {string} e.g. "₹81"
 */
export function formatFare(fare) {
  const f = Number(fare);
  if (isNaN(f) || f < 0) return 'Fare unavailable';
  return `₹${Math.round(f).toLocaleString('en-IN')}`;
}

/**
 * Strictly calculate total walking distance across all WALK segments
 * Never assigns total journey distance to walking.
 * @param {object} route 
 * @returns {number} walking distance in meters
 */
export function getWalkingDistanceMeters(route) {
  if (!route || !Array.isArray(route.segments)) {
    return Number(route?.walkingDistanceMeters || 0);
  }
  const walkMeters = route.segments
    .filter((s) => (s.mode || '').toUpperCase() === 'WALK')
    .reduce((sum, s) => {
      const d = Number(s.distanceMeters || (s.distanceKm ? s.distanceKm * 1000 : 0));
      return sum + (isNaN(d) ? 0 : d);
    }, 0);

  return Math.round(walkMeters);
}

/**
 * Normalize a raw route object from API or fallback into the standard model
 */
export function normalizeRoute(rawRoute, origin, destination) {
  if (!rawRoute) return null;

  // Convert distance to integer meters
  let totalDistanceMeters = 0;
  if (rawRoute.totalDistanceMeters !== undefined) {
    totalDistanceMeters = Math.round(Number(rawRoute.totalDistanceMeters));
  } else if (rawRoute.totalDistanceKm !== undefined) {
    totalDistanceMeters = Math.round(Number(rawRoute.totalDistanceKm) * 1000);
  } else if (rawRoute.distanceKm !== undefined) {
    totalDistanceMeters = Math.round(Number(rawRoute.distanceKm) * 1000);
  }

  // Convert duration to integer seconds
  let totalDurationSeconds = 0;
  if (rawRoute.totalDurationSeconds !== undefined) {
    totalDurationSeconds = Math.round(Number(rawRoute.totalDurationSeconds));
  } else if (rawRoute.durationMinutes !== undefined) {
    totalDurationSeconds = Math.round(Number(rawRoute.durationMinutes) * 60);
  }

  // Numerical fare in INR
  const estimatedFare = Math.round(
    Number(rawRoute.estimatedFare ?? rawRoute.estimatedCost ?? 0)
  );

  // Normalize segments
  const rawSegments = Array.isArray(rawRoute.segments) ? rawRoute.segments : [];
  const segments = rawSegments.map((seg, idx) => {
    const mode = (seg.mode || 'WALK').toUpperCase();
    const segDistMeters = Math.round(
      Number(seg.distanceMeters ?? (seg.distanceKm ? seg.distanceKm * 1000 : 0))
    );
    const segDurationSec = Math.round(
      Number(seg.durationSeconds ?? (seg.durationMinutes ? seg.durationMinutes * 60 : 0))
    );
    const cost = Math.round(Number(seg.cost || 0));

    return {
      stepNumber: seg.stepNumber || idx + 1,
      mode,
      from: seg.from || (idx === 0 ? origin?.name : undefined),
      to: seg.to || (idx === rawSegments.length - 1 ? destination?.name : undefined),
      title: seg.title || `${mode} segment`,
      instruction: seg.instruction || `Continue via ${mode.toLowerCase()}`,
      distanceMeters: segDistMeters,
      durationSeconds: segDurationSec,
      cost,
      costType: seg.costType || (cost === 0 ? 'FREE' : 'ESTIMATE'),
      color: seg.color || '#0A84FF',
      providerName: seg.providerName,
      metroDetails: seg.metroDetails,
      polyline: seg.polyline,
    };
  });

  // Calculate actual walking distance from walk segments
  const calculatedWalkMeters = segments
    .filter((s) => s.mode === 'WALK')
    .reduce((sum, s) => sum + s.distanceMeters, 0);

  // Transfers count: transport modes minus 1 (excluding initial or final pure walk)
  const transfers =
    rawRoute.transfers !== undefined
      ? Number(rawRoute.transfers)
      : Math.max(0, segments.filter((s) => s.mode !== 'WALK').length - 1);

  return {
    id: rawRoute.id || `route_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    title: rawRoute.title || 'Multimodal Route',
    category: rawRoute.category || 'BEST_BALANCE',
    type: rawRoute.type || 'MULTIMODAL',
    modeBadge: rawRoute.modeBadge || (rawRoute.isRecommended ? 'RECOMMENDED' : 'OPTION'),
    isRecommended: Boolean(rawRoute.isRecommended || rawRoute.category === 'BEST_BALANCE'),
    icon: rawRoute.icon || 'layers',

    // INTERNAL STANDARD UNITS
    totalDistanceMeters,
    totalDurationSeconds,
    estimatedFare,
    walkingDistanceMeters: calculatedWalkMeters,
    transfers,

    // Backward-compatible computed fields for existing components
    durationMinutes: Math.round(totalDurationSeconds / 60),
    totalDistanceKm: parseFloat((totalDistanceMeters / 1000).toFixed(1)),
    costDisplay: formatFare(estimatedFare),
    costType: rawRoute.costType || 'CITYPILOT_ESTIMATE',
    priceSource: rawRoute.priceSource,
    savingsVsCab: rawRoute.savingsVsCab || 0,
    co2Grams: rawRoute.co2Grams || 150,

    origin: origin || rawRoute.origin,
    destination: destination || rawRoute.destination,
    segments,
    execution: rawRoute.execution || {},
    whyRecommended: Array.isArray(rawRoute.whyRecommended) ? rawRoute.whyRecommended : [],
    rankingScore: rawRoute.rankingScore || 80,
    isAiRecommended: Boolean(rawRoute.isAiRecommended || rawRoute.isRecommended || rawRoute.category === 'BEST_BALANCE'),
    aiName: rawRoute.aiName || 'Oreo',
    oreoRecommendation: rawRoute.oreoRecommendation || (rawRoute.isRecommended || rawRoute.category === 'BEST_BALANCE' ? {
      aiName: 'Oreo',
      headline: 'Oreo AI Recommended',
      reason: 'Oreo selected this route: optimal blend of lowest price, zero traffic delay, and fast transit.',
    } : null),
  };
}

/**
 * Validate a normalized route object to ensure it is sane and physically possible
 * Prevents rendering absurd values (e.g. 520 km walking, negative fares, 100 hr durations for local trips)
 */
export function validateRoute(route) {
  if (!route) {
    return { isValid: false, reason: 'Route object is null or undefined' };
  }

  if (typeof route.totalDistanceMeters !== 'number' || route.totalDistanceMeters <= 0) {
    return { isValid: false, reason: 'Total distance must be positive number' };
  }

  if (typeof route.totalDurationSeconds !== 'number' || route.totalDurationSeconds <= 0) {
    return { isValid: false, reason: 'Total duration must be positive number' };
  }

  if (typeof route.estimatedFare !== 'number' || route.estimatedFare < 0) {
    return { isValid: false, reason: 'Estimated fare must be a non-negative number' };
  }

  // Sane bounds check for local routes (not flagged as intercity)
  const isIntercity = Boolean(route.isIntercity || route.totalDistanceMeters > 45000);
  if (!isIntercity) {
    // Local Hyderabad trip should not exceed 100 km or 6 hours
    if (route.totalDistanceMeters > 100000) {
      return { isValid: false, reason: `Local route distance ${route.totalDistanceMeters}m exceeds 100km limit` };
    }
    if (route.totalDurationSeconds > 6 * 3600) {
      return { isValid: false, reason: `Local route duration ${route.totalDurationSeconds}s exceeds 6 hours` };
    }
    // Local walking should never exceed 15 km
    if (route.walkingDistanceMeters > 15000) {
      return { isValid: false, reason: `Local walking distance ${route.walkingDistanceMeters}m is absurd for a city commute` };
    }
  } else {
    // Intercity trips must have reasonable walking (< 5 km)
    if (route.walkingDistanceMeters > 5000) {
      return { isValid: false, reason: `Intercity walk ${route.walkingDistanceMeters}m exceeds platform connection limit` };
    }
  }

  if (!Array.isArray(route.segments) || route.segments.length === 0) {
    return { isValid: false, reason: 'Route must contain at least one valid travel segment' };
  }

  for (const seg of route.segments) {
    if (!seg.mode || typeof seg.mode !== 'string') {
      return { isValid: false, reason: 'Every segment must have a valid travel mode' };
    }
    if (seg.distanceMeters < 0 || seg.durationSeconds < 0) {
      return { isValid: false, reason: 'Segment distance and duration must be non-negative' };
    }
  }

  return { isValid: true };
}

/**
 * Dynamically derive honest, data-backed reasons for recommendation
 * Never invents hard-coded claims like "85% traffic" unless supported by route data
 */
export function getRecommendationReasons(route, allRoutes = []) {
  if (!route) return [];

  // If backend provided calculated reasons, filter out any unverified hardcoded marketing claims
  if (Array.isArray(route.whyRecommended) && route.whyRecommended.length > 0) {
    const clean = route.whyRecommended.filter(
      (r) => !r.includes('85%') && !r.includes('₹270')
    );
    if (clean.length >= 2) return clean;
  }

  const reasons = [];

  // 1. Direct cab baseline comparison
  const directCab = allRoutes.find(
    (r) => r.id?.includes('cab') || r.category === 'FASTEST' || r.type === 'DIRECT'
  );

  if (directCab && directCab.estimatedFare > route.estimatedFare) {
    const savings = Math.round(directCab.estimatedFare - route.estimatedFare);
    if (savings > 15) {
      reasons.push(`Saves ₹${savings} compared with direct cab`);
    }
  }

  // 2. Metro / Train rail advantage
  const hasMetro = route.segments?.some((s) => s.mode === 'METRO' || s.mode === 'TRAIN');
  if (hasMetro) {
    reasons.push('Avoids road traffic on dedicated metro rail corridor');
  }

  // 3. Walking efficiency
  const walkMeters = getWalkingDistanceMeters(route);
  if (walkMeters <= 700) {
    reasons.push(`Short walk (${formatDistance(walkMeters)}) at destination`);
  } else if (walkMeters <= 1200) {
    reasons.push(`Comfortable ${formatDistance(walkMeters)} walk`);
  }

  // 4. Zero transfers
  if (route.transfers === 0) {
    reasons.push('Direct point-to-point ride with zero transfers');
  }

  // 5. Environmental advantage
  if (route.category === 'ECO' || hasMetro) {
    reasons.push('Low carbon footprint transit option');
  }

  return reasons.length > 0
    ? reasons.slice(0, 3)
    : ['Optimized combination of time, fare, and comfort'];
}

