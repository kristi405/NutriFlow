import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { HorizontalScalePicker } from './horizontal-scale-picker';
import { cmToDisplay, displayToCm, displayToKg, HEIGHT_RANGES, kgToDisplay, unitsForSystem, WEIGHT_RANGES } from './measurement-units';

export function MeasurementsStep({ value, onChange, showValidation }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const system = value.system ?? 'imperial';
  const { heightUnit, weightUnit } = unitsForSystem(system);
  const [heightText, setHeightText] = useState(() => cmToDisplay(value.heightCm, heightUnit));
  const [weightText, setWeightText] = useState(() => kgToDisplay(value.weightKg, weightUnit));
  const [targetWeightText, setTargetWeightText] = useState(() => kgToDisplay(value.targetWeightKg, weightUnit));

  const heightInvalid = showValidation && !(Number(value.heightCm) > 0);
  const weightInvalid = showValidation && !(Number(value.weightKg) > 0);

  function handleHeightChange(text) {
    setHeightText(text);
    const heightCm = displayToCm(text, heightUnit);
    if (heightCm !== undefined) onChange({ heightCm });
  }

  function handleWeightChange(text) {
    setWeightText(text);
    const weightKg = displayToKg(text, weightUnit);
    if (weightKg !== undefined) onChange({ weightKg });
  }

  function handleTargetWeightChange(text) {
    setTargetWeightText(text);
    const targetWeightKg = displayToKg(text, weightUnit);
    if (targetWeightKg !== undefined) onChange({ targetWeightKg });
  }

  function handleSystemChange(newSystem) {
    const next = unitsForSystem(newSystem);
    setHeightText(cmToDisplay(value.heightCm, next.heightUnit));
    setWeightText(kgToDisplay(value.weightKg, next.weightUnit));
    setTargetWeightText(kgToDisplay(value.targetWeightKg, next.weightUnit));
    onChange({ system: newSystem });
  }

  return <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title} color={theme.text}>
          {t('onboarding.measurements.title')}
        </ThemedText>
      </View>

      <View style={[styles.field, styles.systemField]}>
        <ThemedText type="small" color={theme.textSecondary}>{t('onboarding.personalInfo.measurementSystem')}</ThemedText>
        <View style={styles.segmented}>
          {['metric', 'imperial'].map(option => <Pressable key={option} onPress={() => handleSystemChange(option)} style={[styles.segment, {
          backgroundColor: system === option ? theme.accent : theme.background,
          borderColor: system === option ? theme.accent : 'transparent'
        }]}>
              <ThemedText type="smallBold" color={system === option ? '#ffffff' : theme.text}>
                {option === 'metric' ? t('onboarding.personalInfo.metricSystem') : t('onboarding.personalInfo.imperialSystem')}
              </ThemedText>
            </Pressable>)}
        </View>
      </View>

      <View style={styles.field}>
        <ThemedText type="small" color={heightInvalid ? theme.error : theme.textSecondary}>{t('onboarding.personalInfo.height')}</ThemedText>
        <HorizontalScalePicker value={Number(heightText) || HEIGHT_RANGES[heightUnit].min} min={HEIGHT_RANGES[heightUnit].min} max={HEIGHT_RANGES[heightUnit].max} majorStep={HEIGHT_RANGES[heightUnit].majorStep} unit={heightUnit} onChange={newValue => handleHeightChange(String(newValue))} />
      </View>

      <View style={styles.field}>
        <ThemedText type="small" color={weightInvalid ? theme.error : theme.textSecondary}>{t('onboarding.personalInfo.weight')}</ThemedText>
        <HorizontalScalePicker value={Number(weightText) || WEIGHT_RANGES[weightUnit].min} min={WEIGHT_RANGES[weightUnit].min} max={WEIGHT_RANGES[weightUnit].max} majorStep={WEIGHT_RANGES[weightUnit].majorStep} unit={weightUnit} onChange={newValue => handleWeightChange(String(newValue))} />
      </View>

      <View style={styles.field}>
        <ThemedText type="small" color={theme.textSecondary}>{t('onboarding.personalInfo.targetWeight')}</ThemedText>
        <HorizontalScalePicker value={Number(targetWeightText) || WEIGHT_RANGES[weightUnit].min} min={WEIGHT_RANGES[weightUnit].min} max={WEIGHT_RANGES[weightUnit].max} majorStep={WEIGHT_RANGES[weightUnit].majorStep} unit={weightUnit} onChange={newValue => handleTargetWeightChange(String(newValue))} />
      </View>
    </View>;
}

const createStyles = theme => StyleSheet.create({
  container: {
    gap: Spacing.three
  },
  header: {
    gap: Spacing.half
  },
  title: {
    fontSize: 32,
    lineHeight: 38
  },
  field: {
    gap: Spacing.one
  },
  systemField: {
    gap: Spacing.two
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
  }
});
