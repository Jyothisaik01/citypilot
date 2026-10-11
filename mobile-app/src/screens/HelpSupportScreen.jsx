import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Linking,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Search,
  MessageCircleQuestion,
  Phone,
  Mail,
  MessageSquare,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrainFront as Train,
  ShieldCheck,
  Zap,
  ExternalLink,
  Send,
  X,
  CheckCircle2,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import CustomPopupModal from '../components/CustomPopupModal';

const FAQS = [
  {
    id: 'f1',
    category: 'Multimodal Transit',
    question: 'How does CityPilot calculate savings vs direct cabs?',
    answer:
      'CityPilot compares direct cab rides (Uber/Ola/Rapido) with synchronized multimodal trips (e.g. Electric Bike to Metro station + Hyderabad Metro Blue/Red Line + brief walk). We factor in real-time traffic delays, surge multipliers, and Hyderabad Metro fixed fares (₹10–₹60) to show you both the rupees saved and time efficiency.',
  },
  {
    id: 'f2',
    category: 'Multimodal Transit',
    question: 'What is the "Native Ride Booking" mode vs "Smart Transit"?',
    answer:
      'In Smart Transit Mode, CityPilot optimizes your route and deep-links you to partner apps (Rapido, Uber, Hyderabad Metro WhatsApp ticket bot). In Native Ride Booking Mode, CityPilot matches you directly with verified local first-mile pilots for instant pickup at designated transit hubs.',
  },
  {
    id: 'f3',
    category: 'Hyderabad Metro',
    question: 'Which Hyderabad Metro lines and stations are covered?',
    answer:
      'CityPilot covers all 3 operational corridors of Hyderabad Metro Rail:\n• Blue Line: Nagole ⇄ Raidurg (29 km - HITEC City corridor)\n• Red Line: Miyapur ⇄ LB Nagar (29 km - Ameerpet interchange)\n• Green Line: JBS Parade Ground ⇄ MGBS (11 km)\nReal-time frequency (every 3.5 to 5 mins) and transfer stations (Ameerpet, MGBS, Parade Ground) are dynamically tracked.',
  },
  {
    id: 'f4',
    category: 'Hyderabad Metro',
    question: 'How do I book or recharge Hyderabad Metro tickets?',
    answer:
      'You can instantly generate official WhatsApp QR e-tickets by tapping Metro stations inside CityPilot. We also deep-link to PhonePe and Paytm for 10% discount Smart Card recharges and Metro holiday passes.',
  },
  {
    id: 'f5',
    category: 'Payments & Fares',
    question: 'How do payments work for first-mile and multimodal rides?',
    answer:
      'For partner rides (Uber, Rapido), payment is settled directly within the respective partner app via UPI, cards, or cash. For CityPilot native rides, payments are processed securely via UPI and stored receipts are available under "My Trips".',
  },
  {
    id: 'f6',
    category: 'Account & GPS',
    question: 'Why does CityPilot require background location permission?',
    answer:
      'Background location is used strictly during active navigation to alert you when your Metro train is approaching your transfer interchange (e.g. Ameerpet) and when your destination station is reached so you never miss a stop.',
  },
  {
    id: 'f7',
    category: 'Payments & Fares',
    question: 'What if a train is delayed or my first-mile bike cancels?',
    answer:
      'Oreo AI detects live route anomalies and immediately re-routes you via alternative transit combinations (e.g. RTC Express bus or alternative auto stand) with zero penalty.',
  },
];

const EMERGENCY_HELPLINES = [
  { name: 'Hyderabad Metro Helpline', phone: '040-23332555', desc: 'Station lost & found & train updates' },
  { name: 'TSRTC Bus Enquiry', phone: '040-69440000', desc: 'Hyderabad city bus timings & passes' },
  { name: 'Police Emergency & Traffic', phone: '100', desc: 'Traffic congestion & road emergencies' },
  { name: 'Women Safety / SHE Teams', phone: '1098', desc: '24/7 Hyderabad safety helpline' },
];

