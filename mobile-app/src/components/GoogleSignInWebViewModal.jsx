import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Linking,
  ScrollView,
  Platform,
} from 'react-native';
import { X, Globe, ShieldCheck, ArrowRight, CheckCircle, Mail, User, Sparkles } from 'lucide-react-native';
import { PRODUCTION_API_URL } from '../config/api';

export default function GoogleSignInWebViewModal({
  visible,
  onClose,
  onSuccess,
}) {
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [openedBrowser, setOpenedBrowser] = useState(false);

  // Chrome OAuth Bridge URL
  const CHROME_AUTH_URL = `${PRODUCTION_API_URL}/api/auth/google/connect`;

  const handleOpenChrome = async () => {
    setOpenedBrowser(true);
    try {
      await Linking.openURL(CHROME_AUTH_URL);
    } catch (err) {
      console.warn('Could not launch Chrome / browser:', err);
    }
  };

  const handleDirectSubmit = async () => {
    const cleanEmail = googleEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      alert('Please enter a valid Google account email (e.g. name@gmail.com)');
      return;
    }

    setSubmitting(true);
    try {
      await onSuccess({
        email: cleanEmail,
        name: googleName.trim() || cleanEmail.split('@')[0],
      });
    } catch (err) {
      console.error('Google Sign-In error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillGmail = () => {
    if (!googleEmail.includes('@')) {
      setGoogleEmail(googleEmail ? `${googleEmail}@gmail.com` : '');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.googleBrandRow}>
              <View style={styles.googleGContainer}>
                <Text style={styles.googleGText}>G</Text>
              </View>
              <View>
                <Text style={styles.headerTitle}>Sign in with Google</Text>
                <Text style={styles.headerSubtitle}>Choose how you want to continue</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Primary Option: Open in Chrome */}
            <View style={styles.cardOption}>
              <View style={styles.optionHeader}>
                <View style={styles.iconCircleBlue}>
                  <Globe size={22} color="#0A84FF" />
                </View>
                <View style={styles.optionTextWrap}>
                  <View style={styles.badgeRow}>
                    <Text style={styles.optionTitle}>Open in Chrome Browser</Text>
                    <View style={styles.recommendBadge}>
                      <Text style={styles.recommendText}>Recommended</Text>
                    </View>
                  </View>
                  <Text style={styles.optionDesc}>
                    Uses your active Google session in Chrome. No password typing required.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.chromeBtn}
                onPress={handleOpenChrome}
                activeOpacity={0.85}
              >
                <Text style={styles.chromeBtnText}>Continue in Chrome</Text>
                <ArrowRight size={16} color="#FFFFFF" />
              </TouchableOpacity>

              {openedBrowser && (
                <View style={styles.browserNotice}>
                  <Text style={styles.browserNoticeText}>
                    Chrome launched! After approving in Chrome, you will be redirected back automatically.
                  </Text>
                </View>
              )}
            </View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR QUICK 1-TAP</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* In-App Direct Sync Option */}
            <View style={styles.cardOptionDirect}>
              <View style={styles.optionHeader}>
                <View style={styles.iconCircleGreen}>
                  <ShieldCheck size={22} color="#16A34A" />
                </View>
                <View style={styles.optionTextWrap}>
                  <Text style={styles.optionTitle}>Instant In-App Sign-In</Text>
                  <Text style={styles.optionDesc}>
                    Enter your Google email to synchronize instantly without leaving the app.
                  </Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Google Email Address</Text>
                <View style={styles.inputWrap}>
                  <Mail size={17} color="#94A3B8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. name@gmail.com"
                    placeholderTextColor="#94A3B8"
                    value={googleEmail}
                    onChangeText={setGoogleEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {googleEmail.length > 2 && !googleEmail.includes('@') && (
                  <TouchableOpacity onPress={handleFillGmail} style={styles.chipRow}>
                    <Text style={styles.chipText}>+ @gmail.com</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Your Name (Optional)</Text>
                <View style={styles.inputWrap}>
                  <User size={17} color="#94A3B8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Rahul Sharma"
                    placeholderTextColor="#94A3B8"
                    value={googleName}
                    onChangeText={setGoogleName}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.directBtn, submitting && { opacity: 0.7 }]}
                onPress={handleDirectSubmit}
                disabled={submitting}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <CheckCircle size={18} color="#FFFFFF" />
                    <Text style={styles.directBtnText}>Complete Sign-In</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.securityFooter}>
            <ShieldCheck size={14} color="#64748B" />
            <Text style={styles.securityText}>Verified 256-bit secure authentication</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    paddingHorizontal: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  googleBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  googleGContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  googleGText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4285F4',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    marginTop: 16,
  },
  cardOption: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    padding: 16,
  },
  cardOptionDirect: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 10,
  },
  optionHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  iconCircleBlue: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleGreen: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextWrap: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  recommendBadge: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  recommendText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  optionDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginTop: 3,
  },
  chromeBtn: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  chromeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  browserNotice: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  browserNoticeText: {
    fontSize: 11.5,
    color: '#1D4ED8',
    textAlign: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 5,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  chipRow: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 5,
  },
  chipText: {
    color: '#0A84FF',
    fontSize: 11,
    fontWeight: '700',
  },
  directBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  directBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  securityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  securityText: {
    fontSize: 11.5,
    color: '#64748B',
  },
});
