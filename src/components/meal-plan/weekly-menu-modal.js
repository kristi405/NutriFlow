import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Animated, Easing, Modal, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// status: 'generating' | 'done' | null (hidden)
export function WeeklyMenuModal({ status }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const pulse = useRef(new Animated.Value(1)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status !== 'generating') return;
    const loop = Animated.loop(Animated.sequence([Animated.timing(pulse, {
      toValue: 1.18,
      duration: 650,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true
    }), Animated.timing(pulse, {
      toValue: 1,
      duration: 650,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true
    })]));
    loop.start();
    return () => loop.stop();
  }, [status]);

  useEffect(() => {
    if (status === 'done') {
      checkScale.setValue(0);
      Animated.spring(checkScale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }).start();
    }
  }, [status]);

  const isDone = status === 'done';

  return <Modal visible={status !== null} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {isDone ? <Animated.View style={[styles.iconCircle, styles.iconCircleDone, { transform: [{ scale: checkScale }] }]}>
              <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={34} tintColor="#ffffff" />
            </Animated.View> : <>
              <Animated.View style={[styles.iconCircle, { transform: [{ scale: pulse }] }]}>
                <SymbolView name={{ ios: 'calendar.badge.plus', android: 'calendar_add_on', web: 'calendar_add_on' }} size={30} tintColor={theme.accent} />
              </Animated.View>
              <ActivityIndicator color={theme.accent} />
            </>}
          <ThemedText type="headline" color={theme.text} style={styles.centerText}>
            {isDone ? t('mealPlan.weekGeneratedTitle') : t('mealPlan.generatingWeekTitle')}
          </ThemedText>
          <ThemedText type="small" color={theme.textSecondary} style={styles.centerText}>
            {isDone ? t('mealPlan.weekGeneratedMessage') : t('mealPlan.generatingWeekMessage')}
          </ThemedText>
        </View>
      </View>
    </Modal>;
}

const createStyles = theme => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.five
  },
  card: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: theme.background,
    borderRadius: 24,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconCircleDone: {
    backgroundColor: theme.accent
  },
  centerText: {
    textAlign: 'center'
  }
});
