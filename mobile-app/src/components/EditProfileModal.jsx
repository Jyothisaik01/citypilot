import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { X, User, Phone, Mail, ShieldCheck, Check, ArrowRight } from 'lucide-react-native';
import UserAvatar from './UserAvatar';
import CustomPopupModal from './CustomPopupModal';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';

export default function EditProfileModal({ visible, onClose }) {
  const { user, updateProfileName, requestProfileUpdateOtp, verifyProfileUpdateOtp } = useAuth();

  const [activeTab, setActiveTab] = useState('name'); // 'name' | 'phone' | 'email'

  // Name State
  const [name, setName] = useState('');
  const [savingName, setSavingName] = useState(false);

  // Phone State
  const [phone, setPhone] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [sendingPhoneOtp, setSendingPhoneOtp] = useState(false);
  const [verifyingPhoneOtp, setVerifyingPhoneOtp] = useState(false);

  // Email State
  const [email, setEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [verifyingEmailOtp, setVerifyingEmailOtp] = useState(false);

  // Branded CityPilot Popup Modal state
  const [popup, setPopup] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showPopup = (title, message, type = 'info') => {
    setPopup({
      visible: true,
      title,
      message,
      type,
    });
  };

  useEffect(() => {
    if (visible && user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setPhoneOtpSent(false);
      setEmailOtpSent(false);
      setPhoneOtp('');
      setEmailOtp('');
    }
  }, [visible, user]);

  // Handle Save Name
  const handleSaveName = async () => {
    if (!name.trim()) {
      showPopup('Invalid Name', 'Please enter a valid full name.', 'danger');
      return;
    }
    setSavingName(true);
    try {
      const res = await updateProfileName(name.trim());
      if (res && res.success) {
        showPopup(
          'Name Updated',
          'Your profile name has been updated successfully!',
          'success'
        );
      } else {
        showPopup('Update Failed', res?.message || 'Could not update name', 'danger');
      }
    } catch (e) {
      showPopup('Error', e.message, 'danger');
    } finally {
      setSavingName(false);
    }
  };

  // Handle Send Phone OTP
  const handleSendPhoneOtp = async () => {
    if (!phone.trim() || phone.trim().length < 8) {
      showPopup('Invalid Phone', 'Please enter a valid phone number.', 'danger');
      return;
    }
    setSendingPhoneOtp(true);
    try {
      const res = await requestProfileUpdateOtp('phone', phone.trim());
      if (res && res.success) {
        setPhoneOtpSent(true);
        showPopup('OTP Sent', res.message || `Verification code sent to ${phone}`, 'success');
      } else {
        showPopup('Failed', res?.message || 'Could not send verification OTP', 'danger');
      }
    } catch (e) {
      showPopup('Error', e.message, 'danger');
    } finally {
      setSendingPhoneOtp(false);
    }
  };

  // Handle Verify Phone OTP
  const handleVerifyPhoneOtp = async () => {
    if (!phoneOtp.trim() || phoneOtp.trim().length !== 6) {
      showPopup('Invalid Code', 'Please enter the 6-digit verification code.', 'danger');
      return;
    }
    setVerifyingPhoneOtp(true);
    try {
      const res = await verifyProfileUpdateOtp('phone', phone.trim(), phoneOtp.trim());
      if (res && res.success) {
        showPopup('Phone Verified', 'Your phone number has been updated successfully!', 'success');
        setPhoneOtpSent(false);
        setPhoneOtp('');
      } else {
        showPopup('Verification Failed', res?.message || 'Invalid or expired OTP code', 'danger');
      }
    } catch (e) {
      showPopup('Error', e.message, 'danger');
    } finally {
      setVerifyingPhoneOtp(false);
    }
  };

  // Handle Send Email OTP via Brevo
  const handleSendEmailOtp = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
      showPopup('Invalid Email', 'Please enter a valid email address.', 'danger');
      return;
    }
    setSendingEmailOtp(true);
    try {
      const res = await requestProfileUpdateOtp('email', trimmed);
      if (res && res.success) {
        setEmailOtpSent(true);
        showPopup(
          'Verification Code Sent',
          res.message || `A 6-digit verification code has been sent to ${trimmed}. Please check your inbox.`,
          'success'
        );
      } else {
        showPopup('Delivery Failed', res?.message || 'Failed to dispatch email verification', 'danger');
      }
    } catch (e) {
      showPopup('Error', e.message, 'danger');
    } finally {
      setSendingEmailOtp(false);
    }
  };

  // Handle Verify Email OTP
  const handleVerifyEmailOtp = async () => {
    if (!emailOtp.trim() || emailOtp.trim().length !== 6) {
      showPopup('Invalid Code', 'Please enter the 6-digit email code.', 'danger');
      return;
    }
    setVerifyingEmailOtp(true);
    try {
      const res = await verifyProfileUpdateOtp('email', email.trim().toLowerCase(), emailOtp.trim());
      if (res && res.success) {
        showPopup('Email Verified', 'Your email address has been verified and updated successfully!', 'success');
        setEmailOtpSent(false);
        setEmailOtp('');
      } else {
        showPopup('Verification Failed', res?.message || 'Invalid or expired OTP code', 'danger');
      }
    } catch (e) {
      showPopup('Error', e.message, 'danger');
    } finally {
      setVerifyingEmailOtp(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <Text style={styles.modalSubtitle}>Manage your name, phone & verified email</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Rider Profile Card */}
          <View style={styles.avatarPreviewRow}>
            <UserAvatar name={name || user?.name || 'CityPilot User'} size={54} backgroundColor="#0A84FF" />
            <View style={styles.avatarPreviewInfo}>
              <Text style={styles.previewTitle}>{name || user?.name || 'CityPilot Rider'}</Text>
              <Text style={styles.previewSubtext}>
                {user?.phone ? `+${user.phone.replace(/^\+/, '')}` : (user?.email || 'Verified Rider Profile')}
              </Text>
            </View>
          </View>

          {/* Tab Selector */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'name' && styles.tabBtnActive]}
              onPress={() => setActiveTab('name')}
            >
              <User size={15} color={activeTab === 'name' ? colors.primary : '#64748B'} />
              <Text style={[styles.tabText, activeTab === 'name' && styles.tabTextActive]}>
                Name
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'phone' && styles.tabBtnActive]}
              onPress={() => setActiveTab('phone')}
            >
              <Phone size={15} color={activeTab === 'phone' ? colors.primary : '#64748B'} />
              <Text style={[styles.tabText, activeTab === 'phone' && styles.tabTextActive]}>
                Phone
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'email' && styles.tabBtnActive]}
              onPress={() => setActiveTab('email')}
            >
              <Mail size={15} color={activeTab === 'email' ? colors.primary : '#64748B'} />
              <Text style={[styles.tabText, activeTab === 'email' && styles.tabTextActive]}>
                Email
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} keyboardShouldPersistTaps="handled">
            {/* NAME TAB */}
            {activeTab === 'name' && (
              <View style={styles.sectionBody}>
                <Text style={styles.fieldLabel}>FULL NAME</Text>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Anusha Maram"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="words"
                />
                <Text style={styles.helperText}>
                  Your name is shown to pilots and drivers on your upcoming trips.
                </Text>

                <TouchableOpacity
                  style={[styles.actionBtn, savingName && styles.actionBtnDisabled]}
                  onPress={handleSaveName}
                  disabled={savingName}
                  activeOpacity={0.8}
                >
                  {savingName ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Check size={18} color="#FFFFFF" />
                      <Text style={styles.actionBtnText}>Save Full Name</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* PHONE TAB */}
            {activeTab === 'phone' && (
              <View style={styles.sectionBody}>
                <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
                <TextInput
                  style={styles.textInput}
                  value={phone}
                  onChangeText={(val) => {
                    setPhone(val);
                    if (phoneOtpSent) setPhoneOtpSent(false);
                  }}
                  placeholder="+91 98765 43210"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  editable={!phoneOtpSent}
                />

                {!phoneOtpSent ? (
                  <>
                    <Text style={styles.helperText}>
                      We will send a 6-digit SMS / WhatsApp verification OTP to this phone.
                    </Text>
                    <TouchableOpacity
                      style={[styles.actionBtn, sendingPhoneOtp && styles.actionBtnDisabled]}
                      onPress={handleSendPhoneOtp}
                      disabled={sendingPhoneOtp}
                      activeOpacity={0.8}
                    >
                      {sendingPhoneOtp ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <>
                          <Text style={styles.actionBtnText}>Send Phone OTP</Text>
                          <ArrowRight size={18} color="#FFFFFF" />
                        </>
                      )}
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View style={styles.otpNotice}>
                      <ShieldCheck size={16} color={colors.primary} />
                      <Text style={styles.otpNoticeText}>Enter 6-digit code sent to {phone}</Text>
                    </View>

                    <Text style={styles.fieldLabel}>VERIFICATION OTP</Text>
                    <TextInput
                      style={[styles.textInput, styles.otpInput]}
                      value={phoneOtp}
                      onChangeText={setPhoneOtp}
                      placeholder="• • • • • •"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      maxLength={6}
                    />

                    <TouchableOpacity
                      style={[styles.actionBtn, verifyingPhoneOtp && styles.actionBtnDisabled]}
                      onPress={handleVerifyPhoneOtp}
                      disabled={verifyingPhoneOtp}
                      activeOpacity={0.8}
                    >
                      {verifyingPhoneOtp ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <>
                          <Check size={18} color="#FFFFFF" />
                          <Text style={styles.actionBtnText}>Verify & Update Phone</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.resendBtn}
                      onPress={handleSendPhoneOtp}
                      disabled={sendingPhoneOtp}
                    >
                      <Text style={styles.resendBtnText}>Resend Code</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            {/* EMAIL TAB */}
            {activeTab === 'email' && (
              <View style={styles.sectionBody}>
                <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (emailOtpSent) setEmailOtpSent(false);
                  }}
                  placeholder="yourname@gmail.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!emailOtpSent}
                />

                {!emailOtpSent ? (
                  <>
                    <Text style={styles.helperText}>
                      We will send a 6-digit verification code to your email inbox.
                    </Text>
                    <TouchableOpacity
                      style={[styles.actionBtn, sendingEmailOtp && styles.actionBtnDisabled]}
                      onPress={handleSendEmailOtp}
                      disabled={sendingEmailOtp}
                      activeOpacity={0.8}
                    >
                      {sendingEmailOtp ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <>
                          <Text style={styles.actionBtnText}>Send Verification Code</Text>
                          <ArrowRight size={18} color="#FFFFFF" />
                        </>
                      )}
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View style={styles.otpNotice}>
                      <ShieldCheck size={16} color={colors.primary} />
                      <Text style={styles.otpNoticeText}>
                        Verification code sent to {email}.
                      </Text>
                    </View>

                    <Text style={styles.fieldLabel}>6-DIGIT EMAIL CODE</Text>
                    <TextInput
                      style={[styles.textInput, styles.otpInput]}
                      value={emailOtp}
                      onChangeText={setEmailOtp}
                      placeholder="• • • • • •"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      maxLength={6}
                    />

                    <TouchableOpacity
                      style={[styles.actionBtn, verifyingEmailOtp && styles.actionBtnDisabled]}
                      onPress={handleVerifyEmailOtp}
                      disabled={verifyingEmailOtp}
                      activeOpacity={0.8}
                    >
                      {verifyingEmailOtp ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <>
                          <Check size={18} color="#FFFFFF" />
                          <Text style={styles.actionBtnText}>Verify & Save Email</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.resendBtn}
                      onPress={handleSendEmailOtp}
                      disabled={sendingEmailOtp}
                    >
                      <Text style={styles.resendBtnText}>Resend Email OTP</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <CustomPopupModal
        visible={popup.visible}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onConfirm={() => setPopup((p) => ({ ...p, visible: false }))}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.navy,
  },
  modalSubtitle: {
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    gap: 12,
  },
  avatarPreviewInfo: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.navy,
  },
  previewSubtext: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  formScroll: {
    maxHeight: 380,
  },
  sectionBody: {
    paddingVertical: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.navy,
    fontWeight: '600',
    marginBottom: 8,
  },
  otpInput: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 8,
    textAlign: 'center',
    color: colors.navy,
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  helperText: {
    fontSize: 11.5,
    color: '#94A3B8',
    lineHeight: 16,
    marginBottom: 16,
  },
  otpNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  otpNoticeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    flex: 1,
  },
  actionBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 6,
  },
  actionBtnDisabled: {
    opacity: 0.65,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  resendBtn: {
    alignSelf: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  resendBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});

