import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
  Linking,
  Modal,
} from 'react-native';
import {
  Phone,
  Mail,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  CircleCheck as CheckCircle2,
  X,
  Globe,
  ChevronDown,
  Search,
  Check,
} from 'lucide-react-native';
import colors from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import Images from '../assets/images';
import GoogleSignInWebViewModal from '../components/GoogleSignInWebViewModal';

const COUNTRIES = [
  { code: 'IN', dialCode: '+91', flag: '🇮🇳', name: 'India', maxLen: 10 },
  { code: 'US', dialCode: '+1', flag: '🇺🇸', name: 'United States', maxLen: 10 },
  { code: 'GB', dialCode: '+44', flag: '🇬🇧', name: 'United Kingdom', maxLen: 10 },
  { code: 'AE', dialCode: '+971', flag: '🇦🇪', name: 'United Arab Emirates', maxLen: 9 },
  { code: 'SG', dialCode: '+65', flag: '🇸🇬', name: 'Singapore', maxLen: 8 },
  { code: 'CA', dialCode: '+1', flag: '🇨🇦', name: 'Canada', maxLen: 10 },
  { code: 'AU', dialCode: '+61', flag: '🇦🇺', name: 'Australia', maxLen: 9 },
  { code: 'SA', dialCode: '+966', flag: '🇸🇦', name: 'Saudi Arabia', maxLen: 9 },
  { code: 'DE', dialCode: '+49', flag: '🇩🇪', name: 'Germany', maxLen: 11 },
  { code: 'MY', dialCode: '+60', flag: '🇲🇾', name: 'Malaysia', maxLen: 10 },
];

