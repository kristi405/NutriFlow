import { LinearGradient } from 'expo-linear-gradient';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, LoginGradientAccent, MaxContentWidth, Spacing } from '@/constants/theme';

/** Shared scroll container matching the scaffold's insets pattern (see explore.tsx). */
export function ScreenScrollView({
  children,
  contentContainerStyle,
  gap = Spacing.five,
  horizontalPadding = Spacing.four,
  ...rest
}) {
  const safeAreaInsets = useSafeAreaInsets();
  // NativeTabs reserves safe-area space for its content on iOS, but on Android
  // (edge-to-edge by default) it does not pad the top for the status bar / camera
  // cutout, so that has to be added here explicitly.
  const insets = {
    top: Spacing.two,
    left: safeAreaInsets.left,
    right: safeAreaInsets.right,
    bottom: Spacing.three
  };
  const platformStyle = Platform.select({
    android: {
      paddingTop: safeAreaInsets.top + insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four
    }
  });
  return <LinearGradient colors={[Colors.light.background, Colors.light.primarySoft, LoginGradientAccent]} style={styles.flex1}>
      <ScrollView style={styles.scrollView} contentInset={insets} contentContainerStyle={[styles.contentContainer, platformStyle, contentContainerStyle]} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} {...rest}>
        <View style={[styles.container, { gap, paddingHorizontal: horizontalPadding }]}>{children}</View>
      </ScrollView>
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
