import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function SimulationPilotMap({
  phase = 'arriving', // 'arriving' | 'navigating'
  vehicleType = 'bike', // 'bike' | 'auto' | 'cab'
  origin = { lat: 17.4401, lng: 78.3489, name: 'Gachibowli' },
  destination = { lat: 17.4428, lng: 78.3772, name: 'Raidurg Metro' },
  onProgress,
  height = 240,
}) {
  const oLat = Number(origin?.lat) || 17.4401;
  const oLng = Number(origin?.lng) || 78.3489;
  const dLat = Number(destination?.lat) || 17.4428;
  const dLng = Number(destination?.lng) || 78.3772;

  const modeLower = (vehicleType || 'bike').toLowerCase();
  const normalizedVehicle = modeLower.includes('auto')
    ? 'auto'
    : modeLower.includes('cab') || modeLower.includes('car')
    ? 'cab'
    : 'bike';

  const htmlContent = useMemo(() => {
    // Starting driver position for 'arriving' is ~1.2 km away
    const driverStartLat = oLat + 0.0075;
    const driverStartLng = oLng - 0.0065;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; background: #F8FAFC; }
    
    .vehicle-pulse-marker {
      position: relative;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s ease;
    }
    
    .pulse-ring {
      position: absolute;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: rgba(10, 132, 255, 0.35);
      animation: pulseAnim 1.8s infinite ease-out;
    }

    @keyframes pulseAnim {
      0% { transform: scale(0.6); opacity: 0.9; }
      100% { transform: scale(1.4); opacity: 0; }
    }

    .vehicle-disc {
      position: relative;
      width: 38px;
      height: 38px;
      border-radius: 19px;
      background: #FFFFFF;
      border: 2.5px solid #0A84FF;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }

    .vehicle-disc.auto {
      border-color: #16A34A;
      background: #FEF08A;
    }

    .vehicle-disc.cab {
      border-color: #0F172A;
      background: #E0F2FE;
    }

    .pin-label {
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
    }
  </style>
</head>
<body>
  <div id="map"></div>

  <script>
    var isArriving = ${phase === 'arriving'};
    var vehicle = '${normalizedVehicle}';
    var originCoord = [${oLat}, ${oLng}];
    var destCoord = [${dLat}, ${dLng}];
    var driverStart = [${driverStartLat}, ${driverStartLng}];

    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      touchZoom: true
    });

    L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['0', '1', '2', '3']
    }).addTo(map);

    // Origin Pickup Pin
    var pickupIcon = L.divIcon({
      className: '',
      html: '<div style="position:relative; width:28px; height:34px;">' +
              '<div class="pin-label">Your Pickup</div>' +
              '<svg width="28" height="34" viewBox="0 0 30 36" fill="none">' +
                '<path d="M15 0C6.716 0 0 6.716 0 15C0 26.25 15 36 15 36C15 36 30 26.25 30 15C30 6.716 23.284 0 15 0Z" fill="#10B981"/>' +
                '<circle cx="15" cy="15" r="6" fill="#FFFFFF"/>' +
                '<circle cx="15" cy="15" r="3.5" fill="#047857"/>' +
              '</svg>' +
            '</div>',
      iconSize: [28, 34],
      iconAnchor: [14, 34]
    });
    L.marker(originCoord, { icon: pickupIcon }).addTo(map);

    // Destination Pin
    if (!isArriving) {
      var destIcon = L.divIcon({
        className: '',
        html: '<div style="position:relative; width:28px; height:34px;">' +
                '<div class="pin-label">Drop-off</div>' +
                '<svg width="28" height="34" viewBox="0 0 30 36" fill="none">' +
                  '<path d="M15 0C6.716 0 0 6.716 0 15C0 26.25 15 36 15 36C15 36 30 26.25 30 15C30 6.716 23.284 0 15 0Z" fill="#EF4444"/>' +
                  '<circle cx="15" cy="15" r="6" fill="#FFFFFF"/>' +
                  '<path d="M13 11L18 15L13 19V11Z" fill="#DC2626"/>' +
                '</svg>' +
              '</div>',
        iconSize: [28, 34],
        iconAnchor: [14, 34]
      });
      L.marker(destCoord, { icon: destIcon }).addTo(map);
    }

    // Vehicle SVG Art based on Mode (Bike / Auto / Cab)
    var vehicleSvg = '';
    var labelText = 'Pilot En Route';
    var discClass = 'vehicle-disc';

    if (vehicle === 'auto') {
      labelText = 'Auto Arriving';
      discClass += ' auto';
      vehicleSvg = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
                     '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10H8s-2.7.6-4.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"/>' +
                     '<circle cx="7" cy="17" r="2"/>' +
                     '<circle cx="17" cy="17" r="2"/>' +
                     '<path d="M5 10l2-6h10l2 6"/>' +
                   '</svg>';
    } else if (vehicle === 'cab') {
      labelText = 'Cab Arriving';
      discClass += ' cab';
      vehicleSvg = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0F172A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
                     '<rect x="3" y="11" width="18" height="8" rx="2"/>' +
                     '<path d="M5 11l2-5h10l2 5"/>' +
                     '<circle cx="7.5" cy="16.5" r="1.5"/>' +
                     '<circle cx="16.5" cy="16.5" r="1.5"/>' +
                   '</svg>';
    } else {
      // Default: Bike
      labelText = 'Bike Pilot En Route';
      vehicleSvg = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A84FF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' +
                     '<circle cx="18.5" cy="17.5" r="3.5"/>' +
                     '<circle cx="5.5" cy="17.5" r="3.5"/>' +
                     '<circle cx="15" cy="5" r="1"/>' +
                     '<path d="M12 17.5V14l-3-3 4-3 2 3h2"/>' +
                   '</svg>';
    }

    var movingIcon = L.divIcon({
      className: '',
      html: '<div class="vehicle-pulse-marker" id="vehicle-container">' +
              '<div class="pulse-ring"></div>' +
              '<div class="pin-label" id="vehicle-badge">' + labelText + '</div>' +
              '<div class="' + discClass + '">' +
                vehicleSvg +
              '</div>' +
            '</div>',
      iconSize: [50, 50],
      iconAnchor: [25, 25]
    });

    var startPt = isArriving ? driverStart : originCoord;
    var targetPt = isArriving ? originCoord : destCoord;

    var vehicleMarker = L.marker(startPt, { icon: movingIcon, zIndexOffset: 1000 }).addTo(map);

    // Route Polyline
    L.polyline([startPt, targetPt], {
      color: vehicle === 'auto' ? '#16A34A' : vehicle === 'cab' ? '#0F172A' : '#0A84FF',
      weight: 5,
      opacity: 0.85,
      dashArray: isArriving ? '8, 8' : null,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    var bounds = L.latLngBounds([startPt, targetPt]);
    map.fitBounds(bounds, { padding: [35, 35] });

    // Live Movement Animation
    var stepsCount = isArriving ? 12 : 18;
    var currentStep = 0;

    var interval = setInterval(function() {
      currentStep++;
      var progress = Math.min(1.0, currentStep / stepsCount);

      var curLat = startPt[0] + (targetPt[0] - startPt[0]) * progress;
      var curLng = startPt[1] + (targetPt[1] - startPt[1]) * progress;

      vehicleMarker.setLatLng([curLat, curLng]);

      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'step',
          progress: progress,
          percent: Math.round(progress * 100)
        }));
      }

      if (progress >= 1.0) {
        clearInterval(interval);
        var badge = document.getElementById('vehicle-badge');
        if (badge) badge.innerText = isArriving ? 'Arrived!' : 'Completed!';
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'completed',
            isArriving: isArriving
          }));
        }
      }
    }, 1200);
  </script>
</body>
</html>
    `;
  }, [phase, normalizedVehicle, oLat, oLng, dLat, dLng]);

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webView}
        scrollEnabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (onProgress) onProgress(data);
          } catch (e) {}
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F1F5F9',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
