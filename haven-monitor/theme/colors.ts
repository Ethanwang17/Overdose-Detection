
// Theme system matching Haven design handoff exactly

export const Colors = {
  ink: '#15151A',
  white: '#FFFFFF',
  textSecondary: '#6A6A70',
  textTertiary: '#9A9AA0',
  textMuted: '#86868B',
  textFaint: '#A8A8AE',
  textDisabled: '#B0B0B5',
  bgGray: '#F4F4F6',
  bgScreen: '#FFFFFF',
  border: 'rgba(0, 0, 0, 0.06)',
  borderCard: 'rgba(0, 0, 0, 0.04)',
  chevron: '#C4C4C8',
  green: '#30A15C',
  greenDark: '#268C4E',
  greenTint: 'rgba(48, 161, 92, 0.07)',
  amber: '#E0980A',
  amberDark: '#B5790A',
  amberTint: 'rgba(224, 152, 10, 0.08)',
  amberBadgeTint: 'rgba(224, 152, 10, 0.09)',
  red: '#E5484D',
  redDark: '#D4333A',
  redTint: 'rgba(229, 72, 77, 0.08)',
  redBadgeTint: 'rgba(229, 72, 77, 0.09)',
  navBg: 'rgba(255, 255, 255, 0.72)',
  navBorder: 'rgba(255, 255, 255, 0.65)',
  overlayBg: 'rgba(18, 18, 22, 0.5)',
  overlayLight: 'rgba(18, 18, 22, 0.28)',
  cardBg: 'rgba(255, 255, 255, 0.94)',
  cardBorder: 'rgba(255, 255, 255, 0.7)',
  tabActive: 'rgba(20, 20, 26, 0.06)',
  tabInactiveBorder: 'rgba(0, 0, 0, 0.14)',
  signOut: '#E5484D',
} as const;

export const Radius = {
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  statusCard: 26,
  tabBar: 26,
  overlay: 30,
  sheet: 28,
} as const;

export const Spacing = {
  xs: 6,
  sm: 8,
  md: 12,
  base: 16,
  lg: 18,
  xl: 22,
  xxl: 24,
  section: 26,
  screen: 30,
  huge: 34,
  hero: 38,
} as const;

export const FontSize = {
  tiny: 11,
  xs: 12,
  sm: 13,
  base: 14,
  md: 15,
  lg: 16,
  xl: 17,
  xxl: 18,
  heading4: 19,
  heading3: 23,
  heading2: 25,
  heading1: 32,
  display2: 40,
  display1: 44,
  hero: 46,
  metric: 58,
} as const;

export const FontWeight = {
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Shadow = {
  nav: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 32,
    elevation: 8,
  },
  overlay: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.32,
    shadowRadius: 70,
    elevation: 24,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 60,
    elevation: 14,
  },
} as const;

export const Theme = { Colors, Radius, Spacing, FontSize, FontWeight, Shadow };
export default Theme;
