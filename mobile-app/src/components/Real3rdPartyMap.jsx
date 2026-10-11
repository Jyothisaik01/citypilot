import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

/**
 * Real 3rd Party Map Component (Standard Street View)
 * Powered by Google Streets & OpenStreetMap (100% Free, Zero API Key Watermark)
 * Clean, focused street navigation showing only the active route and pickup/drop pins.
 */
export default function Real3rdPartyMap({
  origin = { name: 'Gachibowli', lat: 17.4401, lng: 78.3489 },
  destination = { name: 'Ameerpet', lat: 17.4375, lng: 78.4483 },
  route,
  driverLocation,
  height = 280,
  interactive = true,
  style,
}) {
  const htmlContent = useMemo(() => {
    const oLat = parseFloat(origin?.lat || 17.4401);
    const oLng = parseFloat(origin?.lng || 78.3489);
    const oName = (origin?.name || 'Origin').split(',')[0].replace(/'/g, "\\'");

    const dLat = parseFloat(destination?.lat || 17.4375);
    const dLng = parseFloat(destination?.lng || 78.4483);
    const dName = (destination?.name || 'Destination').split(',')[0].replace(/'/g, "\\'");

    // Extract active metro boarding & exit station if present in multimodal route
    const metroSeg = route?.segments?.find((s) => (s.mode || '').toUpperCase() === 'METRO');
    const metroOrigin = metroSeg?.metroDetails?.originStation;
    const metroDest = metroSeg?.metroDetails?.destStation;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; background: #F8FAFC; }

    /* Solid marker wrapper without CSS transforms that fight Leaflet rendering */
    .custom-marker {
      display: block;
      width: 100%;
      height: 100%;
    }
    
    .pin-label-top {
      position: absolute;
      bottom: 38px;
      left: 50%;
      transform: translateX(-50%);
      background: #0F172A;
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      white-space: nowrap;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      pointer-events: none;
      letter-spacing: -0.2px;
      border: 1px solid rgba(255,255,255,0.2);
    }

    .leaflet-popup-content-wrapper {
      background: #0F172A;
      color: #FFFFFF;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .leaflet-popup-tip {
      background: #0F172A;
    }

    .recenter-btn {
      position: absolute;
      bottom: 12px;
      right: 12px;
      z-index: 1000;
      background: #FFFFFF;
      border: 1.5px solid #E2E8F0;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 800;
      color: #0A84FF;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <button class="recenter-btn" onclick="fitRouteBounds()">↺ Fit Route</button>

  <script>
    var map = L.map('map', {
      zoomControl: ${interactive},
      dragging: ${interactive},
      touchZoom: ${interactive},
      scrollWheelZoom: false,
      attributionControl: false
    });

    // 100% Free OpenStreetMap & Google vector raster street tiles with zero watermark
    var streetTiles = L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['0', '1', '2', '3']
    });

    var osmTiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    });

    streetTiles.addTo(map);
    streetTiles.on('tileerror', function() {
      if (!map.hasLayer(osmTiles)) {
        osmTiles.addTo(map);
      }
    });

    var originCoord = [${oLat}, ${oLng}];
    var destCoord = [${dLat}, ${dLng}];
    var routePoints = [originCoord];

    ${
      metroOrigin && metroDest
        ? `
      // Multimodal Route: First Mile -> Metro Transit -> Last Mile
      var bStation = [${metroOrigin.lat}, ${metroOrigin.lng}];
      var dStation = [${metroDest.lat}, ${metroDest.lng}];

      // First-mile (Bike / Auto taxi to station)
      L.polyline([originCoord, bStation], {
        color: '#FFC857',
        weight: 5.5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Metro rail corridor
      L.polyline([bStation, dStation], {
        color: '#0284C7',
        weight: 6.5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Last-mile walk / auto stretch
      L.polyline([dStation, destCoord], {
        color: '#64748B',
        weight: 4,
        dashArray: '6, 6',
        opacity: 0.9
      }).addTo(map);

      // Boarding Metro Station Marker
      var boardIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: '<div class="custom-marker">' +
                '<div class="pin-label-top">${metroOrigin.name} Metro</div>' +
                '<svg width="26" height="32" viewBox="0 0 26 32" fill="none">' +
                  '<path d="M13 0C5.82 0 0 5.82 0 13C0 22.75 13 32 13 32C13 32 26 22.75 26 13C26 5.82 20.18 0 13 0Z" fill="#0284C7"/>' +
                  '<circle cx="13" cy="13" r="6" fill="#FFFFFF"/>' +
                  '<circle cx="13" cy="13" r="3.5" fill="#0284C7"/>' +
                '</svg>' +
              '</div>',
        iconSize: [26, 32],
        iconAnchor: [13, 32],
        popupAnchor: [0, -32]
      });
      L.marker(bStation, { icon: boardIcon })
        .addTo(map)
        .bindPopup('<b>Board: ${metroOrigin.name} Metro</b>');

      // Deboarding Metro Station Marker
      var exitIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: '<div class="custom-marker">' +
                '<div class="pin-label-top">${metroDest.name} Metro</div>' +
                '<svg width="26" height="32" viewBox="0 0 26 32" fill="none">' +
                  '<path d="M13 0C5.82 0 0 5.82 0 13C0 22.75 13 32 13 32C13 32 26 22.75 26 13C26 5.82 20.18 0 13 0Z" fill="#7C3AED"/>' +
                  '<circle cx="13" cy="13" r="6" fill="#FFFFFF"/>' +
                  '<circle cx="13" cy="13" r="3.5" fill="#7C3AED"/>' +
                '</svg>' +
              '</div>',
        iconSize: [26, 32],
        iconAnchor: [13, 32],
        popupAnchor: [0, -32]
      });
      L.marker(dStation, { icon: exitIcon })
        .addTo(map)
        .bindPopup('<b>Deboard: ${metroDest.name} Metro</b>');

      routePoints.push(bStation);
      routePoints.push(dStation);
    `
        : `
      // Normal Direct Road Path (Cab / Bike Taxi)
      L.polyline([originCoord, destCoord], {
        color: '#0A84FF',
        weight: 6,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
    `
    }
    routePoints.push(destCoord);

    // 🟢 Pickup Pin (Anchored directly at bottom tip)
    var originIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: '<div class="custom-marker">' +
              '<div class="pin-label-top">${oName}</div>' +
              '<svg width="30" height="36" viewBox="0 0 30 36" fill="none">' +
                '<path d="M15 0C6.716 0 0 6.716 0 15C0 26.25 15 36 15 36C15 36 30 26.25 30 15C30 6.716 23.284 0 15 0Z" fill="#10B981"/>' +
                '<circle cx="15" cy="15" r="7" fill="#FFFFFF"/>' +
                '<circle cx="15" cy="15" r="4.5" fill="#047857"/>' +
              '</svg>' +
            '</div>',
      iconSize: [30, 36],
      iconAnchor: [15, 36],
      popupAnchor: [0, -36]
    });
    L.marker(originCoord, { icon: originIcon })
      .addTo(map)
      .bindPopup('<b>Pickup:</b> ${oName}');

    // 🔴 Destination Pin (Anchored directly at bottom tip)
    var destIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: '<div class="custom-marker">' +
              '<div class="pin-label-top">${dName}</div>' +
              '<svg width="30" height="36" viewBox="0 0 30 36" fill="none">' +
                '<path d="M15 0C6.716 0 0 6.716 0 15C0 26.25 15 36 15 36C15 36 30 26.25 30 15C30 6.716 23.284 0 15 0Z" fill="#EF4444"/>' +
                '<circle cx="15" cy="15" r="7" fill="#FFFFFF"/>' +
                '<path d="M13 11L18 15L13 19V11Z" fill="#DC2626"/>' +
              '</svg>' +
            '</div>',
      iconSize: [30, 36],
      iconAnchor: [15, 36],
      popupAnchor: [0, -36]
    });
    L.marker(destCoord, { icon: destIcon })
      .addTo(map)
      .bindPopup('<b>Destination:</b> ${dName}');

    function fitRouteBounds() {
      var bounds = L.latLngBounds(routePoints);
      map.fitBounds(bounds, { padding: [45, 45] });
    }

    fitRouteBounds();
  </script>
</body>
</html>
    `;
  }, [origin, destination, route, interactive]);

  return (
    <View style={[styles.container, { height }, style]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webView}
        scrollEnabled={false}
        bounces={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  webView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
