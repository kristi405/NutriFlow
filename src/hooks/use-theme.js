/**
 * The active color palette. Driven by the manual Dark Mode switch in Settings
 * (themeStore), not the OS appearance setting — call from an observer()-wrapped
 * component (or a component rendered under one) so toggling it re-renders.
 */

import { Colors } from '@/constants/theme';
import { themeStore } from '@/store/themeStore';
export function useTheme() {
  return themeStore.isDarkMode ? Colors.dark : Colors.light;
}
