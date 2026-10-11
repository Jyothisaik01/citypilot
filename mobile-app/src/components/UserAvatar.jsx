import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { getUserInitials } from '../utils/userUtils';
import Images from '../assets/images';

export default function UserAvatar({
  name = 'Anusha Maram',
  size = 36,
  backgroundColor = '#0A84FF',
  textColor = '#FFFFFF',
  useAppIcon = false,
  style,
}) {
  const borderRadius = Math.round(size / 2);

  if (useAppIcon) {
    return (
      <View
        style={[
          styles.avatarContainer,
          {
            width: size,
            height: size,
            borderRadius,
            overflow: 'hidden',
          },
          style,
        ]}
      >
        <Image
          source={Images.appIcon}
          style={{ width: size, height: size }}
          resizeMode="cover"
        />
      </View>
    );
  }

  const initials = getUserInitials(name);
  const fontSize = Math.max(10, Math.round(size * 0.42));

  return (
    <View
      style={[
        styles.avatarContainer,
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.initialsText,
          {
            fontSize,
            color: textColor,
          },
        ]}
        numberOfLines={1}
      >
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  initialsText: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

