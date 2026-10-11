import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Real3rdPartyMap from './Real3rdPartyMap';
import colors from '../theme/colors';

const { width } = Dimensions.get('window');
const MAP_HEIGHT = 290;

export default function DynamicRouteMap({ route, origin, destination, driverLocation, onStartNavigation, style }) {
  return (
    <View style={[styles.mapContainer, style]}>
      <Real3rdPartyMap
        origin={origin || { name: 'Gachibowli', lat: 17.4401, lng: 78.3489 }}
        destination={destination || { name: 'Ameerpet', lat: 17.4375, lng: 78.4483 }}
        route={route}
        driverLocation={driverLocation}
        height={MAP_HEIGHT}
        interactive={true}
        showLegend={true}
        style={{ height: MAP_HEIGHT, borderRadius: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: MAP_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E8ECEF',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
