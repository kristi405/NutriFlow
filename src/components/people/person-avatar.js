import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

// `iconFallback` swaps the no-photo state from an initial letter to a generic
// person icon — used where the avatar is a "switch account" affordance rather
// than a way to tell people apart (e.g. the Home header).
export function PersonAvatar({ profile, size = 28, iconFallback = false }) {
  const theme = useTheme();
  const initial = profile?.name?.trim().charAt(0).toUpperCase() || '?';
  const dimension = { width: size, height: size, borderRadius: size / 2 };

  if (profile?.photoUri) {
    return <Image source={{ uri: profile.photoUri }} style={dimension} contentFit="cover" />;
  }
  if (iconFallback) {
    return <View style={[styles.fallback, dimension, { backgroundColor: theme.accentSoft }]}>
        <SymbolView name={{ ios: 'person.fill', android: 'person', web: 'person' }} size={Math.round(size * 0.55)} tintColor={theme.accent} />
      </View>;
  }
  return <View style={[styles.fallback, dimension, { backgroundColor: theme.accentSoft }]}>
      <ThemedText type="smallBold" color={theme.accent} style={{ fontSize: size * 0.45, lineHeight: size * 0.6 }}>{initial}</ThemedText>
    </View>;
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center'
  }
});
