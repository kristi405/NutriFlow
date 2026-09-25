import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export function PersonAvatar({ profile, size = 28 }) {
  const theme = useTheme();
  const initial = profile?.name?.trim().charAt(0).toUpperCase() || '?';
  const dimension = { width: size, height: size, borderRadius: size / 2 };

  if (profile?.photoUri) {
    return <Image source={{ uri: profile.photoUri }} style={dimension} contentFit="cover" />;
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
