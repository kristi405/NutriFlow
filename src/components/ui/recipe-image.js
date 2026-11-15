import { useMemo } from 'react';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';
import { useImageFallback } from '@/hooks/useImageFallback';
import { useTheme } from '@/hooks/use-theme';

const DEFAULT_ICON = { ios: 'fork.knife', android: 'restaurant_menu', web: 'restaurant_menu' };

/**
 * Remote/local image with graceful degradation:
 * - `uri` is tried first (in lists: the server thumbnail, see toThumbUrl);
 * - `fallbackUri` if that fails (the original — a thumbnail may be missing);
 * - an icon placeholder if both fail or none is given.
 * `placeholderUri` is shown while `uri` loads — the full-size hero image uses
 * its already-cached thumbnail there.
 */
export function RecipeImage({ uri, fallbackUri, placeholderUri, style, contentFit = 'cover', transition = 150, iconSize = 22, icon = DEFAULT_ICON, iconColor, fallbackStyle }) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const source = useImageFallback(uri, fallbackUri);

  if (!source.uri) {
    return <View style={[styles.fallback, style, fallbackStyle]}>
        <SymbolView name={icon} size={iconSize} tintColor={iconColor ?? theme.textSecondary} />
      </View>;
  }

  return <Image source={{ uri: source.uri }} placeholder={placeholderUri && placeholderUri !== source.uri ? { uri: placeholderUri } : undefined} placeholderContentFit={contentFit} recyclingKey={source.uri} cachePolicy="memory-disk" style={style} contentFit={contentFit} transition={transition} onError={source.onError} />;
}

const createStyles = theme => StyleSheet.create({
  fallback: {
    backgroundColor: theme.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
