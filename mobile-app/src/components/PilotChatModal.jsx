import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { X, Send, Bike, ShieldCheck, Sparkles } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { pilotRidesAPI } from '../services/api';
import UserAvatar from './UserAvatar';
import { useAuth } from '../context/AuthContext';

const QUICK_PROMPTS = [
  'Where are you right now?',
  'I am waiting near the main gate',
  'Please bring an extra helmet',
  'Traffic is heavy at the turn',
];

export default function PilotChatModal({
  visible,
  onClose,
  pilot = {
    name: 'Ramesh Kumar',
    vehicle: 'TVS Raider 125 • TS 09 UB 4821',
    avatarInitial: 'RK',
  },
  pickup = 'Gachibowli Junction',
  destination = 'Raidurg Metro Station',
  etaMinutes = 2,
  status = 'arriving',
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 'm_welcome',
      sender: 'pilot',
      text: `Namaste Bhaiya! I have accepted your ride. En route to ${pickup.split(',')[0]}, arriving in ~${etaMinutes} mins!`,
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  }, [visible, messages]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    const userMsg = {
      id: `u_${Date.now()}`,
      sender: 'rider',
      text,
      time: 'Now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const historyPayload = messages.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await pilotRidesAPI.sendChat({
        message: text,
        history: historyPayload,
        pilotName: pilot.name,
        vehicle: pilot.vehicle,
        status,
        etaMinutes,
        pickup,
        destination,
      });

      const replyText =
        res?.reply ||
        'Haanji bhaiya, I am on the way! Just take care, reaching your spot in a minute.';

      const pilotMsg = {
        id: `p_${Date.now()}`,
        sender: 'pilot',
        text: replyText,
        time: 'Just now',
      };

      setMessages((prev) => [...prev, pilotMsg]);
    } catch (err) {
      const fallbackMsg = {
        id: `p_${Date.now()}`,
        sender: 'pilot',
        text: 'Bhaiya reaching your location shortly! Please wait near the gate.',
        time: 'Just now',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.pilotProfile}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{pilot.avatarInitial || 'RK'}</Text>
                <View style={styles.onlineBadge} />
              </View>
              <View>
                <View style={styles.nameRow}>
                  <Text style={styles.pilotName}>{pilot.name}</Text>
                  <View style={styles.aiBadge}>
                    <Sparkles size={11} color="#0284C7" />
                    <Text style={styles.aiBadgeText}>Gemini AI Pilot</Text>
                  </View>
                </View>
                <Text style={styles.vehicleSubtitle}>{pilot.vehicle}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Safety Notice */}
          <View style={styles.safetyBanner}>
            <ShieldCheck size={14} color="#10B981" />
            <Text style={styles.safetyText}>
              In-ride verified pilot chat • Helmet secured • Mask sanitized
            </Text>
          </View>

          {/* Chat Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((item) => {
              const isRider = item.sender === 'rider';
              return (
                <View
                  key={item.id}
                  style={[
                    styles.messageRow,
                    isRider ? styles.riderMessageRow : styles.pilotMessageRow,
                  ]}
                >
                  {!isRider && (
                    <View style={styles.pilotSmallAvatar}>
                      <Bike size={13} color="#FFFFFF" />
                    </View>
                  )}
                  <View
                    style={[
                      styles.bubble,
                      isRider ? styles.riderBubble : styles.pilotBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.bubbleText,
                        isRider ? styles.riderBubbleText : styles.pilotBubbleText,
                      ]}
                    >
                      {item.text}
                    </Text>
                    <Text
                      style={[
                        styles.bubbleTime,
                        isRider ? styles.riderBubbleTime : styles.pilotBubbleTime,
                      ]}
                    >
                      {item.time}
                    </Text>
                  </View>
                  {isRider && (
                    <UserAvatar
                      name={user?.name || 'Anusha Maram'}
                      size={24}
                      backgroundColor="#0F172A"
                    />
                  )}
                </View>
              );
            })}

            {isTyping && (
              <View style={[styles.messageRow, styles.pilotMessageRow]}>
                <View style={styles.pilotSmallAvatar}>
                  <Bike size={13} color="#FFFFFF" />
                </View>
                <View style={[styles.bubble, styles.pilotBubble, styles.typingBubble]}>
                  <ActivityIndicator size="small" color="#0A84FF" />
                  <Text style={styles.typingText}>Ramesh is replying...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Quick Prompts */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quickPromptsBar}
            contentContainerStyle={styles.quickPromptsContent}
          >
            {QUICK_PROMPTS.map((prompt, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.promptChip}
                onPress={() => handleSend(prompt)}
              >
                <Text style={styles.promptChipText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Input Bar */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder={`Message ${pilot.name?.split(' ')[0]}...`}
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSend()}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                !inputText.trim() && { backgroundColor: '#E2E8F0' },
              ]}
              onPress={() => handleSend()}
              disabled={!inputText.trim()}
            >
              <Send
                size={18}
                color={inputText.trim() ? '#FFFFFF' : '#94A3B8'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    height: '75%',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pilotProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pilotName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
  },
  vehicleSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safetyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  safetyText: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '600',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 14,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  riderMessageRow: {
    justifyContent: 'flex-end',
  },
  pilotMessageRow: {
    justifyContent: 'flex-start',
  },
  pilotSmallAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  riderSmallAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  riderBubble: {
    backgroundColor: '#0A84FF',
    borderBottomRightRadius: 4,
  },
  pilotBubble: {
    backgroundColor: '#F1F5F9',
    borderBottomLeftRadius: 4,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  riderBubbleText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  pilotBubbleText: {
    color: '#0F172A',
    fontWeight: '500',
  },
  bubbleTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  riderBubbleTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  pilotBubbleTime: {
    color: '#94A3B8',
  },
  quickPromptsBar: {
    maxHeight: 44,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    backgroundColor: '#FFFFFF',
  },
  quickPromptsContent: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  promptChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  promptChipText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
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
});

