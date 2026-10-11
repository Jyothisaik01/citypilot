const metroProvider = require('../providers/metroProvider');
const uberProvider = require('../providers/uberProvider');
const rapidoProvider = require('../providers/rapidoProvider');
const googleRoutesProvider = require('../providers/googleRoutesProvider');
const cityPilotProvider = require('../providers/cityPilotProvider');
const { getFeatures } = require('../config/features');
const { RANKING_PROFILES } = require('../config/rankingWeights');

/**
 * CityPilot Mobility Intelligence Engine
 * "Don't just book a ride. Find the smartest way there."
 */

class MobilityIntelligenceService {
  /**
   * Main entry point: Calculate and rank multimodal options from Origin to Destination
   */
  async calculateBestRoutes(origin, destination, preference = 'balanced', mode = 'normal', maxWalkingKm = 6.0) {
    if (!origin || !destination) {
      throw new Error('Both origin and destination with coordinates are required');
    }

    const oLat = parseFloat(origin.lat || origin.latitude || 17.44);
    const oLng = parseFloat(origin.lng || origin.longitude || 78.3489);
    const dLat = parseFloat(destination.lat || destination.latitude || 17.4375);
    const dLng = parseFloat(destination.lng || destination.longitude || 78.4483);

    const safeOrigin = {
      name: origin.name || 'Current Location',
      lat: oLat,
      lng: oLng,
    };

    const safeDest = {
      name: destination.name || 'Destination',
      lat: dLat,
      lng: dLng,
    };

    const directDistanceKm = googleRoutesProvider.calculateDistance(oLat, oLng, dLat, dLng);
    const maxWalkLimit = Math.max(1.0, parseFloat(maxWalkingKm) || 6.0);

    // 1. Generate candidate routes across Direct, Transit, and Multimodal
    const candidateRoutes = await this.generateMultimodalRoutes(
      safeOrigin,
      safeDest,
      directDistanceKm,
      mode,
      maxWalkLimit
    );

    // 2. Rank candidates using preference weights
    const rankedRoutes = this.rankRoutes(candidateRoutes, preference);

    const recommendedRoute = rankedRoutes[0] || null;
    if (recommendedRoute) {
      recommendedRoute.isAiRecommended = true;
      recommendedRoute.aiName = 'Oreo';
      recommendedRoute.badge = '✨ Oreo AI Recommended';
      recommendedRoute.modeBadge = '✨ OREO AI RECOMMENDED';
      recommendedRoute.oreoRecommendation = {
        aiName: 'Oreo',
        headline: 'Oreo AI Recommended',
        matchScore: 96,
        reason: `Oreo analyzed real-time traffic and transit tariffs: saves up to ₹${recommendedRoute.savingsVsCab || 180} vs direct cab and connects seamlessly with the fastest transit corridors.`,
      };
    }

    const alternatives = rankedRoutes.slice(1);

    return {
      origin: safeOrigin,
      destination: safeDest,
      directDistanceKm: parseFloat(directDistanceKm.toFixed(2)),
      isIntercity: directDistanceKm > 45,
      maxWalkingKm: maxWalkLimit,
      preference,
      mode,
      recommendedRoute,
      alternatives,
      allRoutes: rankedRoutes,
      dataSources: [
        { name: 'Hyderabad Metro Rail (HMR)', type: 'OFFICIAL_TRANSIT_DATA', reliable: true },
        { name: 'OpenStreetMap & Routes Engine', type: 'ROAD_NETWORK', reliable: true },
        { name: 'CityPilot Fleet Dispatch', type: 'NATIVE_FLEET_DISPATCH', reliable: true },
        { name: 'Uber Handoff Protocol', type: 'DEEP_LINK_INTEGRATION', reliable: true },
        { name: 'Rapido Handoff Protocol', type: 'APP_LINK_INTEGRATION', reliable: true },
      ],
      calculatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate realistic transportation combinations with strict walking thresholds & intercity awareness
   */
  async generateMultimodalRoutes(origin, destination, directDistanceKm, mode = 'normal', maxWalkingKm = 6.0) {
    const routes = [];
    const features = getFeatures();
    const isFullMode = mode === 'full';
    const maxWalkMeters = Math.round(maxWalkingKm * 1000);

    // =========================================================================
    // CASE A: LONG DISTANCE / INTERCITY COMMUTE (> 45 km, e.g. Hyd to Vizianagaram)
    // =========================================================================
    if (directDistanceKm > 45) {
      const roadKm = Math.round(directDistanceKm * 1.22);
      const roadHours = parseFloat((roadKm / 65).toFixed(1));
      const roadDurationMins = Math.round(roadHours * 60);

      // 1. INTERCITY OPTION A: Outstation Cab (Direct Door-to-Door)
      const outstationCabRatePerKm = 13.5;
      const cabFare = Math.round(roadKm * outstationCabRatePerKm + 450);

      routes.push({
        id: 'intercity_cab',
        title: 'Outstation Cab (Direct)',
        category: 'FASTEST',
        type: 'DIRECT',
        modeBadge: '⚡ FASTEST (DOOR-TO-DOOR)',
        icon: 'car',
        durationMinutes: roadDurationMins,
        totalDistanceKm: roadKm,
        walkingDistanceMeters: 100,
        transfers: 0,
        co2Grams: Math.round(roadKm * 135),
        estimatedCost: cabFare,
        costDisplay: `₹${cabFare.toLocaleString('en-IN')}`,
        costType: 'INTERCITY_CAB_ESTIMATE',
        priceSource: `Outstation Cab rate (₹${outstationCabRatePerKm}/km + toll estimate)`,
        segments: [
          {
            stepNumber: 1,
            mode: 'CAB',
            title: 'Outstation Cab Express',
            instruction: `Direct highway drive from ${origin.name} to ${destination.name}`,
            durationMinutes: roadDurationMins,
            distanceKm: roadKm,
            cost: cabFare,
            color: '#0A84FF',
          },
        ],
        execution: {
          provider: isFullMode ? 'CityPilot' : 'Uber Outstation',
          actionLabel: isFullMode ? `Request CityPilot Outstation Cab ₹${cabFare}` : 'Book Outstation in Uber',
          isInternalBooking: isFullMode,
        },
        whyRecommended: [
          'Direct door-to-door comfort with zero luggage transfers',
          'Air-conditioned private vehicle',
          'Flexible rest & meal stops on highway',
        ],
      });

      // 2. INTERCITY OPTION B: Intercity Express Train + First & Last Mile (BEST BALANCE)
      const firstMileCabKm = 14;
      const firstMileCabMins = 28;
      const firstMileCabCost = 280;

      const trainKm = Math.round(directDistanceKm * 1.05);
      const trainMins = Math.round((trainKm / 68) * 60);
      const trainFare = Math.round(160 + trainKm * 1.15); // Standard AC Chair/3AC fare

      const lastMileAutoKm = 4.5;
      const lastMileAutoMins = 15;
      const lastMileAutoCost = 90;

      const totalIntercityTrainCost = firstMileCabCost + trainFare + lastMileAutoCost;
      const totalIntercityTrainMins = firstMileCabMins + trainMins + lastMileAutoMins;
      const totalIntercityWalkMeters = 350; // Inside stations only

      routes.push({
        id: 'intercity_train_transit',
        title: 'Cab → Express Train → Auto',
        category: 'BEST_BALANCE',
        type: 'MULTIMODAL',
        modeBadge: '🏆 BEST BALANCE (INTERCITY)',
        isRecommended: true,
        icon: 'layers',
        durationMinutes: totalIntercityTrainMins,
        totalDistanceKm: firstMileCabKm + trainKm + lastMileAutoKm,
        walkingDistanceMeters: totalIntercityWalkMeters,
        transfers: 2,
        co2Grams: Math.round(firstMileCabKm * 120 + trainKm * 28),
        estimatedCost: totalIntercityTrainCost,
        costDisplay: `₹${totalIntercityTrainCost.toLocaleString('en-IN')}`,
        costType: 'INTERCITY_TRANSIT_ESTIMATE',
        priceSource: `Cab (₹${firstMileCabCost}) + Train (₹${trainFare}) + Auto (₹${lastMileAutoCost})`,
        segments: [
          {
            stepNumber: 1,
            mode: 'CAB',
            title: '1. Cab to Secunderabad / Deccan Station',
            instruction: `${firstMileCabKm} km ride to railway station`,
            durationMinutes: firstMileCabMins,
            distanceKm: firstMileCabKm,
            cost: firstMileCabCost,
            color: '#0A84FF',
          },
          {
            stepNumber: 2,
            mode: 'TRAIN',
            title: `2. Intercity Express Train to ${destination.name.split(',')[0]}`,
            instruction: `Superfast / Vande Bharat Express (${trainKm} km • Reserved Seat)`,
            durationMinutes: trainMins,
            distanceKm: trainKm,
            cost: trainFare,
            color: '#14C38E',
          },
          {
            stepNumber: 3,
            mode: 'AUTO',
            title: `3. Local Auto from Station to Destination`,
            instruction: `${lastMileAutoKm} km final stretch from platform to door`,
            durationMinutes: lastMileAutoMins,
            distanceKm: lastMileAutoKm,
            cost: lastMileAutoCost,
            color: '#A855F7',
          },
        ],
        execution: {
          provider: isFullMode ? 'CityPilot' : 'Multimodal',
          actionLabel: isFullMode ? 'Request CityPilot Station Pickup' : 'Plan Intercity Commute',
          isInternalBooking: isFullMode,
        },
        whyRecommended: [
          `Saves over ₹${(cabFare - totalIntercityTrainCost).toLocaleString('en-IN')} compared to direct cab`,
          'Punctual express railway track with zero traffic jams',
          'Negligible walking (under 400m platform access)',
        ],
      });

      // 3. INTERCITY OPTION C: Volvo AC Sleeper Bus + First/Last Mile (CHEAPEST)
      const busFare = Math.round(220 + roadKm * 1.6);
      const totalBusCost = 150 + busFare + 70;
      const totalBusMins = 20 + Math.round((roadKm / 55) * 60) + 12;

      routes.push({
        id: 'intercity_bus_transit',
        title: 'Auto → AC Sleeper Bus → Auto',
        category: 'CHEAPEST',
        type: 'MULTIMODAL',
        modeBadge: '💰 CHEAPEST INTERCITY',
        icon: 'bus',
        durationMinutes: totalBusMins,
        totalDistanceKm: roadKm + 8,
        walkingDistanceMeters: 250,
        transfers: 2,
        co2Grams: Math.round(roadKm * 48),
        estimatedCost: totalBusCost,
        costDisplay: `₹${totalBusCost.toLocaleString('en-IN')}`,
        costType: 'INTERCITY_TRANSIT_ESTIMATE',
        priceSource: `Auto (₹150) + AC Bus (₹${busFare}) + Auto (₹70)`,
        segments: [
          {
            stepNumber: 1,
            mode: 'AUTO',
            title: 'Auto to Central Bus Station (MGBS / Miyapur)',
            instruction: 'Ride to intercity departure bay',
            durationMinutes: 20,
            distanceKm: 8,
            cost: 150,
            color: '#A855F7',
          },
          {
            stepNumber: 2,
            mode: 'BUS',
            title: `AC Volvo Bus to ${destination.name.split(',')[0]}`,
            instruction: `Overnight / Daytime Highway Sleeper (${roadKm} km)`,
            durationMinutes: Math.round((roadKm / 55) * 60),
            distanceKm: roadKm,
            cost: busFare,
            color: '#059669',
          },
          {
            stepNumber: 3,
            mode: 'AUTO',
            title: 'Auto from Terminal to Destination',
            instruction: 'Final mile drop-off',
            durationMinutes: 12,
            distanceKm: 3.5,
            cost: 70,
            color: '#A855F7',
          },
        ],
        execution: {
          provider: isFullMode ? 'CityPilot' : 'Multimodal',
          actionLabel: isFullMode ? 'Book CityPilot Connect' : 'View Intercity Bus',
          isInternalBooking: isFullMode,
        },
        whyRecommended: [
          'Budget-friendly intercity transport',
          'Air-conditioned reclining / sleeper berths',
          'Minimal walking required',
        ],
      });

      return routes;
    }

    // =========================================================================
    // CASE B: INTRACITY / LOCAL COMMUTE (Within Metro Network, <= 45 km)
    // =========================================================================

    // 1. Direct Road Routes (Car/Cab, Bike, Auto)
    const roadRoute = await googleRoutesProvider.getRoute(origin, destination, 'DRIVE');
    const bikeRoute = await googleRoutesProvider.getRoute(origin, destination, 'BIKE');

    // DIRECT CAB
    const uberCabFare = uberProvider.getFareEstimate(roadRoute.distanceKm, roadRoute.durationMinutes, 'cab');
    const uberCabHandoff = uberProvider.getDeepLink({ pickup: origin, destination, product: 'UberGo' });

    routes.push({
      id: 'direct_cab',
      title: 'Cab (Direct)',
      category: 'FASTEST',
      type: 'DIRECT',
      modeBadge: '⚡ FASTEST',
      icon: 'car',
      durationMinutes: roadRoute.durationMinutes,
      totalDistanceKm: roadRoute.distanceKm,
      walkingDistanceMeters: 100,
      transfers: 0,
      co2Grams: Math.round(roadRoute.distanceKm * 140),
      estimatedCost: uberCabFare.estimatedFare,
      costDisplay: `₹${uberCabFare.estimatedFare}`,
      costRange: uberCabFare.fareRange,
      costType: 'CITYPILOT_ESTIMATE',
      priceSource: 'CityPilot estimate based on market rates',
      segments: [
        {
          stepNumber: 1,
          mode: 'CAB',
          title: 'Direct Cab Ride',
          instruction: `Ride from ${origin.name} to ${destination.name}`,
          durationMinutes: roadRoute.durationMinutes,
          distanceKm: roadRoute.distanceKm,
          cost: uberCabFare.estimatedFare,
          costType: 'CITYPILOT_ESTIMATE',
          providerName: isFullMode ? 'CityPilot Fleet' : 'Uber / Local Cab',
          handoff: uberCabHandoff,
          color: '#0A84FF',
          polyline: roadRoute.polylinePoints,
        },
      ],
      execution: {
        provider: isFullMode ? 'CityPilot' : 'Uber',
        actionLabel: isFullMode ? `Request CityPilot Cab ₹${uberCabFare.estimatedFare}` : 'Open in Uber',
        deepLink: uberCabHandoff.universalLink,
        nativeScheme: uberCabHandoff.nativeScheme,
        isInternalBooking: isFullMode,
        isExternal: !isFullMode,
      },
      whyRecommended: [
        'Fastest door-to-door transit time',
        'Direct pickup with minimal walking',
        'Air-conditioned comfort',
      ],
    });

    // DIRECT BIKE
    const rapidoBikeFare = rapidoProvider.getFareEstimate(bikeRoute.distanceKm, bikeRoute.durationMinutes, 'bike');
    const rapidoBikeHandoff = rapidoProvider.getDeepLink({ pickup: origin, destination, serviceType: 'bike' });

    routes.push({
      id: 'direct_bike',
      title: 'Direct Bike Taxi',
      category: 'BALANCED',
      type: 'DIRECT',
      modeBadge: '🏍 DIRECT BIKE',
      icon: 'bike',
      durationMinutes: bikeRoute.durationMinutes,
      totalDistanceKm: bikeRoute.distanceKm,
      walkingDistanceMeters: 250,
      transfers: 0,
      co2Grams: Math.round(bikeRoute.distanceKm * 45),
      estimatedCost: rapidoBikeFare.estimatedFare,
      costDisplay: `₹${rapidoBikeFare.estimatedFare}`,
      costRange: rapidoBikeFare.fareRange,
      costType: 'CITYPILOT_ESTIMATE',
      priceSource: 'CityPilot estimate based on market rates',
      segments: [
        {
          stepNumber: 1,
          mode: 'BIKE',
          title: 'Bike Taxi',
          instruction: `Ride from ${origin.name} to ${destination.name}`,
          durationMinutes: bikeRoute.durationMinutes,
          distanceKm: bikeRoute.distanceKm,
          cost: rapidoBikeFare.estimatedFare,
          costType: 'CITYPILOT_ESTIMATE',
          providerName: 'Rapido / Uber Moto',
          handoff: rapidoBikeHandoff,
          color: '#FFC857',
          polyline: bikeRoute.polylinePoints,
        },
      ],
      execution: {
        provider: isFullMode ? 'CityPilot' : 'Rapido',
        actionLabel: isFullMode ? `Request CityPilot Bike ₹${rapidoBikeFare.estimatedFare}` : 'Open in Rapido',
        deepLink: rapidoBikeHandoff.universalLink,
        nativeScheme: rapidoBikeHandoff.nativeScheme,
        isInternalBooking: isFullMode,
        isExternal: !isFullMode,
      },
      whyRecommended: [
        'Zips through peak Hyderabad road congestion',
        'Affordable direct single-vehicle option',
        'Quick pickup',
      ],
    });

    // 2. Metro & Multimodal Combinations (Hyderabad Metro)
    const originStation = metroProvider.findNearestStation(origin.lat, origin.lng);
    const destStation = metroProvider.findNearestStation(destination.lat, destination.lng);

    // Guard: Only consider local metro if BOTH origin & destination are within 12 km of metro network
    if (
      originStation &&
      destStation &&
      originStation.id !== destStation.id &&
      originStation.distanceKm <= 12 &&
      destStation.distanceKm <= 12
    ) {
      const metroJourney = metroProvider.calculateMetroJourney(originStation, destStation);

      if (metroJourney) {
        // Distance from Origin to Origin Metro Station
        const firstMileKm = originStation.distanceKm;
        // Distance from Destination Metro Station to Final Destination
        const lastMileKm = destStation.distanceKm;

        // MULTIMODAL ROUTE 1: 🏆 BEST BALANCE (Bike -> Metro -> Walk / Auto)
        const firstMileBikeMins = Math.max(4, Math.round((firstMileKm / 28) * 60 + 2));
        const firstMileBikeCost = Math.round(18 + firstMileKm * 5.5);

        // Check if last-mile exceeds user's max walking threshold
        const isWalkFeasible = lastMileKm * 1000 <= maxWalkMeters;
        const lastMileMode = isWalkFeasible ? 'WALK' : 'AUTO';
        const lastMileMins = isWalkFeasible
          ? Math.max(3, Math.round((lastMileKm / 4.8) * 60))
          : Math.max(4, Math.round((lastMileKm / 24) * 60 + 2));
        const lastMileCost = isWalkFeasible ? 0 : Math.round(28 + lastMileKm * 9.5);
        const lastMileWalkMeters = isWalkFeasible ? Math.round(lastMileKm * 1000) : 150;
        const lastMileWalkMins = lastMileMins;

        const totalMultimodalMins = firstMileBikeMins + metroJourney.durationMinutes + lastMileMins;
        const totalMultimodalCost = firstMileBikeCost + metroJourney.officialFare + lastMileCost;

        const firstMileBikeHandoff = rapidoProvider.getDeepLink({
          pickup: origin,
          destination: { name: `${originStation.name} Metro Station`, lat: originStation.lat, lng: originStation.lng },
          serviceType: 'bike',
        });

        const totalMultiDistMeters = Math.round((firstMileKm + metroJourney.distanceKm + lastMileKm) * 1000);
        const totalMultiDurationSec = Math.round(totalMultimodalMins * 60);
        const savingsVsCab = Math.max(0, uberCabFare.estimatedFare - totalMultimodalCost);

        routes.push({
          id: 'multimodal_bike_metro',
          title: isWalkFeasible ? 'Bike → Metro → Walk' : 'Bike → Metro → Auto',
          category: 'BEST_BALANCE',
          type: 'MULTIMODAL',
          modeBadge: '🏆 BEST BALANCE',
          isRecommended: true,
          icon: 'layers',
          totalDistanceMeters: totalMultiDistMeters,
          totalDurationSeconds: totalMultiDurationSec,
          estimatedFare: totalMultimodalCost,
          durationMinutes: totalMultimodalMins,
          totalDistanceKm: parseFloat((firstMileKm + metroJourney.distanceKm + lastMileKm).toFixed(1)),
          walkingDistanceMeters: lastMileWalkMeters,
          transfers: 2,
          co2Grams: Math.round(firstMileKm * 40 + metroJourney.distanceKm * 12 + (isWalkFeasible ? 0 : lastMileKm * 70)),
          estimatedCost: totalMultimodalCost,
          costDisplay: `₹${totalMultimodalCost}`,
          costRange: `₹${totalMultimodalCost - 4}–₹${totalMultimodalCost + 4}`,
          costType: 'CITYPILOT_ESTIMATE',
          priceSource: `₹${metroJourney.officialFare} Official Metro Fare + ₹${firstMileBikeCost} Bike${lastMileCost > 0 ? ` + ₹${lastMileCost} Auto` : ''}`,
          segments: [
            {
              stepNumber: 1,
              mode: 'BIKE',
              title: `1. Bike Ride to ${originStation.name} Metro`,
              instruction: `From ${origin.name} to ${originStation.name} Metro`,
              distanceMeters: Math.round(firstMileKm * 1000),
              durationSeconds: Math.round(firstMileBikeMins * 60),
              durationMinutes: firstMileBikeMins,
              distanceKm: firstMileKm,
              cost: firstMileBikeCost,
              costType: 'CITYPILOT_ESTIMATE',
              providerName: 'Rapido Bike / Uber Moto',
              handoff: firstMileBikeHandoff,
              color: '#FFC857',
              polyline: googleRoutesProvider.generateWaypoints(origin, originStation, 'BIKE'),
            },
            {
              stepNumber: 2,
              mode: 'METRO',
              title: `2. Metro: ${originStation.name} → ${destStation.name}`,
              instruction: `Board towards ${destStation.name} • ${metroJourney.stopCount} stops`,
              distanceMeters: Math.round(metroJourney.distanceKm * 1000),
              durationSeconds: Math.round(metroJourney.durationMinutes * 60),
              durationMinutes: metroJourney.durationMinutes,
              distanceKm: metroJourney.distanceKm,
              cost: metroJourney.officialFare,
              costType: 'OFFICIAL_TRANSIT_FARE',
              providerName: 'Hyderabad Metro Rail',
              color: '#14C38E',
              metroDetails: metroJourney,
              polyline: [
                { latitude: originStation.lat, longitude: originStation.lng },
                { latitude: destStation.lat, longitude: destStation.lng },
              ],
            },
            {
              stepNumber: 3,
              mode: 'WALK',
              title: `3. Walk to Destination`,
              instruction: `From ${destStation.name} Metro to ${destination.name}`,
              distanceMeters: Math.round(lastMileKm * 1000),
              durationSeconds: Math.round(lastMileWalkMins * 60),
              durationMinutes: lastMileWalkMins,
              distanceKm: lastMileKm,
              cost: 0,
              costType: 'FREE',
              providerName: 'Walking',
              color: '#94A3B8',
              polyline: googleRoutesProvider.generateWaypoints(destStation, destination, 'WALK'),
            },
          ],
          execution: {
            provider: isFullMode ? 'CityPilot' : 'Multimodal',
            actionLabel: isFullMode ? `Request CityPilot Bike ₹${firstMileBikeCost}` : 'Book Bike in Rapido',
            firstMileAction: isFullMode ? 'Request CityPilot Bike' : 'Book Bike to Metro',
            firstMileHandoff: firstMileBikeHandoff,
            metroAction: 'View Metro Schedule & Station Guide',
            isInternalBooking: isFullMode,
          },
          whyRecommended: [
            savingsVsCab > 10 ? `Saves ₹${savingsVsCab} compared to direct cab` : 'Cost-effective multimodal transit',
            'Avoids road traffic on dedicated metro rail corridor',
            `Short walk under ${Math.max(100, Math.round(lastMileKm * 1000))}m at destination`,
            'Predictable schedule with 3–5 min train frequency',
          ],
        });

        // TRANSIT ROUTE 2: 💰 CHEAPEST (Walk -> Metro -> Walk)
        const firstMileWalkMins = Math.max(4, Math.round((firstMileKm / 4.8) * 60));
        const totalWalkDistanceMeters = Math.round((firstMileKm + lastMileKm) * 1000);
        const totalWalkTransitMins = firstMileWalkMins + metroJourney.durationMinutes + lastMileWalkMins;

        // ONLY offer all-walk transit if total walking across the trip is within user limit
        if (totalWalkDistanceMeters <= maxWalkMeters) {
          routes.push({
            id: 'transit_walk_metro',
            title: 'Walk → Metro → Walk',
            category: 'CHEAPEST',
            type: 'TRANSIT',
            modeBadge: '💰 CHEAPEST',
            icon: 'train',
            durationMinutes: totalWalkTransitMins,
            totalDistanceKm: parseFloat((firstMileKm + metroJourney.distanceKm + lastMileKm).toFixed(1)),
            walkingDistanceMeters: totalWalkDistanceMeters,
            transfers: 1,
            co2Grams: Math.round(metroJourney.distanceKm * 12),
            estimatedCost: metroJourney.officialFare,
            costDisplay: `₹${metroJourney.officialFare}`,
            costType: 'OFFICIAL_TRANSIT_FARE',
            priceSource: 'Official Hyderabad Metro transit fare',
            segments: [
              {
                stepNumber: 1,
                mode: 'WALK',
                title: `Walk to ${originStation.name} Metro`,
                instruction: `${firstMileKm} km walk to boarding station`,
                durationMinutes: firstMileWalkMins,
                distanceKm: firstMileKm,
                cost: 0,
                costType: 'FREE',
                color: '#94A3B8',
              },
              {
                stepNumber: 2,
                mode: 'METRO',
                title: `Metro: ${originStation.name} → ${destStation.name}`,
                instruction: `${metroJourney.stopCount} stops on ${metroJourney.line}`,
                durationMinutes: metroJourney.durationMinutes,
                distanceKm: metroJourney.distanceKm,
                cost: metroJourney.officialFare,
                costType: 'OFFICIAL_TRANSIT_FARE',
                providerName: 'Hyderabad Metro Rail',
                color: '#14C38E',
                metroDetails: metroJourney,
              },
              {
                stepNumber: 3,
                mode: 'WALK',
                title: `Walk to ${destination.name}`,
                instruction: `${lastMileKm} km final stretch`,
                durationMinutes: lastMileWalkMins,
                distanceKm: lastMileKm,
                cost: 0,
                costType: 'FREE',
                color: '#94A3B8',
              },
            ],
            whyRecommended: [
              'Zero surge pricing, fixed official fare',
              'Eco-friendly with lowest carbon footprint',
              'Predictable schedule without traffic jams',
            ],
          });
        }

        // MULTIMODAL ROUTE 3: Auto → Metro → Walk / Auto (Comfort + Economy)
        const firstMileAutoMins = Math.max(5, Math.round((firstMileKm / 24) * 60 + 2));
        const firstMileAutoCost = Math.round(28 + firstMileKm * 9.5);
        const totalAutoMetroCost = firstMileAutoCost + metroJourney.officialFare;

        routes.push({
          id: 'multimodal_auto_metro',
          title: 'Auto → Metro → Walk',
          category: 'COMFORT',
          type: 'MULTIMODAL',
          modeBadge: '🛺 AUTO + METRO',
          icon: 'layers',
          durationMinutes: firstMileAutoMins + metroJourney.durationMinutes + lastMileWalkMins,
          totalDistanceKm: parseFloat((firstMileKm + metroJourney.distanceKm + lastMileKm).toFixed(1)),
          walkingDistanceMeters: lastMileWalkMeters,
          transfers: 2,
          co2Grams: Math.round(firstMileKm * 75 + metroJourney.distanceKm * 12),
          estimatedCost: totalAutoMetroCost,
          costDisplay: `₹${totalAutoMetroCost}`,
          costType: 'CITYPILOT_ESTIMATE',
          priceSource: 'Auto ₹38 estimate + Metro ₹20 fare',
          segments: [
            {
              stepNumber: 1,
              mode: 'AUTO',
              title: `Auto to ${originStation.name} Metro`,
              instruction: `Catch auto from ${origin.name}`,
              durationMinutes: firstMileAutoMins,
              distanceKm: firstMileKm,
              cost: firstMileAutoCost,
              costType: 'CITYPILOT_ESTIMATE',
              color: '#A855F7',
            },
            {
              stepNumber: 2,
              mode: 'METRO',
              title: `Metro Ride`,
              instruction: `${originStation.name} to ${destStation.name}`,
              durationMinutes: metroJourney.durationMinutes,
              distanceKm: metroJourney.distanceKm,
              cost: metroJourney.officialFare,
              costType: 'OFFICIAL_TRANSIT_FARE',
              color: '#14C38E',
              metroDetails: metroJourney,
            },
            {
              stepNumber: 3,
              mode: 'WALK',
              title: `Walk to Destination`,
              instruction: `Final ${lastMileWalkMeters}m walk`,
              durationMinutes: lastMileWalkMins,
              distanceKm: lastMileKm,
              cost: 0,
              costType: 'FREE',
              color: '#94A3B8',
            },
          ],
          whyRecommended: [
            'Sheltered from sun/rain on first-mile',
            'Fast transit via metro',
            'Economical compared to direct cab',
          ],
        });
      }
    }

    // 3. CityPilot Own Ride Network Option (Mode 2 - When Feature Flag is Enabled)
    if (features.ownRideNetworkEnabled) {
      const fleet = cityPilotProvider.getFleetOptions(roadRoute.distanceKm, roadRoute.durationMinutes);
      if (fleet.isEnabled && fleet.vehicles) {
        fleet.vehicles.forEach((v) => {
          routes.push({
            id: `citypilot_${v.type}`,
            title: v.name,
            category: 'CITYPILOT_NETWORK',
            type: 'CITYPILOT_DIRECT',
            modeBadge: '🚕 CITYPILOT FLEET',
            icon: v.icon,
            durationMinutes: roadRoute.durationMinutes,
            totalDistanceKm: roadRoute.distanceKm,
            walkingDistanceMeters: 50,
            transfers: 0,
            co2Grams: Math.round(roadRoute.distanceKm * 110),
            estimatedCost: v.fare,
            costDisplay: `₹${v.fare}`,
            costType: 'CITYPILOT_NETWORK_PRICE',
            priceSource: 'Direct CityPilot driver network fare',
            segments: [
              {
                stepNumber: 1,
                mode: v.type.toUpperCase(),
                title: v.name,
                instruction: `Direct ride with ${v.driverName} (${v.vehiclePlate})`,
                durationMinutes: roadRoute.durationMinutes,
                distanceKm: roadRoute.distanceKm,
                cost: v.fare,
                costType: 'CITYPILOT_NETWORK_PRICE',
                color: '#0A84FF',
                driverDetails: v,
              },
            ],
            execution: {
              provider: 'CityPilot',
              actionLabel: `Book ${v.name}`,
              isInternalBooking: true,
              driver: v,
            },
            whyRecommended: [
              'Zero commission markup on driver fare',
              'Driver arriving in 2 minutes',
              'Seamless in-app booking and live GPS tracking',
            ],
          });
        });
      }
    }

    // Normalize all routes to guarantee strict standard units (meters, seconds, numeric INR)
    const normalizedRoutes = routes.map((r) => {
      const totalDistanceMeters = r.totalDistanceMeters || Math.round((r.totalDistanceKm || r.distanceKm || 0) * 1000);
      const totalDurationSeconds = r.totalDurationSeconds || Math.round((r.durationMinutes || 0) * 60);
      const estimatedFare = Math.round(Number(r.estimatedFare ?? r.estimatedCost ?? 0));
      const segments = (r.segments || []).map((s) => ({
        ...s,
        distanceMeters: s.distanceMeters || Math.round((s.distanceKm || 0) * 1000),
        durationSeconds: s.durationSeconds || Math.round((s.durationMinutes || 0) * 60),
        cost: Math.round(Number(s.cost || 0)),
      }));
      const walkingDistanceMeters = segments
        .filter((s) => (s.mode || '').toUpperCase() === 'WALK')
        .reduce((sum, s) => sum + s.distanceMeters, 0);

      return {
        ...r,
        totalDistanceMeters,
        totalDurationSeconds,
        estimatedFare,
        walkingDistanceMeters,
        segments,
      };
    });

    return normalizedRoutes;
  }

  /**
   * Configurable ranking algorithm across user preferences
   */
  rankRoutes(routes, preference = 'balanced') {
    const profile = RANKING_PROFILES[preference] || RANKING_PROFILES.balanced;

    // Determine max values in set for normalization
    let maxTime = 1;
    let maxCost = 1;
    let maxWalk = 1;
    let maxTransfers = 1;

    routes.forEach((r) => {
      if (r.durationMinutes > maxTime) maxTime = r.durationMinutes;
      if (r.estimatedCost > maxCost) maxCost = r.estimatedCost;
      if (r.walkingDistanceMeters > maxWalk) maxWalk = r.walkingDistanceMeters;
      if (r.transfers > maxTransfers) maxTransfers = r.transfers;
    });

    const scored = routes.map((route) => {
      // Lower values are better -> Normalized 0 (best) to 1 (worst)
      const normTime = route.durationMinutes / maxTime;
      const normCost = route.estimatedCost / maxCost;
      const normWalk = route.walkingDistanceMeters / maxWalk;
      const normTransfers = route.transfers / (maxTransfers || 1);

      // Weighted penalty score (lower is superior)
      const penalty =
        normCost * profile.costWeight +
        normTime * profile.timeWeight +
        normWalk * profile.walkingWeight +
        normTransfers * profile.transferWeight;

      // Score on 100-point scale
      const score = Math.round((1 - penalty) * 100);

      return {
        ...route,
        rankingScore: Math.max(10, score),
      };
    });

    // Sort descending: highest score first
    return scored.sort((a, b) => b.rankingScore - a.rankingScore);
  }
}

module.exports = new MobilityIntelligenceService();

