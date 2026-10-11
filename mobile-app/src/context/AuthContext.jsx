import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, configAPI } from '../services/api';

const AuthContext = createContext();

const STORAGE_KEYS = {
  TOKEN: '@citypilot_token',
  USER: '@citypilot_user',
  MODE: '@citypilot_app_mode',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [appMode, setAppMode] = useState('normal'); // 'normal' | 'full'
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from AsyncStorage on app launch
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        const storedMode = await AsyncStorage.getItem(STORAGE_KEYS.MODE);

        if (storedMode) {
          setAppMode(storedMode);
        }

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.warn('Failed to restore CityPilot session:', e);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Send OTP via SMS or WhatsApp
  const sendOtp = async (phone, channel = 'whatsapp') => {
    return await authAPI.sendOtp(phone, channel);
  };

  // Verify OTP and persist login
  const verifyOtp = async (phone, otp) => {
    const res = await authAPI.verifyOtp(phone, otp);
    if (res && res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      if (res.user.appMode) {
        setAppMode(res.user.appMode);
        await AsyncStorage.setItem(STORAGE_KEYS.MODE, res.user.appMode);
      }
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, res.token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.user));
      return { success: true, user: res.user, isKnownUser: res.isKnownUser };
    }
    return { success: false, message: res?.message || 'Verification failed' };
  };

  // Send Email OTP via Brevo Real-Time Service
  const sendEmailOtp = async (email) => {
    return await authAPI.sendEmailOtp(email);
  };

  // Verify Email OTP and persist login
  const verifyEmailOtp = async (email, otp) => {
    const res = await authAPI.verifyEmailOtp(email, otp);
    if (res && res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      if (res.user.appMode) {
        setAppMode(res.user.appMode);
        await AsyncStorage.setItem(STORAGE_KEYS.MODE, res.user.appMode);
      }
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, res.token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.user));
      return { success: true, user: res.user, isKnownUser: res.isKnownUser };
    }
    return { success: false, message: res?.message || 'Email verification failed' };
  };

  // Login via Google
  const loginWithGoogle = async (googleData = {}) => {
    const res = await authAPI.loginGoogle(googleData);
    if (res && res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      if (res.user.appMode) {
        setAppMode(res.user.appMode);
        await AsyncStorage.setItem(STORAGE_KEYS.MODE, res.user.appMode);
      }
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, res.token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.user));
      return { success: true, user: res.user, isKnownUser: res.isKnownUser };
    }
    return { success: false, message: res?.message || 'Google sign-in failed' };
  };

  // Complete Profile (Mandatory for new / incomplete users)
  const completeProfile = async (profileData) => {
    const res = await authAPI.completeProfile(profileData);
    if (res && res.success && res.user) {
      setUser(res.user);
      if (res.token) {
        setToken(res.token);
        await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, res.token);
      }
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.user));
      return { success: true, user: res.user };
    }
    return { success: false, message: res?.message || 'Profile completion failed' };
  };

  // Toggle Mode: Normal Mode (Aggregator) vs Full Mode (CityPilot Native Booking)
  const toggleAppMode = async (newMode) => {
    const modeVal = newMode === 'full' ? 'full' : 'normal';
    setAppMode(modeVal);
    await AsyncStorage.setItem(STORAGE_KEYS.MODE, modeVal);

    // Sync with backend feature flag
    try {
      await configAPI.setFeatures({
        ownRideNetworkEnabled: modeVal === 'full',
      });
      if (user?.phone) {
        await authAPI.updateMode(modeVal, user.phone);
      }
    } catch (e) {
      console.warn('Backend mode sync failed:', e.message);
    }
  };

  // Profile Management: Update Name
  const updateProfileName = async (newName) => {
    try {
      const res = await authAPI.updateName({
        userId: user?.id || user?._id,
        phone: user?.phone,
        email: user?.email,
        name: newName,
      });
      const updatedUser = { ...user, name: newName };
      setUser(updatedUser);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  // Profile Management: Request OTP for phone or email update
  const requestProfileUpdateOtp = async (field, value) => {
    return await authAPI.requestProfileUpdateOtp({
      field,
      value,
      currentName: user?.name,
      currentPhone: user?.phone,
      currentEmail: user?.email,
    });
  };

  // Profile Management: Verify OTP and save updated phone or email
  const verifyProfileUpdateOtp = async (field, value, otp) => {
    const res = await authAPI.verifyProfileUpdateOtp({
      field,
      value,
      otp,
      userId: user?.id || user?._id,
      currentPhone: user?.phone,
      currentEmail: user?.email,
    });
    if (res && res.success) {
      const updatedUser = { ...user, [field]: value };
      setUser(updatedUser);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    }
    return { success: false, message: res?.message || 'Verification failed' };
  };

  // Logout - Clears storage completely
  const logout = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      setToken(null);
      setUser(null);
    } catch (e) {
      console.warn('Logout error:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        appMode,
        isLoading,
        isAuthenticated: Boolean(token && user),
        sendOtp,
        verifyOtp,
        sendEmailOtp,
        verifyEmailOtp,
        loginWithEmail: sendEmailOtp,
        loginWithGoogle,
        completeProfile,
        updateProfileName,
        requestProfileUpdateOtp,
        verifyProfileUpdateOtp,
        toggleAppMode,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
