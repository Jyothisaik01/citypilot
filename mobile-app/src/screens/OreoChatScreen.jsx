import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Switch,
  Image,
  ImageBackground,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OreoAiAvatar from '../components/OreoAiAvatar';
import UserAvatar from '../components/UserAvatar';
import FormattedMarkdownText from '../components/FormattedMarkdownText';
import CustomPopupModal from '../components/CustomPopupModal';

const OREO_CHAT_BG = require('../../assets/images/oreo_chat_bg.png');
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Send,
  Sparkles,
  Bot,
  User,
  Clock,
  Settings,
  Plus,
  Trash2,
  X,
  Compass,
  TrendingDown,
  Navigation,
  Info,
  CheckCircle2,
  Zap,
} from 'lucide-react-native';
import colors from '../theme/colors';
import { oreoAPI } from '../services/api';

const STORAGE_KEY_CONVERSATIONS = '@citypilot_oreo_conversations_v1';
const STORAGE_KEY_SETTINGS = '@citypilot_oreo_settings_v1';

const INITIAL_WELCOME = {
  id: 'oreo_welcome',
  role: 'assistant',
  text: "👋 Hi! I'm **Oreo AI**, your Hyderabad transit copilot & ride fare estimator.\n\nI can calculate fares across **Bike Taxi, Hyderabad Metro, Auto, and Cabs**, recommend routes to bypass Cyber Towers gridlock, and find the smartest multimodal combinations for you. How can I help you today?",
  suggestions: [
    'Estimate fare: Gachibowli to Airport',
    'Compare Bike vs Metro to Ameerpet',
    'Cheapest way to Jubilee Hills',
    'Hyderabad Metro Blue Line timings',
  ],
  time: 'Just now',
};

