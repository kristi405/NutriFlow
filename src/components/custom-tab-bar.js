import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

// Same icon set as before — kept alongside the tab bar so it stays a single
// source of truth for which icon goes with which route.
const TAB_ICONS = {
  index: { ios: 'house.fill', android: 'home', web: 'home' },
  recipes: { ios: 'fork.knife', android: 'restaurant_menu', web: 'restaurant_menu' },
  'meal-plan': { ios: 'calendar', android: 'calendar_today', web: 'calendar_today' },
  articles: { ios: 'newspaper.fill', android: 'article', web: 'article' },
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

// Stacked strips of increasing blur fake a gradual blur — a single BlurView
// would end in a hard visible edge above the bar.
const BLUR_STEPS = [6, 16, 30, 45, 60];

function TabButton({ isFocused, onPress, icon, label, theme }) {
  const scale = useRef(new Animated.Value(1)).current;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!isFocused) return;
    Animated.sequence([Animated.timing(scale, { toValue: 1.18, duration: 160, easing: Easing.out(Easing.quad), useNativeDriver: true }), Animated.spring(scale, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true })]).start();
  }, [isFocused]);
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.tabButton, pressed && styles.tabButtonPressed]}>
      <Animated.View style={[styles.tabContent, { transform: [{ scale }] }]}>
        {isFocused && <View style={[styles.activeBackground, { backgroundColor: theme.accentSoft, shadowColor: theme.accent }]} />}
        <SymbolView name={icon} size={22} tintColor={isFocused ? theme.accent : theme.textSecondary} />
        <ThemedText type="caption" color={isFocused ? theme.accent : theme.textSecondary} style={styles.label}>
          {label}
        </ThemedText>
      </Animated.View>
    </Pressable>;
}

export function CustomTabBar({ state, descriptors, navigation }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const visibleRoutes = state.routes.filter(route => !HIDDEN_ROUTES.has(route.name));

  return <View pointerEvents="box-none" style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View pointerEvents="none" style={styles.fade}>
        {BLUR_STEPS.map(intensity => <BlurView key={intensity} intensity={intensity} tint={theme.text === '#ffffff' ? 'dark' : 'light'} style={styles.blurStrip} />)}
        <LinearGradient colors={[`${theme.background}00`, `${theme.background}B3`]} style={StyleSheet.absoluteFill} />
      </View>
      <View style={[styles.bar, { backgroundColor: theme.background, shadowColor: '#000000' }]}>
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

        return <TabButton key={route.key} isFocused={isFocused} onPress={handlePress} icon={TAB_ICONS[iconKey]} label={label} theme={theme} />;
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
  fade: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    bottom: 0
  },
  blurStrip: {
    flex: 1
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    height: TAB_BAR_HEIGHT,
    borderRadius: 32,
    paddingHorizontal: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 12
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
    top: 5,
    bottom: 5,
    left: -5,
    right: -5,
    borderRadius: 27,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3
  },

  tabContent: {
    alignSelf: 'stretch',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2
  },
  label: {
    fontSize: 9,
    fontWeight: '600'
  }
});
