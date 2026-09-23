import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

// Same icon set as before — kept alongside the tab bar so it stays a single
// source of truth for which icon goes with which route.
const TAB_ICONS = {
  index: { ios: 'house.fill', android: 'home', web: 'home' },
  recipes: { ios: 'fork.knife', android: 'restaurant_menu', web: 'restaurant_menu' },
  'meal-plan': { ios: 'calendar', android: 'calendar_today', web: 'calendar_today' },
  'ai-analysis': { ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' },
  progress: { ios: 'chart.line.uptrend.xyaxis', android: 'show_chart', web: 'show_chart' }
};

// profile is reachable via router.push('/profile') (from the Home header) but
// isn't a button in the bar itself — same as it was hidden on NativeTabs.
const HIDDEN_ROUTES = new Set(['profile']);

// The bar floats over screen content (like the native tab bar it replaced),
// so scrollable screens need to know how much bottom clearance to leave —
// see ScreenScrollView, which imports this.
export const TAB_BAR_HEIGHT = 64;

export function CustomTabBar({ state, descriptors, navigation }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const visibleRoutes = state.routes.filter(route => !HIDDEN_ROUTES.has(route.name));

  return <View pointerEvents="box-none" style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={[styles.bar, { backgroundColor: theme.background, shadowColor: theme.text }]}>
        {visibleRoutes.map(route => {
        const routeIndex = state.routes.findIndex(item => item.key === route.key);
        const { options } = descriptors[route.key];
        const label = options.title ?? route.name;
        const isFocused = state.index === routeIndex;
        // Nested screens (e.g. recipes/index.js) can register with a route
        // name like "recipes/index" rather than the bare folder name.
        const iconKey = route.name.replace(/\/index$/, '');

        function handlePress() {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        }

        return <Pressable key={route.key} onPress={handlePress} style={({ pressed }) => [styles.tabButton, pressed && styles.tabButtonPressed]}>
              {isFocused && <View style={[styles.activeBackground, { backgroundColor: theme.accentSoft }]} />}
              <SymbolView name={TAB_ICONS[iconKey]} size={22} tintColor={isFocused ? theme.accent : theme.textSecondary} />
              <ThemedText type="caption" color={isFocused ? theme.accent : theme.textSecondary} style={styles.label}>
                {label}
              </ThemedText>
            </Pressable>;
      })}
      </View>
    </View>;
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center'
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    height: TAB_BAR_HEIGHT,
    borderRadius: 32,
    paddingHorizontal: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    height: '100%'
  },
  tabButtonPressed: {
    opacity: 0.6
  },
  activeBackground: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    left: 6,
    right: 6,
    borderRadius: 24
  },
  label: {
    fontSize: 9,
    fontWeight: '600'
  }
});