export default function OreoChatScreen({ navigation, route }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);

  const initialQuery = route?.params?.initialQuery;

  const [messages, setMessages] = useState([INITIAL_WELCOME]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(`conv_${Date.now()}`);

  // Modals
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [savedConversations, setSavedConversations] = useState([]);

  // Settings
  const [settings, setSettings] = useState({
    suggestionsEnabled: true,
    saveHistoryEnabled: true,
    trafficAlertsEnabled: true,
  });

  // Load saved settings & conversations on mount
  useEffect(() => {
    loadSettings();
    loadConversations();
  }, []);

  // Handle initial query passed via navigation params
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSendMessage(initialQuery.trim());
    }
  }, [initialQuery]);

  const loadSettings = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY_SETTINGS);
      if (data) setSettings(JSON.parse(data));
    } catch (e) {}
  };

  const saveSettings = async (newSettings) => {
    setSettings(newSettings);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(newSettings));
    } catch (e) {}
  };

  const loadConversations = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY_CONVERSATIONS);
      if (data) setSavedConversations(JSON.parse(data));
    } catch (e) {}
  };

  const persistCurrentConversation = async (updatedMessages) => {
    if (!settings.saveHistoryEnabled || updatedMessages.length <= 1) return;

    try {
      const firstUserMsg = updatedMessages.find((m) => m.role === 'user');
      const title = firstUserMsg ? firstUserMsg.text.slice(0, 40) : 'Transit Consultation';

      const existingData = await AsyncStorage.getItem(STORAGE_KEY_CONVERSATIONS);
      let list = existingData ? JSON.parse(existingData) : [];

      const sessionObj = {
        id: conversationId,
        title,
        updatedAt: new Date().toISOString(),
        messageCount: updatedMessages.length,
        messages: updatedMessages,
      };

      const existingIdx = list.findIndex((c) => c.id === conversationId);
      if (existingIdx >= 0) {
        list[existingIdx] = sessionObj;
      } else {
        list.unshift(sessionObj);
      }

      list = list.slice(0, 20); // Keep last 20
      setSavedConversations(list);
      await AsyncStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(list));
    } catch (e) {}
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const userMsg = {
      id: `u_${Date.now()}`,
      role: 'user',
      text,
      time: 'Now',
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputText('');
    setLoading(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const historyPayload = nextMessages
        .filter((m) => m.id !== 'oreo_welcome')
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await oreoAPI.chat(text, historyPayload);

      const aiMsg = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        text: res?.text || "Here is Oreo's mobility estimation for your trip.",
        suggestions: res?.suggestions || [],
        time: 'Just now',
      };

      const finalMessages = [...nextMessages, aiMsg];
      setMessages(finalMessages);
      persistCurrentConversation(finalMessages);
    } catch (err) {
      const fallbackMsg = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        text: "I'm having a brief connection flutter, but Hyderabad Metro and CityPilot bike taxis are moving normally! How can I help you navigate?",
        suggestions: ['Estimate fare', 'Hyderabad Metro lines', 'Compare routes'],
        time: 'Just now',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  };

  const startNewChat = () => {
    setMessages([INITIAL_WELCOME]);
    setConversationId(`conv_${Date.now()}`);
  };

  const loadConversation = (session) => {
    if (session?.messages) {
      setMessages(session.messages);
      setConversationId(session.id);
      setShowHistoryModal(false);
    }
  };

  const deleteConversation = async (id) => {
    const updated = savedConversations.filter((c) => c.id !== id);
    setSavedConversations(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(updated));
    } catch (e) {}
  };

  const [clearConfirmVisible, setClearConfirmVisible] = useState(false);

  const clearAllHistory = () => {
    setClearConfirmVisible(true);
  };

  const handleConfirmClearHistory = async () => {
    setSavedConversations([]);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_CONVERSATIONS);
    } catch (e) {}
    setShowSettingsModal(false);
    setClearConfirmVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
      >
        {/* Header Bar */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {navigation.canGoBack() && (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => navigation.goBack()}
              >
                <ArrowLeft size={20} color="#0F172A" />
              </TouchableOpacity>
            )}

            {/* Oreo AI Identity Avatar */}
            <OreoAiAvatar size={42} showOnlineBadge={true} useImage={true} />

            <View style={styles.headerTitleBox}>
              <View style={styles.titleRow}>
                <Text style={styles.oreoTitle}>Oreo AI</Text>
                <View style={styles.sparkleBadge}>
                  <Sparkles size={11} color="#0284C7" />
                  <Text style={styles.sparkleBadgeText}>Mobility</Text>
                </View>
              </View>
              <Text style={styles.oreoSub}>Fare Estimator • Hyderabad</Text>
            </View>
          </View>

          {/* Header Action Buttons */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconActionBtn}
              onPress={startNewChat}
              title="New Chat"
            >
              <Plus size={19} color="#0F172A" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconActionBtn}
              onPress={() => setShowHistoryModal(true)}
              title="History"
            >
              <Clock size={18} color="#0F172A" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconActionBtn}
              onPress={() => setShowSettingsModal(true)}
              title="Settings"
            >
              <Settings size={18} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages Stream with Custom Oreo Transit Background */}
        <ImageBackground
          source={OREO_CHAT_BG}
          style={styles.chatBgImage}
          imageStyle={styles.chatBgImageStyle}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatScroll}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((item) => {
              const isUser = item.role === 'user';
              return (
                <View
                  key={item.id}
                  style={[
                    styles.messageRow,
                    isUser ? styles.userMessageRow : styles.aiMessageRow,
                  ]}
                >
                  {!isUser ? (
                    <OreoAiAvatar size={28} useImage={true} style={{ marginTop: 4 }} />
                  ) : null}

                  <View style={styles.bubbleWrapper}>
                    <View
                      style={[
                        styles.bubble,
                        isUser ? styles.userBubble : styles.aiBubble,
                      ]}
                    >
                      <FormattedMarkdownText
                        text={item.text}
                        isUser={isUser}
                        style={[
                          styles.bubbleText,
                          isUser ? styles.userBubbleText : styles.aiBubbleText,
                        ]}
                      />
                      <Text
                        style={[
                          styles.bubbleTime,
                          isUser ? styles.userBubbleTime : styles.aiBubbleTime,
                        ]}
                      >
                        {item.time}
                      </Text>
                    </View>

                    {/* Suggestion Chips */}
                    {!isUser &&
                      settings.suggestionsEnabled &&
                      Array.isArray(item.suggestions) &&
                      item.suggestions.length > 0 && (
                        <View style={styles.suggestionsContainer}>
                          {item.suggestions.map((sug, sIdx) => (
                            <TouchableOpacity
                              key={sIdx}
                              style={styles.sugChip}
                              onPress={() => handleSendMessage(sug)}
                            >
                              <Sparkles size={11} color="#0A84FF" />
                              <Text style={styles.sugChipText}>{sug}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                  </View>

                  {isUser ? (
                    <UserAvatar
                      name={user?.name || 'Anusha Maram'}
                      size={28}
                      backgroundColor="#0F172A"
                      style={{ marginTop: 4 }}
                    />
                  ) : null}
                </View>
              );
            })}

            {loading && (
              <View style={[styles.messageRow, styles.aiMessageRow]}>
                <OreoAiAvatar size={28} useImage={true} style={{ marginTop: 4 }} />
                <View style={[styles.bubble, styles.aiBubble, styles.loadingBubble]}>
                  <ActivityIndicator size="small" color="#0A84FF" />
                  <Text style={styles.loadingText}>Oreo is calculating fares & routes...</Text>
                </View>
              </View>
            )}
          </ScrollView>
        </ImageBackground>

        {/* Input Bar */}
        <View style={[styles.inputBar, { paddingBottom: Math.max(12, insets.bottom + 6) }]}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask Oreo for fare estimates, routes..."
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSendMessage()}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              !inputText.trim() && { backgroundColor: '#E2E8F0' },
            ]}
            onPress={() => handleSendMessage()}
            disabled={!inputText.trim() || loading}
          >
            <Send size={18} color={inputText.trim() ? '#FFFFFF' : '#94A3B8'} />
          </TouchableOpacity>
        </View>

        {/* HISTORY MODAL */}
        <Modal visible={showHistoryModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Clock size={20} color="#0A84FF" />
                  <Text style={styles.modalTitle}>Chat History</Text>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setShowHistoryModal(false)}
                >
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {savedConversations.length === 0 ? (
                <View style={styles.emptyHistoryBox}>
                  <Compass size={38} color="#94A3B8" style={{ marginBottom: 12 }} />
                  <Text style={styles.emptyHistoryTitle}>No Saved Chats Yet</Text>
                  <Text style={styles.emptyHistorySub}>
                    Your route queries and fare comparisons with Oreo will appear here.
                  </Text>
                </View>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
                  {savedConversations.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.historyItem}
                      onPress={() => loadConversation(item)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.historyTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.historyDate}>
                          {new Date(item.updatedAt).toLocaleDateString()} • {item.messageCount} messages
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.trashBtn}
                        onPress={() => deleteConversation(item.id)}
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {/* SETTINGS MODAL */}
        <Modal visible={showSettingsModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Settings size={20} color="#0A84FF" />
                  <Text style={styles.modalTitle}>Oreo AI Settings</Text>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setShowSettingsModal(false)}
                >
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Setting Row 1 */}
              <View style={styles.settingRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>Smart Suggested Prompts</Text>
                  <Text style={styles.settingSub}>Show quick fare & transit suggestion chips</Text>
                </View>
                <Switch
                  value={settings.suggestionsEnabled}
                  onValueChange={(val) => saveSettings({ ...settings, suggestionsEnabled: val })}
                  trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                  thumbColor={settings.suggestionsEnabled ? '#0A84FF' : '#F1F5F9'}
                />
              </View>

              {/* Setting Row 2 */}
              <View style={styles.settingRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>Save Chat History</Text>
                  <Text style={styles.settingSub}>Keep past consultations on your device</Text>
                </View>
                <Switch
                  value={settings.saveHistoryEnabled}
                  onValueChange={(val) => saveSettings({ ...settings, saveHistoryEnabled: val })}
                  trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                  thumbColor={settings.saveHistoryEnabled ? '#0A84FF' : '#F1F5F9'}
                />
              </View>

              {/* Clear History Button */}
              <TouchableOpacity
                style={styles.clearHistoryBtn}
                onPress={clearAllHistory}
              >
                <Trash2 size={16} color="#DC2626" />
                <Text style={styles.clearHistoryBtnText}>Clear All Chat History</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Custom Confirmation Popup Dialog */}
        <CustomPopupModal
          visible={clearConfirmVisible}
          type="danger"
          title="Clear Chat History?"
          message="This will delete all saved Oreo AI transit conversations from this device."
          confirmText="Clear History"
          cancelText="Cancel"
          onConfirm={handleConfirmClearHistory}
          onCancel={() => setClearConfirmVisible(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  oreoAvatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  headerAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  bubbleAvatarImg: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerTitleBox: {
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  oreoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sparkleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  sparkleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
  },
  oreoSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  chatBgImage: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  chatBgImageStyle: {
    opacity: 0.2,
    resizeMode: 'cover',
  },
  chatScroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  aiMessageRow: {
    justifyContent: 'flex-start',
  },
  bubbleWrapper: {
    maxWidth: '80%',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: '#0A84FF',
    borderTopRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 21,
  },
  userBubbleText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  aiBubbleText: {
    color: '#1E293B',
    fontWeight: '400',
  },
  bubbleTime: {
    fontSize: 10,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  userBubbleTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  aiBubbleTime: {
    color: '#94A3B8',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  sugChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sugChipText: {
    fontSize: 11.5,
    color: '#0369A1',
    fontWeight: '600',
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyHistoryBox: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  emptyHistoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  emptyHistorySub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  historyDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  trashBtn: {
    padding: 6,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  settingSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  clearHistoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 20,
    marginBottom: 10,
  },
  clearHistoryBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 13,
  },
});