export default function LoginScreen({ navigation }) {
  const { sendOtp, verifyOtp, sendEmailOtp, verifyEmailOtp, loginWithGoogle, loginWithToken } = useAuth();

  const [authMethod, setAuthMethod] = useState('phone'); // 'phone' | 'email'

  // Country code state (India default, real country picker)
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);

  // Phone states (Pure digits only, country code separated!)
  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState('whatsapp'); // 'whatsapp' | 'sms'
  const [phoneOtpStep, setPhoneOtpStep] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');

  // Email states (NO fake pre-filled emails or patched OTPs!)
  const [email, setEmail] = useState('');
  const [emailOtpStep, setEmailOtpStep] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');

  // Google Modal states
  const [googleModalVisible, setGoogleModalVisible] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Handle OAuth Deep Link callback from Chrome (citypilot://auth?token=...&email=...)
  useEffect(() => {
    const handleAuthUrl = async (url) => {
      if (!url || !url.startsWith('citypilot://auth')) return;
      try {
        const queryString = url.includes('?') ? url.split('?')[1] : '';
        if (!queryString) return;
        const pairs = queryString.split('&');
        const params = {};
        pairs.forEach((p) => {
          const [k, v] = p.split('=');
          if (k) params[k] = decodeURIComponent(v || '');
        });

        if (params.token && params.email) {
          setLoading(true);
          setGoogleModalVisible(false);
          const isKnown = params.isKnownUser === 'true';
          const userObj = {
            email: params.email,
            name: params.name || params.email.split('@')[0],
          };

          await loginWithToken(params.token, userObj, isKnown);
          setLoading(false);

          if (isKnown) {
            navigation.replace('LocationPermission');
          } else {
            navigation.replace('CompleteProfile', {
              email: params.email,
              name: params.name || '',
            });
          }
        }
      } catch (err) {
        console.warn('Error processing auth deep link:', err);
        setLoading(false);
      }
    };

    Linking.getInitialURL().then(handleAuthUrl);

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleAuthUrl(url);
    });

    return () => {
      subscription.remove();
    };
  }, [navigation, loginWithToken]);

  // Reset errors and infos on method switch
  const handleSwitchMethod = (method) => {
    setAuthMethod(method);
    setErrorMsg('');
    setInfoMsg('');
    setPhoneOtpStep(false);
    setEmailOtpStep(false);
    setPhoneOtp('');
    setEmailOtp('');
    setShowNotificationBanner(false);
  };

  // 1. Send Phone OTP
  const handleSendPhoneOtp = async () => {
    const rawDigits = phone.replace(/\D/g, '');
    if (!rawDigits || rawDigits.length < 7) {
      setErrorMsg(`Please enter a valid mobile number for ${selectedCountry.name}`);
      return;
    }
    const fullPhone = `${selectedCountry.dialCode}${rawDigits}`;
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);

    try {
      const res = await sendOtp(fullPhone, channel);
      setLoading(false);

      if (res && res.success) {
        setPhoneOtpStep(true);
        setPhoneOtp('');
        setDevOtp(res.devOtp || '');
        setShowNotificationBanner(true);
        setInfoMsg(res.message || `Verification code sent to ${selectedCountry.dialCode} ${rawDigits}. Please enter the 6-digit code below.`);
      } else {
        setErrorMsg(res?.message || 'Failed to send verification code. Please check your number.');
      }
    } catch (e) {
      setLoading(false);
      setErrorMsg(e.message || 'Network error occurred while sending OTP');
    }
  };

  // 2. Verify Phone OTP
  const handleVerifyPhoneOtp = async () => {
    const cleanOtp = phoneOtp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setErrorMsg('Please enter the 6-digit OTP code sent to your mobile');
      return;
    }
    const rawDigits = phone.replace(/\D/g, '');
    const fullPhone = `${selectedCountry.dialCode}${rawDigits}`;
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await verifyOtp(fullPhone, cleanOtp);
      setLoading(false);

      if (res && res.success) {
        // If known existing user with complete profile, proceed to app!
        // Otherwise, ask mandatory onboarding questions (name, gender, email)!
        if (res.isKnownUser) {
          navigation.replace('LocationPermission');
        } else {
          navigation.replace('CompleteProfile', { phone: fullPhone });
        }
      } else {
        setErrorMsg(res?.message || 'Invalid or expired OTP code. Please try again.');
      }
    } catch (e) {
      setLoading(false);
      setErrorMsg(e.message || 'Verification failed');
    }
  };

  // 3. Send Email OTP (Real-time Brevo HTTPS API)
  const handleSendEmailOtp = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);

    try {
      const res = await sendEmailOtp(cleanEmail);
      setLoading(false);

      if (res && res.success) {
        setEmailOtpStep(true);
        setEmailOtp('');
        setDevOtp(res.devOtp || '');
        setShowNotificationBanner(true);
        setInfoMsg(`Verification code sent to ${cleanEmail}. Please check your inbox.`);
      } else {
        setErrorMsg(res?.message || 'Failed to send verification code. Please check your email.');
      }
    } catch (e) {
      setLoading(false);
      setErrorMsg(e.message || 'Network error occurred');
    }
  };

  // 4. Verify Email OTP
  const handleVerifyEmailOtp = async () => {
    const cleanOtp = emailOtp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setErrorMsg('Please enter the 6-digit code received in your email');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await verifyEmailOtp(email.trim().toLowerCase(), cleanOtp);
      setLoading(false);

      if (res && res.success) {
        if (res.isKnownUser) {
          navigation.replace('LocationPermission');
        } else {
          navigation.replace('CompleteProfile', { email: email.trim().toLowerCase() });
        }
      } else {
        setErrorMsg(res?.message || 'Invalid or expired email verification code.');
      }
    } catch (e) {
      setLoading(false);
      setErrorMsg(e.message || 'Verification failed');
    }
  };

  // 5. Submit Real Google Sign-In
  const handleGoogleSuccess = async ({ email: cleanEmail, name: cleanName }) => {
    setGoogleModalVisible(false);
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await loginWithGoogle({
        email: cleanEmail,
        name: cleanName || cleanEmail.split('@')[0],
      });
      setLoading(false);

      if (res && res.success) {
        if (res.isKnownUser) {
          navigation.replace('LocationPermission');
        } else {
          navigation.replace('CompleteProfile', {
            email: cleanEmail,
            name: cleanName,
          });
        }
      } else {
        setErrorMsg(res?.message || 'Google sign-in failed');
      }
    } catch (e) {
      setLoading(false);
      setErrorMsg(e.message || 'Google sign-in failed');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Brand Header */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/branding/citypilot_pin_icon.png')}
            style={styles.brandPin}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome to CityPilot</Text>
          <Text style={styles.subtitle}>
            Find the smartest, fastest, and cheapest way to navigate Hyderabad.
          </Text>
        </View>

        {/* Auth Method Switcher */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, authMethod === 'phone' && styles.tabActive]}
            onPress={() => handleSwitchMethod('phone')}
          >
            <Phone size={16} color={authMethod === 'phone' ? colors.primary : colors.textMuted} />
            <Text style={[styles.tabText, authMethod === 'phone' && styles.tabTextActive]}>
              Mobile OTP
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, authMethod === 'email' && styles.tabActive]}
            onPress={() => handleSwitchMethod('email')}
          >
            <Mail size={16} color={authMethod === 'email' ? colors.primary : colors.textMuted} />
            <Text style={[styles.tabText, authMethod === 'email' && styles.tabTextActive]}>
              Email OTP (Brevo)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card Body */}
        <View style={styles.card}>
          {errorMsg ? (
            <View style={styles.alertError}>
              <Text style={styles.alertErrorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {infoMsg ? (
            <View style={styles.alertInfo}>
              <CheckCircle2 size={16} color={colors.teal} />
              <Text style={styles.alertInfoText}>{infoMsg}</Text>
            </View>
          ) : null}

          {/* ================= PHONE FLOW ================= */}
          {authMethod === 'phone' ? (
            !phoneOtpStep ? (
              // Step 1: Mobile Number Input (Exact Image 1 Design)
              <View>
                <Text style={styles.mobileSectionTitle}>Enter your mobile number</Text>
                <Text style={styles.mobileSectionSubtitle}>
                  We'll send you a one-time password (OTP) to continue.
                </Text>

                {/* Country Code Pill Container with Divider */}
                <View style={styles.mobilePillContainer}>
                  <TouchableOpacity
                    style={styles.countryBtn}
                    onPress={() => setCountryPickerVisible(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.countryFlagText}>{selectedCountry.flag}</Text>
                    <Text style={styles.countryDialCodeText}>{selectedCountry.dialCode}</Text>
                    <ChevronDown size={14} color="#64748B" />
                  </TouchableOpacity>

                  <View style={styles.mobileInputDivider} />

                  <TextInput
                    style={styles.mobileDigitsInput}
                    value={phone}
                    onChangeText={(txt) => setPhone(txt.replace(/\D/g, ''))}
                    placeholder="Enter mobile number"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={selectedCountry.maxLen || 12}
                    autoFocus={false}
                  />
                </View>

                {/* Delivery Channel Selector */}
                <Text style={[styles.label, { marginTop: 18 }]}>Receive verification code via:</Text>
                <View style={styles.channelRow}>
                  <TouchableOpacity
                    style={[styles.channelBtn, channel === 'whatsapp' && styles.channelBtnActive]}
                    onPress={() => setChannel('whatsapp')}
                  >
                    <MessageSquare
                      size={18}
                      color={channel === 'whatsapp' ? colors.teal : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.channelText,
                        channel === 'whatsapp' && styles.channelTextActive,
                      ]}
                    >
                      WhatsApp
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.channelBtn, channel === 'sms' && styles.channelBtnActive]}
                    onPress={() => setChannel('sms')}
                  >
                    <Phone
                      size={18}
                      color={channel === 'sms' ? colors.primary : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.channelText,
                        channel === 'sms' && styles.channelTextActive,
                      ]}
                    >
                      Text SMS
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleSendPhoneOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.submitBtnText}>Send Verification Code</Text>
                      <ArrowRight size={18} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              // Step 2: 6-Digit Mobile OTP Input
              <View>
                <Text style={styles.label}>Enter 6-Digit Verification Code</Text>
                <Text style={styles.otpSublabel}>
                  Dispatched to {selectedCountry.dialCode} {phone}. Please check your {channel === 'whatsapp' ? 'WhatsApp' : 'messages'}.
                </Text>

                <TextInput
                  style={styles.otpInput}
                  value={phoneOtp}
                  onChangeText={setPhoneOtp}
                  placeholder="• • • • • •"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus={true}
                />

                {showNotificationBanner && devOtp ? (
                  <TouchableOpacity
                    style={styles.osNotificationCard}
                    onPress={() => {
                      setPhoneOtp(devOtp);
                      setShowNotificationBanner(false);
                    }}
                    activeOpacity={0.88}
                  >
                    <View style={styles.osNotifHeader}>
                      <View style={styles.osNotifAppRow}>
                        <View
                          style={[
                            styles.osNotifIconCircle,
                            channel === 'whatsapp'
                              ? { backgroundColor: '#25D366' }
                              : { backgroundColor: '#0A84FF' },
                          ]}
                        >
                          {channel === 'whatsapp' ? (
                            <MessageSquare size={12} color="#FFF" />
                          ) : (
                            <Phone size={12} color="#FFF" />
                          )}
                        </View>
                        <Text style={styles.osNotifAppName}>
                          {channel === 'whatsapp' ? 'WHATSAPP' : 'MESSAGES'}
                        </Text>
                      </View>
                      <Text style={styles.osNotifTime}>Now</Text>
                    </View>
                    <Text style={styles.osNotifBody}>
                      <Text style={{ fontWeight: '700', color: '#0F172A' }}>CityPilot: </Text>
                      Your verification code is <Text style={styles.osNotifCode}>{devOtp}</Text>.
                    </Text>
                    <View style={styles.osNotifActionRow}>
                      <Text style={styles.osNotifActionText}>Tap to auto-fill</Text>
                    </View>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleVerifyPhoneOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <ShieldCheck size={18} color="#fff" />
                      <Text style={styles.submitBtnText}>Verify Code & Proceed</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendBtn}
                  onPress={() => {
                    setPhoneOtpStep(false);
                    setPhoneOtp('');
                  }}
                >
                  <Text style={styles.resendText}>Change Number or Resend</Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            // ================= EMAIL FLOW =================
            !emailOtpStep ? (
              // Step 1: Real Email Address Input
              <View>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.inputFull}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoFocus={false}
                />
                <Text style={styles.fieldHint}>
                  We will send a 6-digit verification code to your email inbox.
                </Text>

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleSendEmailOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.submitBtnText}>Send Verification Code</Text>
                      <ArrowRight size={18} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              // Step 2: 6-Digit Email Code Input
              <View>
                <Text style={styles.label}>Enter 6-Digit Code</Text>
                <Text style={styles.otpSublabel}>
                  Sent to {email}. Please check your inbox or spam folder.
                </Text>

                <TextInput
                  style={styles.otpInput}
                  value={emailOtp}
                  onChangeText={setEmailOtp}
                  placeholder="• • • • • •"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus={true}
                />

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleVerifyEmailOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <ShieldCheck size={18} color="#fff" />
                      <Text style={styles.submitBtnText}>Verify & Continue</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendBtn}
                  onPress={() => {
                    setEmailOtpStep(false);
                    setEmailOtp('');
                  }}
                >
                  <Text style={styles.resendText}>Change Email or Resend</Text>
                </TouchableOpacity>
              </View>
            )
          )}

          {/* OR Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign-In Button */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={() => setGoogleModalVisible(true)}
            disabled={loading}
            activeOpacity={0.85}
          >
            <View style={styles.googleBadge}>
              <Text style={styles.googleG}>G</Text>
            </View>
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>
        </View>

        {/* Security and Privacy Footnote */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to CityPilot's Terms & Privacy Policy.
          </Text>
        </View>
      </ScrollView>

      {/* Genuine Google Account Sign-In WebView Modal */}
      <GoogleSignInWebViewModal
        visible={googleModalVisible}
        onClose={() => setGoogleModalVisible(false)}
        onSuccess={handleGoogleSuccess}
      />

      {/* Country Code Picker Modal */}
      <Modal
        visible={countryPickerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCountryPickerVisible(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Country</Text>
              <TouchableOpacity
                onPress={() => setCountryPickerVisible(false)}
                style={styles.pickerCloseBtn}
                activeOpacity={0.7}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Country Search Bar */}
            <View style={styles.pickerSearchRow}>
              <Search size={16} color="#94A3B8" />
              <TextInput
                style={styles.pickerSearchInput}
                placeholder="Search country or dial code..."
                placeholderTextColor="#94A3B8"
                value={countrySearch}
                onChangeText={setCountrySearch}
                autoCapitalize="none"
              />
            </View>

            {/* Country List */}
            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
              {COUNTRIES.filter(
                (c) =>
                  c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                  c.dialCode.includes(countrySearch)
              ).map((c) => {
                const isSelected = selectedCountry.code === c.code;
                return (
                  <TouchableOpacity
                    key={c.code}
                    style={[styles.countryItem, isSelected && styles.countryItemActive]}
                    onPress={() => {
                      setSelectedCountry(c);
                      setCountryPickerVisible(false);
                      setCountrySearch('');
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.countryItemFlag}>{c.flag}</Text>
                    <Text style={styles.countryItemName}>{c.name}</Text>
                    <Text style={styles.countryItemCode}>{c.dialCode}</Text>
                    {isSelected ? <Check size={18} color={colors.primary} /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    minHeight: '100%',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  brandPin: {
    width: 64,
    height: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  fieldHint: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 16,
  },
  otpSublabel: {
    fontSize: 12.5,
    color: '#64748B',
    marginBottom: 14,
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
  },
  countryCode: {
    fontSize: 18,
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
  },
  inputFull: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
    marginBottom: 8,
  },
  otpInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingHorizontal: 14,
    height: 52,
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  channelRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  channelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    gap: 8,
  },
  channelBtnActive: {
    borderColor: colors.teal,
    backgroundColor: '#F0FDF4',
  },
  channelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  channelTextActive: {
    color: '#065F46',
    fontWeight: '700',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 50,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  resendBtn: {
    alignItems: 'center',
    marginTop: 14,
  },
  resendText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  alertError: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  alertErrorText: {
    color: '#B91C1C',
    fontSize: 12.5,
    fontWeight: '600',
  },
  alertInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    gap: 8,
  },
  alertInfoText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    height: 50,
    gap: 12,
  },
  googleBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EA4335',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleG: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 20,
  },
  modalInputGroup: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    fontSize: 15,
    color: colors.navy,
    fontWeight: '600',
  },
  modalSubmitBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 14,
    marginTop: 10,
  },
  modalSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  // Mobile Input Pill (Exact Image 1 layout)
  mobileSectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  mobileSectionSubtitle: {
    fontSize: 13.5,
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 19,
  },
  mobilePillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    height: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  countryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  countryFlagText: {
    fontSize: 22,
  },
  countryDialCodeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  mobileInputDivider: {
    width: 1.5,
    height: 28,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 14,
  },
  mobileDigitsInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    height: '100%',
  },
  // Country Picker Modal Styles
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pickerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },
  pickerCloseBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  pickerSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 46,
    gap: 10,
    marginBottom: 14,
  },
  pickerSearchInput: {
    flex: 1,
    fontSize: 14.5,
    color: '#0F172A',
  },
  pickerList: {
    maxHeight: 340,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  countryItemActive: {
    backgroundColor: '#EFF6FF',
  },
  countryItemFlag: {
    fontSize: 22,
    marginRight: 14,
  },
  countryItemName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  countryItemCode: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#64748B',
    marginRight: 10,
  },
  // OS Notification Card (Realistic simulated native banner)
  osNotificationCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  osNotifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  osNotifAppRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  osNotifIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  osNotifAppName: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#64748B',
  },
  osNotifTime: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  osNotifBody: {
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 19,
    marginBottom: 8,
  },
  osNotifCode: {
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  osNotifActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  osNotifActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});
