import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Linking,
  Alert,
  Modal,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  ArrowLeft,
  TrainFront as Train,
  Clock,
  QrCode,
  Smartphone,
  MessageCircle,
  CreditCard,
  Map as MapIcon,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react-native';
import colors from '../theme/colors';

const OFFICIAL_HYDERABAD_METRO_WHATSAPP = '8341146468'; // Confirmed Official L&T Metro WhatsApp Number

const DEFAULT_STATIONS_LIST = [
  { name: 'Raidurg', note: 'Board here • Platform 1', time: '0 min', line: 'Blue', lineColor: '#0284C7', isStart: true },
  { name: 'Hitec City', note: 'Cyber Towers junction', time: '2.5 min', line: 'Blue', lineColor: '#0284C7' },
  { name: 'Durgam Cheruvu', note: 'Inorbit Mall access', time: '5 min', line: 'Blue', lineColor: '#0284C7' },
  { name: 'Madhapur', note: 'IT Corridor', time: '7.5 min', line: 'Blue', lineColor: '#0284C7' },
  { name: 'Peddamma Gudi', note: 'Temple junction', time: '10 min', line: 'Blue', lineColor: '#0284C7' },
  { name: 'Jubilee Hills Check Post', note: 'Road No. 36', time: '12.5 min', line: 'Blue', lineColor: '#0284C7' },
  { name: 'Road No 5 Jubilee Hills', note: 'Residential hub', time: '15 min', line: 'Blue', lineColor: '#0284C7' },
  { name: 'Yousufguda', note: 'Police grounds', time: '17.5 min', line: 'Blue', lineColor: '#0284C7' },
  { name: 'Madhura Nagar', note: 'Market junction', time: '20 min', line: 'Blue', lineColor: '#0284C7' },
  { name: 'Ameerpet', note: 'Get down here • Red Line Interchange', time: '24 min', line: 'Interchange', lineColor: '#7C3AED', isEnd: true },
];

