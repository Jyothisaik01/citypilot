import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Sparkles } from 'lucide-react-native';

let oreoImage = null;
try {
  oreoImage = require('../../assets/images/oreo_ai_avatar.png');
} catch (e) {}

/**
 * Modern, sleek AI avatar for Oreo AI:
 * Apple Intelligence & Gemini-inspired glowing circular badge.
 */
export default function OreoAiAvatar({ size = 36, showOnlineBadge = false, useImage = true, style }) {
  const iconSize = Math.max(12, Math.round(size * 0.5));
  const borderRadius = Math.round(size / 2);

  return (
    <View
      style={[
        styles.outerRing,
        {
          width: size,
          height: size,
          borderRadius,
        },
        style,
      ]}
    >
      {useImage && oreoImage ? (
        <Image
          source={oreoImage}
          style={{ width: size, height: size, borderRadius }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.innerCore,
            {
              width: size - 4,
              height: size - 4,
              borderRadius: Math.round((size - 4) / 2),
            },
          ]}
        >
          <Sparkles size={iconSize} color="#38BDF8" />
        </View>
      )}

      {showOnlineBadge && <View style={styles.onlineDot} />}
    </View>
  );
}

const styles = StyleSheet.create({
  outerRing: {
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
    position: 'relative',
  },
  innerCore: {
    backgroundColor: '#0B132B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

