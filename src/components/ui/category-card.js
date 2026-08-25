import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
export function CategoryCard({
  category,
  width = 108
}) {
  return <Link href={{
    pathname: '/recipes',
    params: {
      category: category.id
    }
  }} asChild>
      <Pressable style={{
      width
    }}>
        {({ pressed }) => <View style={pressed && styles.pressed}>
            <View style={styles.imageWrapper}>
              <Image source={{
              uri: category.imageUrl
            }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
              <View style={[StyleSheet.absoluteFill, styles.overlay]} />
              <ThemedText type="smallBold" style={styles.label} numberOfLines={2}>
                {category.name}
              </ThemedText>
            </View>
          </View>}
      </Pressable>
    </Link>;
}
const styles = StyleSheet.create({
  imageWrapper: {
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end'
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.28)'
  },
  label: {
    color: '#ffffff',
    padding: 10
  },
  pressed: {
    opacity: 0.85
  }
});
