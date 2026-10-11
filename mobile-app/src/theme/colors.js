/**
 * CityPilot Brand Theme Colors
 * Direct palette derived from the official CityPilot design system
 */

export const colors = {
  // Brand Accents
  primary: '#0A84FF',      // CityPilot Blue
  primaryDark: '#0066CC',
  primaryLight: '#EBF5FF',
  primaryGlow: 'rgba(10, 132, 255, 0.15)',

  teal: '#14C38E',         // Eco / Metro Green
  tealLight: '#E8FBF4',
  tealDark: '#0E936B',

  yellow: '#FFC857',       // Transit Accent / Bike
  yellowLight: '#FFF9EB',
  yellowDark: '#D49F24',

  navy: '#0F172A',         // Primary Heading / Brand Dark
  navyLight: '#1E293B',
  navyDark: '#0B1120',

  // Surfaces & Backgrounds
  background: '#F8FAFC',   // Clean White / Slate Light UI
  card: '#FFFFFF',
  cardBackground: '#FFFFFF',
  cardMuted: '#F1F5F9',
  cardActive: '#F0F9FF',

  // Borders & Dividers
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderFocus: '#0A84FF',

  // Text
  text: '#0F172A',         // Slate 900
  textPrimary: '#0F172A',  // Explicit alias for text
  textSecondary: '#475569',// Slate 600
  textMuted: '#94A3B8',    // Slate 400
  textWhite: '#FFFFFF',

  // Status & Badges
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',

  // Multimodal Modes
  modeRoad: '#0A84FF',
  modeMetro: '#14C38E',
  modeBike: '#FFC857',
  modeAuto: '#A855F7',
  modeWalk: '#94A3B8',
  modeBus: '#F97316',
};

// Uppercase alias for convenience across screens
export const COLORS = colors;

export default colors;
