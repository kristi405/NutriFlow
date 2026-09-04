import { useEffect, useRef, useState } from 'react';
import { SymbolView } from 'expo-symbols';
import { Animated, Easing, Pressable } from 'react-native';

const SKIN_TONES = ['#FFDBAC', '#F1C27D', '#C68642', '#8D5524'];
const WAVE_ITERATIONS = 8;

export function WavingHand({ size = 18 }) {
  const wave = useRef(new Animated.Value(0)).current;
  const [toneIndex, setToneIndex] = useState(0);

  useEffect(() => {
    const singleWave = Animated.sequence([
      Animated.timing(wave, { toValue: 1, duration: 150, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(wave, { toValue: -1, duration: 300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(wave, { toValue: 0, duration: 150, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
    ]);
    const loop = Animated.loop(singleWave, { iterations: WAVE_ITERATIONS });
    loop.start();
    return () => loop.stop();
  }, []);

  const rotate = wave.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-15deg', '15deg']
  });

  return <Pressable onPress={() => setToneIndex(index => (index + 1) % SKIN_TONES.length)} hitSlop={8}>
      <Animated.View style={{ transform: [{ rotate }] }}>
        <SymbolView name={{ ios: 'hand.wave.fill', android: 'waving_hand', web: 'waving_hand' }} size={size} tintColor={SKIN_TONES[toneIndex]} />
      </Animated.View>
    </Pressable>;
}