export default function HelpSupportScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedFaqId, setExpandedFaqId] = useState('f1');
  const [isTicketModalVisible, setIsTicketModalVisible] = useState(false);
  const [ticketCategory, setTicketCategory] = useState('Route Issue');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [popup, setPopup] = useState({ visible: false, title: '', message: '', type: 'info' });

  const categories = ['All', 'Multimodal Transit', 'Hyderabad Metro', 'Payments & Fares', 'Account & GPS'];

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      setPopup({
        visible: true,
        type: 'info',
        title: 'Helpline Contact',
        message: `Please dial ${phoneNumber} directly from your phone app.`,
      });
    });
  };

  const handleEmailSupport = () => {
    const subject = encodeURIComponent('CityPilot Transit Support Inquiry');
    const body = encodeURIComponent('Hello CityPilot Team,\n\nI need help with:\n');
    Linking.openURL(`mailto:support@citypilot.in?subject=${subject}&body=${body}`).catch(() => {
      setPopup({
        visible: true,
        type: 'info',
        title: 'Email Support',
        message: 'Please send an email to support@citypilot.in with your query.',
      });
    });
  };

  const handleWhatsAppSupport = () => {
    const msg = encodeURIComponent('Hi CityPilot Support, I have a question regarding my route in Hyderabad.');
    Linking.openURL(`https://wa.me/919100012345?text=${msg}`).catch(() => {
      setPopup({
        visible: true,
        type: 'info',
        title: 'WhatsApp Support',
        message: 'You can message CityPilot Support at +91 91000 12345.',
      });
    });
  };

  const handleSubmitTicket = () => {
    if (!ticketMessage.trim()) {
      setPopup({
        visible: true,
        type: 'danger',
        title: 'Missing Details',
        message: 'Please describe the issue you encountered so our Hyderabad team can assist you.',
      });
      return;
    }

    const ticketId = `CP-${Math.floor(100000 + Math.random() * 900000)}`;
    setIsTicketModalVisible(false);
    setTicketMessage('');
    setTicketEmail('');

    setPopup({
      visible: true,
      type: 'success',
      title: 'Ticket Submitted',
      message: `Your support ticket #${ticketId} has been logged. Our Hyderabad support desk will review and update you shortly.`,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.navy} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <Text style={styles.headerSubtitle}>Hyderabad Transit Assistance & FAQs</Text>
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search FAQs, Metro fares, transfers..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClearBtn}>
              <X size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* 3 Quick Action Cards */}
        <View style={styles.quickActionsGrid}>
          {/* 1. Oreo AI Assistant */}
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('OreoChat')}
            activeOpacity={0.85}
          >
            <View style={[styles.quickCardIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Sparkles size={20} color="#0A84FF" />
            </View>
            <Text style={styles.quickCardTitle}>Ask Oreo AI</Text>
            <Text style={styles.quickCardDesc}>Instant transit guidance & fare queries</Text>
            <View style={styles.quickCardTag}>
              <Text style={styles.quickCardTagText}>Instant 24/7</Text>
            </View>
          </TouchableOpacity>

          {/* 2. WhatsApp Support */}
          <TouchableOpacity
            style={styles.quickCard}
            onPress={handleWhatsAppSupport}
            activeOpacity={0.85}
          >
            <View style={[styles.quickCardIconCircle, { backgroundColor: '#ECFDF5' }]}>
              <MessageSquare size={20} color="#059669" />
            </View>
            <Text style={styles.quickCardTitle}>WhatsApp Chat</Text>
            <Text style={styles.quickCardDesc}>Chat with CityPilot Hyderabad team</Text>
            <View style={[styles.quickCardTag, { backgroundColor: '#ECFDF5' }]}>
              <Text style={[styles.quickCardTagText, { color: '#059669' }]}>WhatsApp</Text>
            </View>
          </TouchableOpacity>

          {/* 3. Report an Issue */}
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => setIsTicketModalVisible(true)}
            activeOpacity={0.85}
          >
            <View style={[styles.quickCardIconCircle, { backgroundColor: '#FFFBEB' }]}>
              <AlertCircle size={20} color="#D97706" />
            </View>
            <Text style={styles.quickCardTitle}>Report Issue</Text>
            <Text style={styles.quickCardDesc}>Route bugs, delayed transit or fare issues</Text>
            <View style={[styles.quickCardTag, { backgroundColor: '#FFFBEB' }]}>
              <Text style={[styles.quickCardTagText, { color: '#D97706' }]}>New Ticket</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Emergency & Official Helplines */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Transit & Emergency Helplines</Text>
          <Text style={styles.sectionBadge}>Direct Call</Text>
        </View>

        <View style={styles.helplineList}>
          {EMERGENCY_HELPLINES.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.helplineCard}
              onPress={() => handleCall(item.phone)}
              activeOpacity={0.7}
            >
              <View style={styles.helplineIcon}>
                <Phone size={16} color={colors.primary} />
              </View>
              <View style={styles.helplineInfo}>
                <Text style={styles.helplineName}>{item.name}</Text>
                <Text style={styles.helplineDesc}>{item.desc}</Text>
              </View>
              <View style={styles.helplinePhoneBtn}>
                <Text style={styles.helplinePhoneText}>{item.phone}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQs Category Tabs */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <Text style={styles.sectionCount}>{filteredFaqs.length} FAQs</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat && styles.categoryChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FAQ Accordion List */}
        <View style={styles.faqList}>
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedFaqId === faq.id;
            return (
              <View key={faq.id} style={styles.faqCard}>
                <TouchableOpacity
                  style={styles.faqHeader}
                  onPress={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.faqHeaderLeft}>
                    <View style={styles.faqDot} />
                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                  </View>
                  {isExpanded ? (
                    <ChevronUp size={18} color={colors.primary} />
                  ) : (
                    <ChevronDown size={18} color={colors.textMuted} />
                  )}
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                    <View style={styles.faqMetaRow}>
                      <View style={styles.faqCategoryBadge}>
                        <Text style={styles.faqCategoryText}>{faq.category}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.faqAskOreoBtn}
                        onPress={() =>
                          navigation.navigate('OreoChat', {
                            initialPrompt: `I have a question about: ${faq.question}`,
                          })
                        }
                      >
                        <Sparkles size={12} color={colors.primary} />
                        <Text style={styles.faqAskOreoText}>Discuss with Oreo</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Email Direct Contact */}
        <View style={styles.emailCard}>
          <View style={styles.emailCardLeft}>
            <Mail size={22} color={colors.primary} />
            <View>
              <Text style={styles.emailCardTitle}>Need dedicated help?</Text>
              <Text style={styles.emailCardSub}>Email us at support@citypilot.in</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.emailBtn} onPress={handleEmailSupport} activeOpacity={0.8}>
            <Text style={styles.emailBtnText}>Write Email</Text>
          </TouchableOpacity>
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>CityPilot Hyderabad Mobility Assistance</Text>
          <Text style={styles.footerSub}>App Version v1.0.0 • Made with ❤️ for Hyderabad Commuters</Text>
        </View>
      </ScrollView>

      {/* Ticket Modal */}
      <Modal visible={isTicketModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <AlertCircle size={20} color={colors.primary} />
                <Text style={styles.modalTitle}>Report an Issue</Text>
              </View>
              <TouchableOpacity onPress={() => setIsTicketModalVisible(false)} style={styles.modalCloseBtn}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <Text style={styles.inputLabel}>Issue Category</Text>
              <View style={styles.modalCategoryRow}>
                {['Route Issue', 'Metro Delay', 'Fare Dispute', 'App Bug'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.modalCatChip,
                      ticketCategory === cat && styles.modalCatChipActive,
                    ]}
                    onPress={() => setTicketCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.modalCatText,
                        ticketCategory === cat && styles.modalCatTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Contact Email (optional)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="you@domain.com"
                placeholderTextColor={colors.textMuted}
                value={ticketEmail}
                onChangeText={setTicketEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Description & Details *</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="Describe what happened (station name, route, or unexpected fare)..."
                placeholderTextColor={colors.textMuted}
                value={ticketMessage}
                onChangeText={setTicketMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSubmitTicket}
                activeOpacity={0.85}
              >
                <Send size={16} color="#FFFFFF" />
                <Text style={styles.modalSubmitBtnText}>Submit to Support</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Branded Custom Popup Dialog */}
      <CustomPopupModal
        visible={popup.visible}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        confirmText="OK"
        onConfirm={() => setPopup({ ...popup, visible: false })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.navy,
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: colors.navy,
    paddingVertical: 0,
  },
  searchClearBtn: {
    padding: 4,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'flex-start',
  },
  quickCardIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 2,
  },
  quickCardDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
    marginBottom: 8,
    height: 30,
  },
  quickCardTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  quickCardTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0A84FF',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: colors.navy,
  },
  sectionBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  sectionCount: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textMuted,
  },
  helplineList: {
    gap: 8,
    marginBottom: 20,
  },
  helplineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  helplineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  helplineInfo: {
    flex: 1,
  },
  helplineName: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.navy,
  },
  helplineDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  helplinePhoneBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 8,
  },
  helplinePhoneText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.navy,
  },
  categoryScroll: {
    gap: 8,
    marginBottom: 14,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  faqList: {
    gap: 8,
    marginBottom: 20,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  faqHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  faqDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 10,
  },
  faqQuestion: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.navy,
    flex: 1,
  },
  faqAnswerContainer: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  faqAnswer: {
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 19,
    marginTop: 8,
  },
  faqMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  faqCategoryBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  faqCategoryText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  faqAskOreoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  faqAskOreoText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.primary,
  },
  emailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    backgroundColor: '#F0F9FF',
    marginBottom: 20,
  },
  emailCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emailCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.navy,
  },
  emailCardSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  emailBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6.5,
    borderRadius: 8,
  },
  emailBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.navy,
  },
  footerSub: {
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.navy,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 6,
    marginTop: 8,
  },
  modalCategoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  modalCatChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalCatChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: colors.primary,
  },
  modalCatText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modalCatTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.navy,
    marginBottom: 8,
  },
  modalTextArea: {
    minHeight: 90,
  },
  modalSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 13,
    gap: 8,
    marginTop: 14,
  },
  modalSubmitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
