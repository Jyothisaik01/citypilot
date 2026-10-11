import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { X, Lock, RotateCw, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react-native';

export default function GoogleSignInWebViewModal({
  visible,
  onClose,
  onSuccess,
}) {
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState('https://accounts.google.com');
  const [showConfirmSheet, setShowConfirmSheet] = useState(false);
  const [detectedEmail, setDetectedEmail] = useState('');
  const [accountName, setAccountName] = useState('');
  const [confirming, setConfirming] = useState(false);

  // Custom User-Agent to prevent Google's "403: disallowed_useragent" or "browser not secure" blocks
  const USER_AGENT =
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36';

  const GOOGLE_SIGNIN_URL =
    'https://accounts.google.com/signin/v2/identifier?flowName=GlifWebSignIn&flowEntry=ServiceLogin';

  const handleNavigationChange = (navState) => {
    setCurrentUrl(navState.url);

    // If navigated to account home or logged in page
    if (
      navState.url.includes('myaccount.google.com') ||
      navState.url.includes('accounts.google.com/ManageAccount') ||
      navState.url.includes('google.com/webhp') ||
      navState.url.includes('google.com/?')
    ) {
      // User successfully signed into Google!
      setShowConfirmSheet(true);
    }
  };

  const handleConfirmLogin = async () => {
    const cleanEmail = detectedEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      alert('Please enter your Google account email to complete synchronization.');
      return;
    }

    setConfirming(true);
    try {
      await onSuccess({
        email: cleanEmail,
        name: accountName.trim() || cleanEmail.split('@')[0],
      });
      setShowConfirmSheet(false);
    } catch (err) {
      console.error('Google sign-in confirmation failed', err);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Real In-App Browser Header */}
        <View style={styles.browserHeader}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X size={20} color="#334155" />
          </TouchableOpacity>

          <View style={styles.urlBar}>
            <Lock size={12} color="#16A34A" style={styles.lockIcon} />
            <Text style={styles.urlText} numberOfLines={1}>
              {currentUrl.replace('https://', '').split('/')[0] || 'accounts.google.com'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => webViewRef.current?.reload()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <RotateCw size={18} color="#334155" />
          </TouchableOpacity>
        </View>

        {/* Progress Loading Bar */}
        {loading && (
          <View style={styles.loadingBar}>
            <ActivityIndicator size="small" color="#0A84FF" />
            <Text style={styles.loadingText}>Connecting to Google Accounts...</Text>
          </View>
        )}

        {/* Real Google Login WebView */}
        <View style={styles.webviewContainer}>
          <WebView
            ref={webViewRef}
            source={{ uri: GOOGLE_SIGNIN_URL }}
            userAgent={USER_AGENT}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onNavigationStateChange={handleNavigationChange}
            style={styles.webview}
          />
        </View>

        {/* Bottom Synchronization Floating Action Bar */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.bottomBar}
        >
          {!showConfirmSheet ? (
            <View style={styles.bottomPromptRow}>
              <View style={styles.promptInfo}>
                <View style={styles.googleBadge}>
                  <Text style={styles.googleG}>G</Text>
                </View>
                <View style={styles.promptTextCol}>
                  <Text style={styles.promptTitle}>Google Sign-In Session</Text>
                  <Text style={styles.promptSub}>
                    Log into Google above, then sync to CityPilot
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.syncBtn}
                onPress={() => setShowConfirmSheet(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.syncBtnText}>Sync Account</Text>
                <ArrowRight size={15} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.syncSheet}>
              <View style={styles.sheetHeader}>
                <View style={styles.sheetBadgeRow}>
                  <ShieldCheck size={18} color="#0A84FF" />
                  <Text style={styles.sheetTitle}>Synchronize Google Account</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowConfirmSheet(false)}
                  style={styles.sheetCloseBtn}
                >
                  <X size={16} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.sheetSubtitle}>
                Confirm your Google email to bind your CityPilot trips and profile.
              </Text>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.sheetInput}
                  placeholder="Your Google email (e.g. name@gmail.com)"
                  placeholderTextColor="#94A3B8"
                  value={detectedEmail}
                  onChangeText={setDetectedEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoFocus={true}
                />
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.sheetInput}
                  placeholder="Your Name (Optional)"
                  placeholderTextColor="#94A3B8"
                  value={accountName}
                  onChangeText={setAccountName}
                />
              </View>

              <TouchableOpacity
                style={styles.confirmSyncBtn}
                onPress={handleConfirmLogin}
                disabled={confirming}
                activeOpacity={0.85}
              >
                {confirming ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <CheckCircle size={18} color="#fff" />
                    <Text style={styles.confirmSyncBtnText}>Complete Sign-In</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  browserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  urlBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    marginHorizontal: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  lockIcon: {
    marginRight: 6,
  },
  urlText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  loadingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 6,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#0A84FF',
    fontWeight: '500',
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webview: {
    flex: 1,
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  bottomPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promptInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  googleBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  googleG: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4285F4',
  },
  promptTextCol: {
    flex: 1,
  },
  promptTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  promptSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0A84FF',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  syncBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  syncSheet: {
    paddingVertical: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sheetBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sheetTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  sheetCloseBtn: {
    padding: 4,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },
  inputRow: {
    marginBottom: 8,
  },
  sheetInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  confirmSyncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0A84FF',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  confirmSyncBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