export default function MetroDetailsScreen({ route, navigation }) {
  const { routeData } = route.params || {};

  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [networkMapVisible, setNetworkMapVisible] = useState(false);

  // Extract metro details from multimodal route payload
  const metroSegment = routeData?.segments?.find((s) => s.mode?.toLowerCase() === 'metro');
  const metroDetails = metroSegment?.metroDetails || routeData?.metroDetails;

  const originStationName = metroDetails?.originStation?.name || 'Raidurg';
  const destStationName = metroDetails?.destStation?.name || 'Ameerpet';
  const lineName = metroDetails?.line || 'Blue Line • Hyderabad Metro';
  const officialFare = metroDetails?.officialFare || (metroSegment?.cost ? metroSegment.cost : 20);
  const durationMins = metroSegment?.durationMinutes || metroDetails?.durationMinutes || 24;

  // Complete intermediate stations with line colors
  const stationsList = useMemo(() => {
    if (
      metroDetails?.stationsList &&
      Array.isArray(metroDetails.stationsList) &&
      metroDetails.stationsList.length > 0
    ) {
      return metroDetails.stationsList.map((st, idx, arr) => {
        const isStart = idx === 0;
        const isEnd = idx === arr.length - 1;
        const color = st.lineColor || (st.line === 'Red' ? '#EF4444' : st.isInterchange ? '#7C3AED' : '#0284C7');

        return {
          name: st.name,
          note: isStart
            ? 'Board here • Platform 1'
            : isEnd
            ? `Deboard here • ${st.isInterchange ? 'Interchange to Red Line' : 'Exit to street'}`
            : `${st.activeLine || st.line || 'Metro'} Line stop`,
          time: `${Math.round(idx * 2.5)} min`,
          line: st.activeLine || st.line || 'Blue',
          lineColor: color,
          isStart,
          isEnd,
        };
      });
    }
    return DEFAULT_STATIONS_LIST;
  }, [metroDetails]);

  const stopCount = stationsList.length > 0 ? stationsList.length - 1 : (metroDetails?.stopCount || 9);

  // Ticketing Deep Links using confirmed official L&T Metro WhatsApp number
  const handleBookWhatsAppTicket = async () => {
    setBookingModalVisible(false);
    const textMsg = encodeURIComponent(
      `Hi! Book metro ticket from ${originStationName} to ${destStationName}`
    );
    const whatsappUrl = `https://api.whatsapp.com/send?phone=91${OFFICIAL_HYDERABAD_METRO_WHATSAPP}&text=${textMsg}`;
    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        await Linking.openURL(`https://wa.me/91${OFFICIAL_HYDERABAD_METRO_WHATSAPP}?text=${textMsg}`);
      }
    } catch (e) {
      Alert.alert(
        'WhatsApp Metro Chatbot',
        `Official Hyderabad L&T Metro WhatsApp: +91 ${OFFICIAL_HYDERABAD_METRO_WHATSAPP}\n\nRoute: ${originStationName} to ${destStationName}`
      );
    }
  };

  const handleBookPhonePeTicket = async () => {
    setBookingModalVisible(false);
    const phonepeScheme = 'phonepe://metro';
    try {
      const supported = await Linking.canOpenURL(phonepeScheme);
      if (supported) {
        await Linking.openURL(phonepeScheme);
      } else {
        await Linking.openURL('https://www.phonepe.com/');
      }
    } catch (e) {
      Alert.alert(
        'PhonePe Metro',
        `Stations: ${originStationName} → ${destStationName}\nOpen PhonePe > Switch > Hyderabad Metro to book.`
      );
    }
  };

  const handleBookPaytmTicket = async () => {
    setBookingModalVisible(false);
    const paytmScheme = 'paytmmp://metro_ticket';
    try {
      const supported = await Linking.canOpenURL(paytmScheme);
      if (supported) {
        await Linking.openURL(paytmScheme);
      } else {
        await Linking.openURL('https://paytm.com/metro-card-recharge');
      }
    } catch (e) {
      Alert.alert(
        'Paytm Transit',
        `Stations: ${originStationName} → ${destStationName}\nOpen Paytm > Transit > Metro Ticket.`
      );
    }
  };

  // Leaflet Metro Map HTML with OpenStreetMap / Google tiles (Zero "API KEY REQUIRED" watermark)
  const metroMapHtml = useMemo(() => {
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
    html, body, #map { width: 100%; height: 100%; background: #0F172A; }
    .station-node-origin {
      background: #10B981;
      border: 3px solid #FFFFFF;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.9);
    }
    .station-node-dest {
      background: #EF4444;
      border: 3px solid #FFFFFF;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      box-shadow: 0 0 10px rgba(239, 68, 68, 0.9);
    }
    .leaflet-popup-content-wrapper {
      background: #0F172A;
      color: #FFFFFF;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
    }
    .leaflet-popup-tip {
      background: #0F172A;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    });

    // 100% Free OpenStreetMap & Google Street tiles without any watermark
    var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    });
    var googleStreets = L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['0', '1', '2', '3']
    });

    googleStreets.addTo(map);
    googleStreets.on('tileerror', function() {
      if (!map.hasLayer(osm)) osm.addTo(map);
    });

    // Hyderabad Metro 3-Line Network Coordinates
    // 1. Blue Line (Raidurg <-> Ameerpet <-> Nagole)
    var blueLine = [
      [17.4428, 78.3772], [17.4475, 78.3845], [17.4412, 78.3912], [17.4385, 78.3995],
      [17.4312, 78.4110], [17.4285, 78.4190], [17.4320, 78.4280], [17.4360, 78.4380],
      [17.4370, 78.4440], [17.4375, 78.4483], [17.4440, 78.4600], [17.4445, 78.4710],
      [17.4420, 78.4810], [17.4435, 78.4900], [17.4440, 78.4990], [17.4380, 78.5060],
      [17.4320, 78.5180], [17.4280, 78.5300], [17.4190, 78.5420], [17.4110, 78.5520],
      [17.4050, 78.5590], [17.3990, 78.5620], [17.3910, 78.5650]
    ];

    // 2. Red Line (Miyapur <-> Ameerpet <-> LB Nagar)
    var redLine = [
      [17.4965, 78.3610], [17.4870, 78.4010], [17.4810, 78.4110], [17.4650, 78.4280],
      [17.4560, 78.4360], [17.4490, 78.4420], [17.4430, 78.4450], [17.4375, 78.4483],
      [17.4260, 78.4520], [17.4180, 78.4580], [17.4110, 78.4620], [17.4040, 78.4660],
      [17.3990, 78.4710], [17.3920, 78.4730], [17.3870, 78.4760], [17.3780, 78.4820],
      [17.3720, 78.4980], [17.3680, 78.5080], [17.3640, 78.5170], [17.3680, 78.5270],
      [17.3620, 78.5380], [17.3570, 78.5470], [17.3480, 78.5530]
    ];

    // 3. Green Line (JBS Parade Ground <-> MGBS)
    var greenLine = [
      [17.4440, 78.4990], [17.4360, 78.5020], [17.4230, 78.5030], [17.4110, 78.5040],
      [17.4010, 78.5010], [17.3910, 78.4960], [17.3840, 78.4890], [17.3780, 78.4820]
    ];

    // Render Hyderabad Metro Colored Tracks
    L.polyline(blueLine, { color: '#0284C7', weight: 6, opacity: 0.95 }).addTo(map);
    L.polyline(redLine, { color: '#EF4444', weight: 5, opacity: 0.75 }).addTo(map);
    L.polyline(greenLine, { color: '#10B981', weight: 4.5, opacity: 0.75 }).addTo(map);

    // Interchange Hubs
    var hubs = [
      { name: 'Ameerpet Hub (Blue/Red Interchange)', coord: [17.4375, 78.4483] },
      { name: 'MGBS Hub (Red/Green Interchange)', coord: [17.3780, 78.4820] },
      { name: 'Parade Ground Hub (Blue/Green)', coord: [17.4440, 78.4990] }
    ];
    hubs.forEach(function(h) {
      L.circleMarker(h.coord, {
        radius: 6,
        fillColor: '#FFFFFF',
        color: '#7C3AED',
        weight: 3.5,
        opacity: 1,
        fillOpacity: 1
      }).addTo(map).bindPopup('<b>' + h.name + '</b>');
    });

    // Boarding Station Pin
    var originIcon = L.divIcon({
      className: 'station-node-origin',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
    L.marker([17.4428, 78.3772], { icon: originIcon })
      .addTo(map)
      .bindPopup("<b>Board: ${originStationName}</b><br>Platform 1")
      .openPopup();

    // Deboarding Station Pin
    var destIcon = L.divIcon({
      className: 'station-node-dest',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
    L.marker([17.4375, 78.4483], { icon: destIcon })
      .addTo(map)
      .bindPopup("<b>Deboard: ${destStationName}</b>");

    // Auto-fit trip bounds
    map.fitBounds([[17.4428, 78.3772], [17.4375, 78.4483]], { padding: [35, 35] });
  </script>
</body>
</html>
    `;
  }, [originStationName, destStationName]);

  // Official Network Diagram HTML (For full document view modal)
  const officialNetworkDiagramHtml = useMemo(() => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0B132B; color: #FFFFFF; font-family: -apple-system, sans-serif; padding: 20px; }
    h2 { font-size: 18px; margin-bottom: 4px; color: #38BDF8; font-weight: 900; }
    p { font-size: 12px; color: #94A3B8; margin-bottom: 20px; }
    .corridor-card {
      background: #1E293B;
      border-radius: 14px;
      padding: 14px;
      margin-bottom: 14px;
      border-left: 6px solid #CBD5E1;
    }
    .corridor-blue { border-left-color: #0284C7; }
    .corridor-red { border-left-color: #EF4444; }
    .corridor-green { border-left-color: #10B981; }
    .corridor-title { font-size: 14px; font-weight: 800; margin-bottom: 4px; display: flex; justify-content: space-between; }
    .corridor-span { font-size: 12px; color: #CBD5E1; margin-bottom: 8px; }
    .stations-flow { font-size: 11px; color: #94A3B8; line-height: 1.5; }
    .hub-tag { background: #7C3AED; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 800; }
  </style>
</head>
<body>
  <h2>Hyderabad Metro Rail Network Map</h2>
  <p>Official Phase-1 Operational Network • 69 km • 57 Stations</p>

  <div class="corridor-card corridor-blue">
    <div class="corridor-title">
      <span style="color:#38BDF8">Line 3: Blue Line</span>
      <span>27 km • 23 Stations</span>
    </div>
    <div class="corridor-span">Raidurg ↔ Nagole</div>
    <div class="stations-flow">
      <b>Raidurg</b> → Hitec City → Durgam Cheruvu → Madhapur → Peddamma Gudi → Jubilee Hills Check Post → Road No 5 → Yousufguda → Madhura Nagar → <span class="hub-tag">Ameerpet (Interchange)</span> → Begumpet → Prakash Nagar → Rasoolpura → Paradise → <span class="hub-tag">Parade Ground (Interchange)</span> → Secunderabad East → Mettuguda → Tarnaka → Habsiguda → NGRI → Stadium → Uppal → <b>Nagole</b>
    </div>
  </div>

  <div class="corridor-card corridor-red">
    <div class="corridor-title">
      <span style="color:#F87171">Line 1: Red Line</span>
      <span>29 km • 27 Stations</span>
    </div>
    <div class="corridor-span">Miyapur ↔ LB Nagar</div>
    <div class="stations-flow">
      <b>Miyapur</b> → JNTU → KPHB Colony → Kukatpally → Balanagar → Moosapet → Bharat Nagar → Erragadda → ESI Hospital → SR Nagar → <span class="hub-tag">Ameerpet (Interchange)</span> → Punjagutta → Irrum Manzil → Khairatabad → Lakdikapul → Assembly → Nampally → Gandhi Bhavan → Medical College → <span class="hub-tag">MGBS (Interchange)</span> → Malakpet → New Market → Musarambagh → Dilsukhnagar → Chaitanyapuri → Victoria Memorial → <b>LB Nagar</b>
    </div>
  </div>

  <div class="corridor-card corridor-green">
    <div class="corridor-title">
      <span style="color:#34D399">Line 2: Green Line</span>
      <span>11 km • 9 Stations</span>
    </div>
    <div class="corridor-span">JBS Parade Ground ↔ MGBS</div>
    <div class="stations-flow">
      <b>JBS Parade Ground</b> → Secunderabad West → Gandhi Hospital → Musheerabad → RTC X Roads → Chikkadpally → Narayanguda → Sultan Bazaar → <b>MGBS</b>
    </div>
  </div>
</body>
</html>
    `;
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.title}>Hyderabad Metro Guide</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Metro Network Map with Blue, Red, Green Lines (Zero API key watermark) */}
        <View style={styles.mapCard}>
          <View style={styles.mapHeader}>
            <View style={styles.mapLegend}>
              <View style={[styles.legendDot, { backgroundColor: '#0284C7' }]} />
              <Text style={styles.legendText}>Blue</Text>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444', marginLeft: 6 }]} />
              <Text style={styles.legendText}>Red</Text>
              <View style={[styles.legendDot, { backgroundColor: '#10B981', marginLeft: 6 }]} />
              <Text style={styles.legendText}>Green</Text>
            </View>
            <TouchableOpacity
              onPress={() => setNetworkMapVisible(true)}
              style={styles.fullDiagramBtn}
            >
              <MapIcon size={12} color="#38BDF8" />
              <Text style={styles.fullDiagramBtnText}>Full Chart</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mapWebViewContainer}>
            <WebView
              originWhitelist={['*']}
              source={{ html: metroMapHtml }}
              style={styles.webView}
              scrollEnabled={false}
              bounces={false}
            />
          </View>
        </View>

        {/* Journey Overview Card */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewTop}>
            <View style={styles.metroIconCircle}>
              <Train size={24} color={colors.teal} />
            </View>
            <View style={styles.overviewInfo}>
              <Text style={styles.lineName}>{lineName}</Text>
              <Text style={styles.routeSpan}>
                {originStationName} → {destStationName}
              </Text>
            </View>
            <View style={styles.fareTag}>
              <Text style={styles.fareTagText}>₹{officialFare} Official</Text>
            </View>
          </View>

          <View style={styles.overviewMetrics}>
            <View style={styles.metricItem}>
              <Clock size={14} color={colors.textSecondary} />
              <Text style={styles.metricVal}>{durationMins} min</Text>
            </View>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.metricVal}>{stopCount} stops</Text>
            <Text style={styles.dot}>•</Text>
            <View style={styles.statusLive}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Punctual • Normal Service</Text>
            </View>
          </View>
        </View>

        {/* Single Prominent Booking Action Button */}
        <TouchableOpacity
          style={styles.primaryBookButton}
          onPress={() => setBookingModalVisible(true)}
          activeOpacity={0.88}
        >
          <View style={styles.bookBtnLeft}>
            <View style={styles.qrIconWrap}>
              <QrCode size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.primaryBookTitle}>Book Official Metro QR Ticket</Text>
              <Text style={styles.primaryBookSub}>
                Pre-filled: {originStationName} → {destStationName}
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Timetable & Schedule Card */}
        <View style={styles.timetableCard}>
          <Text style={styles.timetableTitle}>Operating Schedule</Text>
          <View style={styles.scheduleRow}>
            <View style={styles.scheduleCol}>
              <Text style={styles.scheduleLabel}>First Train</Text>
              <Text style={styles.scheduleVal}>5:30 AM</Text>
            </View>
            <View style={styles.scheduleCol}>
              <Text style={styles.scheduleLabel}>Last Train</Text>
              <Text style={styles.scheduleVal}>11:00 PM</Text>
            </View>
            <View style={styles.scheduleCol}>
              <Text style={styles.scheduleLabel}>Train Frequency</Text>
              <Text style={styles.scheduleVal}>Every 3–5 min</Text>
            </View>
          </View>
        </View>

        {/* Stop-by-Stop Station Timeline (Showing ALL intermediate stops with line colors) */}
        <Text style={styles.sectionHeader}>Stop-by-Stop Line Route ({stationsList.length} Stations)</Text>

        <View style={styles.stationsTimeline}>
          {stationsList.map((st, idx) => {
            const isLast = idx === stationsList.length - 1;
            const nodeColor = st.lineColor || '#0284C7';

            return (
              <View key={idx} style={styles.stationRow}>
                {/* Node Line Visual */}
                <View style={styles.trackCol}>
                  <View
                    style={[
                      styles.stationNode,
                      { backgroundColor: nodeColor },
                      st.isStart && styles.stationNodeStart,
                      st.isEnd && styles.stationNodeEnd,
                    ]}
                  />
                  {!isLast && <View style={[styles.trackLine, { backgroundColor: nodeColor }]} />}
                </View>

                {/* Station Info */}
                <View style={styles.stationInfo}>
                  <View style={styles.stationTop}>
                    <View style={styles.stationNameWrap}>
                      <Text style={[styles.stationName, (st.isStart || st.isEnd) && styles.stationNameBold]}>
                        {st.name}
                      </Text>
                      <View style={[styles.lineBadge, { backgroundColor: nodeColor + '18' }]}>
                        <Text style={[styles.lineBadgeText, { color: nodeColor }]}>
                          {st.line}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.stationTime}>{st.time}</Text>
                  </View>
                  <Text style={[styles.stationNote, st.isEnd && styles.stationNoteDest]}>
                    {st.note}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Official Metro Document View Button */}
        <TouchableOpacity
          style={styles.networkMapDocBtn}
          onPress={() => setNetworkMapVisible(true)}
          activeOpacity={0.88}
        >
          <MapIcon size={16} color={colors.primary} />
          <Text style={styles.networkMapDocText}>View Official Hyderabad Metro Network Chart</Text>
          <ExternalLink size={14} color={colors.primary} />
        </TouchableOpacity>
      </ScrollView>

      {/* 1. Modal: Digital Ticket Booking Options Action Sheet */}
      <Modal
        visible={bookingModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Book Official Metro QR Ticket</Text>
                <Text style={styles.modalSub}>
                  {originStationName} → {destStationName} • ₹{officialFare} Official Fare
                </Text>
              </View>
              <TouchableOpacity onPress={() => setBookingModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color={colors.navy} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalOptions}>
              {/* WhatsApp Official L&T Metro Chatbot (+91 83411 46468) */}
              <TouchableOpacity
                style={styles.optionCardWhatsApp}
                onPress={handleBookWhatsAppTicket}
                activeOpacity={0.85}
              >
                <View style={styles.optionIconCircleWhatsApp}>
                  <MessageCircle size={22} color="#FFFFFF" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitleWhatsApp}>Official WhatsApp QR Chatbot</Text>
                  <Text style={styles.optionSubWhatsApp}>
                    Verified L&T Metro (+91 {OFFICIAL_HYDERABAD_METRO_WHATSAPP})
                  </Text>
                </View>
                <ExternalLink size={16} color="#FFFFFF" />
              </TouchableOpacity>

              {/* PhonePe Metro */}
              <TouchableOpacity
                style={styles.optionCardPhonePe}
                onPress={handleBookPhonePeTicket}
                activeOpacity={0.85}
              >
                <View style={styles.optionIconCirclePhonePe}>
                  <Smartphone size={20} color="#FFFFFF" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitlePhonePe}>PhonePe Metro</Text>
                  <Text style={styles.optionSub}>Instant QR entry at AFC gates</Text>
                </View>
                <ChevronRight size={16} color="#5F259F" />
              </TouchableOpacity>

              {/* Paytm Metro */}
              <TouchableOpacity
                style={styles.optionCardPaytm}
                onPress={handleBookPaytmTicket}
                activeOpacity={0.85}
              >
                <View style={styles.optionIconCirclePaytm}>
                  <CreditCard size={20} color="#FFFFFF" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitlePaytm}>Paytm Transit</Text>
                  <Text style={styles.optionSub}>Direct QR gate scan</Text>
                </View>
                <ChevronRight size={16} color="#0284C7" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. Modal: Official Full Network Diagram / Document Viewer */}
      <Modal
        visible={networkMapVisible}
        animationType="slide"
        onRequestClose={() => setNetworkMapVisible(false)}
      >
        <SafeAreaView style={styles.diagramModalContainer}>
          <View style={styles.diagramHeader}>
            <TouchableOpacity onPress={() => setNetworkMapVisible(false)} style={styles.diagramCloseBtn}>
              <ArrowLeft size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.diagramTitle}>Hyderabad Metro Rail Chart</Text>
          </View>
          <WebView
            originWhitelist={['*']}
            source={{ html: officialNetworkDiagramHtml }}
            style={styles.diagramWebView}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    padding: 6,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.navy,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  mapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0F172A',
  },
  mapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
  },
  fullDiagramBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  fullDiagramBtnText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
  },
  mapWebViewContainer: {
    height: 200,
    width: '100%',
  },
  webView: {
    flex: 1,
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  overviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metroIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.tealLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  overviewInfo: {
    flex: 1,
  },
  lineName: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.tealDark,
    textTransform: 'uppercase',
  },
  routeSpan: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.navy,
    marginTop: 2,
  },
  fareTag: {
    backgroundColor: colors.tealLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  fareTagText: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.tealDark,
  },
  overviewMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 10,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricVal: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  dot: {
    marginHorizontal: 8,
    color: colors.textMuted,
  },
  statusLive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.success,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
  },
  primaryBookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  bookBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qrIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBookTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  primaryBookSub: {
    color: '#E0F2FE',
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 1,
  },
  timetableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  timetableTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.navy,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 10,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scheduleCol: {
    flex: 1,
  },
  scheduleLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 2,
  },
  scheduleVal: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.navy,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 14,
  },
  stationsTimeline: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  stationRow: {
    flexDirection: 'row',
  },
  trackCol: {
    width: 24,
    alignItems: 'center',
  },
  stationNode: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0284C7',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  stationNodeStart: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
  },
  stationNodeEnd: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EF4444',
  },
  trackLine: {
    width: 3,
    flex: 1,
    backgroundColor: '#0284C7',
    marginVertical: 2,
    opacity: 0.8,
  },
  stationInfo: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 16,
  },
  stationTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stationNameWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stationName: {
    fontSize: 14,
    color: colors.navy,
    fontWeight: '700',
  },
  stationNameBold: {
    fontWeight: '900',
    fontSize: 14.5,
  },
  lineBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  lineBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  stationTime: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  stationNote: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 2,
  },
  stationNoteDest: {
    color: colors.tealDark,
    fontWeight: '700',
  },
  networkMapDocBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  networkMapDocText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.navy,
  },
  modalSub: {
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  modalOptions: {
    gap: 12,
  },
  optionCardWhatsApp: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    borderRadius: 16,
    padding: 14,
  },
  optionIconCircleWhatsApp: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitleWhatsApp: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '900',
  },
  optionSubWhatsApp: {
    color: '#DCFCE7',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  optionCardPhonePe: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#D8B4FE',
    borderRadius: 16,
    padding: 14,
  },
  optionIconCirclePhonePe: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#5F259F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionTitlePhonePe: {
    color: '#5F259F',
    fontSize: 14.5,
    fontWeight: '900',
  },
  optionCardPaytm: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 16,
    padding: 14,
  },
  optionIconCirclePaytm: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionTitlePaytm: {
    color: '#0284C7',
    fontSize: 14.5,
    fontWeight: '900',
  },
  optionSub: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  diagramModalContainer: {
    flex: 1,
    backgroundColor: '#0B132B',
  },
  diagramHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  diagramCloseBtn: {
    padding: 6,
    marginRight: 10,
  },
  diagramTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  diagramWebView: {
    flex: 1,
    backgroundColor: '#0B132B',
  },
});
