import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const AGE_MIN = 5;
const AGE_MAX = 99;
const AGE_DEFAULT = 20;
const AGE_ITEM_HEIGHT = 30;
const AGE_VISIBLE_ITEMS = 3;
const AGES = Array.from({ length: AGE_MAX - AGE_MIN + 1 }, (_, i) => AGE_MIN + i);

function AgeWheelPicker({ theme, styles, value, onChange }) {
  const scrollRef = useRef(null);
  const selectedAge = AGES.includes(Number(value)) ? Number(value) : AGE_DEFAULT;

  useEffect(() => {
    const index = AGES.indexOf(selectedAge);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: index * AGE_ITEM_HEIGHT, animated: false });
    });
    // Only snap to position on mount — subsequent updates come from the user's own scrolling.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleMomentumEnd(event) {
    const index = Math.round(event.nativeEvent.contentOffset.y / AGE_ITEM_HEIGHT);
    const clamped = Math.min(Math.max(index, 0), AGES.length - 1);
    onChange(String(AGES[clamped]));
  }

  return <View style={[styles.wheelShadowWrap, { height: AGE_ITEM_HEIGHT * AGE_VISIBLE_ITEMS }]}>
      <View style={styles.wheelContainer}>
        <View pointerEvents="none" style={[styles.wheelHighlight, { top: AGE_ITEM_HEIGHT, height: AGE_ITEM_HEIGHT, backgroundColor: `${theme.accent}40` }]} />
        <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} snapToInterval={AGE_ITEM_HEIGHT} decelerationRate="fast" contentContainerStyle={{
        paddingVertical: AGE_ITEM_HEIGHT
      }} onMomentumScrollEnd={handleMomentumEnd}>
          {AGES.map(age => <View key={age} style={styles.wheelItem}>
              <ThemedText type={age === selectedAge ? 'smallBold' : 'small'} color={age === selectedAge ? theme.text : theme.textSecondary} style={styles.wheelItemText}>
                {age}
              </ThemedText>
            </View>)}
        </ScrollView>
      </View>
    </View>;
}

export function PersonalInfoStep({
  value,
  onChange,
  showValidation
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  function fieldStyle(invalid) {
    return [styles.input, {
      backgroundColor: theme.background,
      borderColor: invalid ? theme.error : 'transparent',
      color: theme.text
    }];
  }
  const nameInvalid = showValidation && value.name.trim().length === 0;

  return <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title} color={theme.text}>
          {t('onboarding.personalInfo.title')}
        </ThemedText>
        <ThemedText type="default" color={theme.textSecondary}>
          {t('onboarding.personalInfo.subtitle')}
        </ThemedText>
      </View>

      <View style={styles.nameAgeRow}>
        <View style={[styles.field, styles.nameField]}>
          <ThemedText type="small" color={theme.textSecondary}>{t('onboarding.personalInfo.name')}</ThemedText>
          <TextInput value={value.name} onChangeText={name => onChange({
          name
        })} placeholder={t('onboarding.personalInfo.namePlaceholder')} placeholderTextColor={theme.textSecondary} style={[fieldStyle(nameInvalid), styles.nameInput]} />
        </View>
        <View style={[styles.field, styles.ageField]}>
          <ThemedText type="small" color={theme.textSecondary}>{t('onboarding.personalInfo.age')}</ThemedText>
          <AgeWheelPicker theme={theme} styles={styles} value={value.age} onChange={age => onChange({
          age
        })} />
        </View>
      </View>

      <View style={[styles.field, styles.sexField]}>
        <ThemedText type="small" color={theme.textSecondary}>{t('onboarding.personalInfo.sex')}</ThemedText>
        <View style={styles.segmented}>
          {['female', 'male'].map(sex => <Pressable key={sex} onPress={() => onChange({
          sex
        })} style={[styles.segment, styles.sexSegment, {
          backgroundColor: value.sex === sex ? theme.accent : theme.background,
          borderColor: value.sex === sex ? theme.accent : 'transparent'
        }]}>
              <ThemedText style={styles.sexIcon} color={value.sex === sex ? '#ffffff' : theme.text}>
                {sex === 'female' ? '♀' : '♂'}
              </ThemedText>
              <ThemedText type="smallBold" color={value.sex === sex ? '#ffffff' : theme.text}>
                {sex === 'female' ? t('onboarding.personalInfo.female') : t('onboarding.personalInfo.male')}
              </ThemedText>
            </Pressable>)}
        </View>
      </View>
    </View>;
}
const createStyles = theme => StyleSheet.create({
  container: {
    gap: Spacing.three
  },
  header: {
    gap: Spacing.half,
    marginBottom: Spacing.two
  },
  title: {
    fontSize: 32,
    lineHeight: 38
  },
  field: {
    gap: Spacing.one
  },
  sexField: {
    gap: Spacing.two,
    marginBottom: Spacing.two
  },
  nameAgeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.four
  },
  nameField: {
    flex: 2
  },
  nameInput: {
    marginTop: 20
  },
  ageField: {
    flex: 1
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    fontSize: 16,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4
  },
  wheelShadowWrap: {
    width: 96,
    alignSelf: 'flex-start',
    borderRadius: 12,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4
  },
  wheelContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden'
  },
  wheelHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: 8
  },
  wheelItem: {
    height: AGE_ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center'
  },
  wheelItemText: {
    fontSize: 18,
    lineHeight: 22
  },
  segmented: {
    flexDirection: 'row',
    gap: Spacing.two
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.four,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4
  },
  sexSegment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one
  },
  sexIcon: {
    fontSize: 24,
    lineHeight: 26,
    marginTop: -3,
    fontWeight: '700'
  }
});
