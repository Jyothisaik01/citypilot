import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import {
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Info,
  Footprints,
  Zap,
} from 'lucide-react-native';
import colors from '../theme/colors';

const { width } = Dimensions.get('window');

/**
 * Universal Custom Branded Popup Modal
 * Replaces system-native Alert.alert with beautiful CityPilot-themed dialogs.
 */
export default function CustomPopupModal({
  visible,
  type = 'info', // 'confirm' | 'info' | 'success' | 'danger'
  title = 'Notification',
  message = '',
  icon: CustomIcon,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) {
  if (!visible) return null;

  // Determine Icon & Colors based on type
  let IconComponent = CustomIcon;
  let iconBg = '#EFF6FF';
  let iconColor = colors.primary;
  let confirmBtnBg = colors.primary;

  if (!IconComponent) {
    if (type === 'danger' || title.toLowerCase().includes('sign out') || title.toLowerCase().includes('log out')) {
      IconComponent = LogOut;
      iconBg = '#FEF2F2';
      iconColor = '#EF4444';
      confirmBtnBg = '#EF4444';
    } else if (type === 'success' || title.toLowerCase().includes('success') || title.toLowerCase().includes('updated')) {
      IconComponent = CheckCircle2;
      iconBg = '#ECFDF5';
      iconColor = '#059669';
      confirmBtnBg = colors.primary;
    } else if (title.toLowerCase().includes('mode')) {
      IconComponent = Zap;
      iconBg = '#EFF6FF';
      iconColor = colors.primary;
    } else if (title.toLowerCase().includes('walk')) {
      IconComponent = Footprints;
      iconBg = '#F0FDF4';
      iconColor = colors.teal;
    } else {
      IconComponent = Info;
      iconBg = '#EFF6FF';
      iconColor = colors.primary;
    }
  }

  const isConfirmType = type === 'confirm' || Boolean(onCancel && onConfirm);

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onCancel || onConfirm}>
      <TouchableWithoutFeedback onPress={onCancel || onConfirm}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {/* Icon Circle */}
              <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
                <IconComponent size={28} color={iconColor} />
              </View>

              {/* Title & Description */}
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              {/* Buttons */}
              <View style={styles.buttonRow}>
                {isConfirmType && onCancel ? (
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={onCancel}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelBtnText}>{cancelText}</Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  style={[
                    styles.confirmBtn,
                    { backgroundColor: confirmBtnBg },
                    !isConfirmType && { flex: 1 },
                  ]}
                  onPress={onConfirm}
                  activeOpacity={0.8}
                >
                  <Text style={styles.confirmBtnText}>{confirmText}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: Math.min(width - 48, 380),
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.navy,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 13.5,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

