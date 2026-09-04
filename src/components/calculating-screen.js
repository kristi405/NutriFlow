import { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors, LoginButtonGreen, LoginGradientAccent } from '@/constants/theme';

const theme = Colors.light;
const PROGRESS_DURATION = 5000;

export function CalculatingScreen() {
  const { t } = useTranslation();
  const progress = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: PROGRESS_DURATION,
      easing: Easing.linear,
      useNativeDriver: false
    }).start();

    Animated.loop(Animated.sequence([Animated.timing(pulse, {
      toValue: 1.15,
      duration: 700,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true
    }), Animated.timing(pulse, {
      toValue: 1,
      duration: 700,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true
    })])).start();
  }, []);

  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return <LinearGradient colors={[Colors.light.background, Colors.light.primarySoft, LoginGradientAccent]} style={styles.flex1}>
      <View style={styles.content}>
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <SymbolView name={{ ios: 'leaf.fill', android: 'eco', web: 'eco' }} size={32} tintColor={LoginButtonGreen} />
        </Animated.View>

        <View style={styles.track}>
          <Animated.View style={[styles.fill, { width: fillWidth }]} />
        </View>

        <ThemedText type="headline" style={styles.text} color={theme.text}>
          {t('calculating.title')}
        </ThemedText>
      </View>
    </LinearGradient>;
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 32
  },
  track: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.border,
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: LoginButtonGreen
  },
  text: {
    textAlign: 'center'
  }
});
