import { useMemo, useState } from 'react';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

export function RecipeImage({ uri, style, contentFit = 'cover', transition = 150, iconSize = 22 }) {
  const [failed, setFailed] = useState(false);
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!uri || failed) {
    return <View style={[styles.fallback, style]}>
        <SymbolView name={{ ios: 'fork.knife', android: 'restaurant_menu', web: 'restaurant_menu' }} size={iconSize} tintColor={theme.textSecondary} />
      </View>;
  }

  return <Image source={{
    uri
  }} style={style} contentFit={contentFit} transition={transition} onError={() => setFailed(true)} />;
}

const createStyles = theme => StyleSheet.create({
  fallback: {
    backgroundColor: theme.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
