import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Phone, Mail, ShieldCheck, ArrowRight, Check } from 'lucide-react-native';
import UserAvatar from '../components/UserAvatar';
import CustomPopupModal from '../components/CustomPopupModal';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';

const GENDER_OPTIONS = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'other', label: 'Other' },
  { id: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export default function CompleteProfileScreen({ navigation, route }) {
  const { user, completeProfile } = useAuth();

  const [name, setName] = useState(user?.name && user.name !== 'CityPilot Rider' ? user.name : '');
  const [gender, setGender] = useState(user?.gender || '');
  const [phone, setPhone] = useState(user?.phone || route?.params?.phone || '');
  const [email, setEmail] = useState(user?.email || route?.params?.email || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupData, setPopupData] = useState({ title: '', message: '' });

  const isPhoneLocked = Boolean(user?.phone && user.phone.length > 5 && user.phone === route?.params?.phone);
  const isEmailLocked = Boolean(user?.email && user.email.includes('@') && user.email === route?.params?.email);

  const handleSubmit = async () => {
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Full Name is compulsory.');
      return;
    }
    if (!gender) {
      setErrorMsg('Please select your Gender.');
      return;
    }
    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 8) {
      setErrorMsg('A valid Mobile Number is compulsory for CityPilot rides.');
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('A valid Email Address is compulsory for transit receipts.');
      return;
    }

    setLoading(true);
    try {
      const res = await completeProfile({
        userId: user?.id || user?._id,
        name: name.trim(),
        gender,
        phone: cleanPhone,
        email: cleanEmail,
      });

      setLoading(false);
      if (res && res.success) {
        setPopupData({
          title: 'Profile Completed! 🎉',
          message: `Welcome aboard, ${name.trim()}! Your multimodal journey begins now.`,
        });
        setPopupVisible(true);
      } else {
        setErrorMsg(res?.message || 'Could not complete profile. Please try again.');
      }
    } catch (e) {
      setLoading(false);
      setErrorMsg(e.message || 'Network error occurred');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badgePill}>
              <ShieldCheck size={14} color={colors.primary} />
              <Text style={styles.badgeText}>MANDATORY RIDER DETAILS</Text>
            </View>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>
              CityPilot requires verified rider information for live transit routing, pilot dispatch, and SOS safety.
            </Text>
          </View>

          {/* Live Credential Avatar Preview */}
          <View style={styles.avatarCard}>
            <UserAvatar name={name || 'Rider'} size={64} backgroundColor="#0A84FF" />
            <View style={styles.avatarCardInfo}>
              <Text style={styles.avatarCardTitle}>
                {name.trim() ? name.trim() : 'Your Name'}
              </Text>
              <Text style={styles.avatarCardSubtext}>
                Your rider profile across CityPilot
              </Text>
            </View>
          </View>

          {errorMsg ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              FULL NAME <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View style={styles.inputBox}>
              <User size={18} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={(val) => {
                  setName(val);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="e.g. Jyothisai Karumajji"
                placeholderTextColor="#94A3B8"
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Gender Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              GENDER <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View style={styles.genderRow}>
              {GENDER_OPTIONS.map((opt) => {
                const selected = gender === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.genderChip, selected && styles.genderChipSelected]}
                    onPress={() => {
                      setGender(opt.id);
                      if (errorMsg) setErrorMsg('');
                    }}
                    activeOpacity={0.7}
                  >
                    {selected ? (
                      <Check size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                    ) : null}
                    <Text
                      style={[styles.genderChipText, selected && styles.genderChipTextSelected]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Mobile Number */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>
                MOBILE NUMBER <Text style={styles.requiredStar}>*</Text>
              </Text>
              {isPhoneLocked ? (
                <Text style={styles.verifiedTag}>✓ Verified</Text>
              ) : (
                <Text style={styles.compulsoryTag}>Compulsory</Text>
              )}
            </View>
            <View style={[styles.inputBox, isPhoneLocked && styles.inputBoxLocked]}>
              <Phone size={18} color={isPhoneLocked ? '#059669' : '#64748B'} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isPhoneLocked && styles.inputLocked]}
                value={phone}
                onChangeText={(val) => {
                  setPhone(val);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="+91 98765 43210"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                editable={!isPhoneLocked}
              />
            </View>
          </View>

          {/* Email Address */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>
                EMAIL ADDRESS <Text style={styles.requiredStar}>*</Text>
              </Text>
              {isEmailLocked ? (
                <Text style={styles.verifiedTag}>✓ Verified</Text>
              ) : (
                <Text style={styles.compulsoryTag}>Compulsory</Text>
              )}
            </View>
            <View style={[styles.inputBox, isEmailLocked && styles.inputBoxLocked]}>
              <Mail size={18} color={isEmailLocked ? '#059669' : '#64748B'} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isEmailLocked && styles.inputLocked]}
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="yourname@gmail.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isEmailLocked}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>Complete Profile & Proceed</Text>
                <ArrowRight size={18} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomPopupModal
        visible={popupVisible}
        type="success"
        title={popupData.title}
        message={popupData.message}
        confirmText="Let's Go"
        onConfirm={() => {
          setPopupVisible(false);
          navigation.replace('LocationPermission');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.navy,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13.5,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  avatarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    gap: 14,
  },
  avatarCardInfo: {
    flex: 1,
  },
  avatarCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.navy,
  },
  avatarCardSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  requiredStar: {
    color: '#EF4444',
  },
  verifiedTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  compulsoryTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  inputBoxLocked: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.navy,
    fontWeight: '600',
  },
  inputLocked: {
    color: '#64748B',
  },
  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  genderChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  genderChipTextSelected: {
    color: '#FFFFFF',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
    borderRadius: 16,
    marginTop: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.65,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
