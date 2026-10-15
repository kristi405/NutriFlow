import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

// Faint, slowly-drifting food photos for a screen's background (sign-in,
// paywall, …) — purely decorative, so they sit low-opacity and never
// intercept touches. Render it as an absolute-fill sibling behind the real
// content, inside the same full-screen gradient/container.
const PHOTOS = [{
  uri: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=300',
  style: { top: '4%', left: '-16%', width: 220, height: 220 },
  rotate: -8,
  delay: 0
}, {
  uri: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300',
  style: { top: '12%', right: '-20%', width: 240, height: 240 },
  rotate: 10,
  delay: 400
}, {
  uri: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300',
  style: { bottom: '18%', left: '-18%', width: 210, height: 210 },
  rotate: 6,
  delay: 800
}, {
  uri: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300',
  style: { bottom: '8%', right: '-14%', width: 230, height: 230 },
  rotate: -6,
  delay: 1200
}];

function FloatingPhoto({ uri, style, rotate, delay, opacity }) {
  const offset = useSharedValue(0);

  useEffect(() => {
    offset.value = withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 2600, easing: Easing.inOut(Easing.sin) })), -1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value * -28 }, { rotate: `${rotate + offset.value * 10}deg` }, { scale: 1 + offset.value * 0.08 }]
  }));

  return <Animated.View style={[styles.photoWrapper, style, animatedStyle]}>
      <Image source={{ uri }} style={[styles.photo, { opacity }]} contentFit="cover" />
    </Animated.View>;
}

export function FoodBackgroundDecor({ opacity = 0.22 }) {
  return <>
      {PHOTOS.map(photo => <FloatingPhoto key={photo.uri} uri={photo.uri} style={photo.style} rotate={photo.rotate} delay={photo.delay} opacity={opacity} />)}
    </>;
}

const styles = StyleSheet.create({
  photoWrapper: {
    position: 'absolute'
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 36
  }
});
