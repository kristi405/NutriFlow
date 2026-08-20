import { useEffect, useRef, useState } from 'react';
import { SymbolView } from 'expo-symbols';
import * as SplashScreen from 'expo-splash-screen';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Fonts, LoginButtonGreen } from '@/constants/theme';

const VISIBLE_DURATION = 3000;
const FADE_DURATION = 600;

export function IntroScreen({ onFinish }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const iconScale = useRef(new Animated.Value(0.4)).current;
  const iconPulse = useRef(new Animated.Value(1)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(12)).current;
  const [nativeSplashHidden, setNativeSplashHidden] = useState(false);

  useEffect(() => {
    if (!nativeSplashHidden) return;

    Animated.sequence([
      Animated.spring(iconScale, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true
      }),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        })
      ])
    ]).start(() => {
      Animated.loop(Animated.sequence([Animated.timing(iconPulse, {
        toValue: 1.08,
        duration: 700,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true
      }), Animated.timing(iconPulse, {
        toValue: 1,
        duration: 700,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true
      })])).start();
    });

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_DURATION,
        useNativeDriver: true
      }).start(({ finished }) => {
        if (finished) onFinish();
      });
    }, VISIBLE_DURATION);
    return () => clearTimeout(timer);
  }, [nativeSplashHidden]);

  return <View style={styles.container} onLayout={() => {
    SplashScreen.hideAsync().finally(() => setNativeSplashHidden(true));
  }}>
      <Animated.View style={[styles.content, { opacity }]}>
        <Animated.View style={[styles.iconBadge, {
        transform: [{ scale: Animated.multiply(iconScale, iconPulse) }]
      }]}>
          <SymbolView name="leaf.fill" size={64} tintColor="#ffffff" />
        </Animated.View>
        <Animated.Text style={[styles.title, {
        opacity: titleOpacity,
        transform: [{ translateY: titleTranslateY }]
      }]}>
          NOURVIA
        </Animated.Text>
      </Animated.View>
    </View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LoginButtonGreen,
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    alignItems: 'center',
    gap: 24
  },
  iconBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 36,
    letterSpacing: 4,
    fontWeight: '700',
    fontFamily: Fonts.rounded,
    color: '#ffffff'
  }
});
