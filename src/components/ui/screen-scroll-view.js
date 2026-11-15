import { LinearGradient } from 'expo-linear-gradient';
import { FlatList, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_HEIGHT, tabBarBottomGap } from '@/components/custom-tab-bar';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Insets/padding shared by ScreenScrollView and ScreenFlatList.
function useScreenPadding(isTabScreen) {
  const safeAreaInsets = useSafeAreaInsets();
  // The custom tab bar floats over content (position: absolute) instead of
  // reserving its own layout space, so every scrollable screen needs enough
  // bottom clearance to scroll its last item out from underneath it.
  const tabBarClearance = TAB_BAR_HEIGHT + tabBarBottomGap(safeAreaInsets.bottom) + Spacing.two;
  // Tab screens have no native header, so the status bar / notch inset has to
  // be padded explicitly. contentInset can't be used for that: it doesn't move
  // the initial scroll offset, so content would start under the status bar.
  // Screens pushed on the stack (native header, no tab bar) keep the old
  // behavior — the header already covers the top and there's no bar to clear.
  const insets = {
    top: isTabScreen ? safeAreaInsets.top + Spacing.two : Spacing.two,
    left: safeAreaInsets.left,
    right: safeAreaInsets.right,
    bottom: isTabScreen ? tabBarClearance : Spacing.three
  };
  const tabScreenPadding = isTabScreen ? { paddingTop: insets.top, paddingBottom: insets.bottom } : null;
  const platformStyle = Platform.select({
    android: {
      paddingTop: isTabScreen ? insets.top : safeAreaInsets.top + insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four
    }
  });
  return { insets, tabScreenPadding, platformStyle };
}

/** Shared scroll container matching the scaffold's insets pattern (see explore.tsx). */
export function ScreenScrollView({
  children,
  contentContainerStyle,
  gap = Spacing.five,
  horizontalPadding = Spacing.four,
  isTabScreen = false,
  ...rest
}) {
  const theme = useTheme();
  const { insets, tabScreenPadding, platformStyle } = useScreenPadding(isTabScreen);
  return <LinearGradient colors={[theme.background, theme.primarySoft, theme.accentSoft]} style={styles.flex1}>
      <ScrollView style={styles.scrollView} contentInset={isTabScreen ? undefined : insets} contentContainerStyle={[styles.contentContainer, tabScreenPadding, platformStyle, contentContainerStyle]} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} {...rest}>
        <View style={[styles.container, { gap, paddingHorizontal: horizontalPadding }]}>{children}</View>
      </ScrollView>
      {Platform.OS === 'android' && <LinearGradient colors={['transparent', 'rgba(0, 0, 0, 0.10)']} style={styles.tabBarShadow} pointerEvents="none" />}
    </LinearGradient>;
}

/**
 * Virtualized counterpart of ScreenScrollView for long lists (catalog
 * ingredients/recipes): same background, insets and side padding, but rows
 * are rendered lazily by FlatList. `gap` becomes the spacing between rows;
 * everything above the rows goes into `ListHeaderComponent`.
 */
export function ScreenFlatList({
  contentContainerStyle,
  gap = Spacing.two,
  horizontalPadding = Spacing.four,
  isTabScreen = false,
  ...rest
}) {
  const theme = useTheme();
  const { insets, tabScreenPadding, platformStyle } = useScreenPadding(isTabScreen);
  return <LinearGradient colors={[theme.background, theme.primarySoft, theme.accentSoft]} style={styles.flex1}>
      <FlatList style={[styles.scrollView, styles.list]} contentInset={isTabScreen ? undefined : insets} contentContainerStyle={[tabScreenPadding, platformStyle, { gap, paddingHorizontal: horizontalPadding }, contentContainerStyle]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" initialNumToRender={12} maxToRenderPerBatch={12} windowSize={7} removeClippedSubviews={Platform.OS === 'android'} {...rest} />
      {Platform.OS === 'android' && <LinearGradient colors={['transparent', 'rgba(0, 0, 0, 0.10)']} style={styles.tabBarShadow} pointerEvents="none" />}
    </LinearGradient>;
}
const styles = StyleSheet.create({
  flex1: {
    flex: 1
  },
  scrollView: {
    flex: 1
  },
  list: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center'
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: 'center'
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    gap: Spacing.five
  },
  tabBarShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 14
  }
});
