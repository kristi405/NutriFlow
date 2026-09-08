/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';
import { Platform } from 'react-native';
export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    primary: '#3FA66B',
    primarySoft: '#E3F4EA',
    secondary: '#2E6B8A',
    border: '#E4E4E8',
    success: '#3FA66B',
    warning: '#C9821F',
    error: '#D2483C',
    accent: '#4CAF50',
    accentSoft: '#E8F5E9'
  },
  dark: {
    text: '#ffffff',
    background: '#123321',
    backgroundElement: '#1D4A32',
    backgroundSelected: '#295C40',
    textSecondary: '#B0B4BA',
    primary: '#57C486',
    primarySoft: '#173424',
    secondary: '#6BB4DA',
    border: '#295C40',
    success: '#57C486',
    warning: '#E0A24B',
    error: '#E5695D',
    accent: '#57C486',
    accentSoft: '#1D4A32'
  }
};
export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace'
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace'
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)'
  }
});
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64
};
export const BottomTabInset = Platform.select({
  ios: 50,
  android: 80
}) ?? 0;
export const MaxContentWidth = 800;
/** @deprecated Use theme.accent (from useAppTheme) so the color follows dark mode. */
export const LoginButtonGreen = '#4CAF50';
/** @deprecated Use theme.accentSoft (from useAppTheme) so the color follows dark mode. */
export const LoginGradientAccent = '#E8F5E9';
/** @deprecated Use theme.accentSoft (from useAppTheme) so the color follows dark mode. */
export const LoginIconBackground = '#E8F5E9';
