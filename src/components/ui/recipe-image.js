import { useState } from 'react';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/theme';

const theme = Colors.light;

export function RecipeImage({ uri, style, contentFit = 'cover', transition = 150, iconSize = 22 }) {
  const [failed, setFailed] = useState(false);

  if (!uri || failed) {
    return <View style={[styles.fallback, style]}>
        <SymbolView name="fork.knife" size={iconSize} tintColor={theme.textSecondary} />
      </View>;
  }

  return <Image source={{
    uri
  }} style={style} contentFit={contentFit} transition={transition} onError={() => setFailed(true)} />;
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: theme.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
