import { useState } from 'react';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors, LoginButtonGreen, Spacing } from '@/constants/theme';

const theme = Colors.light;

const CM_PER_INCH = 2.54;
const KG_PER_LB = 0.453592;

function round1(number) {
  return Math.round(number * 10) / 10;
}

function cmToDisplay(heightCm, unit) {
  if (heightCm === '') return '';
  const cm = Number(heightCm);
  if (!Number.isFinite(cm)) return '';
  return unit === 'cm' ? heightCm : String(round1(cm / CM_PER_INCH));
}

function displayToCm(text, unit) {
  if (text === '') return '';
  const parsed = Number(text);
  if (!Number.isFinite(parsed)) return undefined;
  return unit === 'cm' ? text : String(round1(parsed * CM_PER_INCH));
}

function kgToDisplay(weightKg, unit) {
  if (weightKg === '') return '';
  const kg = Number(weightKg);
  if (!Number.isFinite(kg)) return '';
  return unit === 'kg' ? weightKg : String(round1(kg / KG_PER_LB));
}

function displayToKg(text, unit) {
  if (text === '') return '';
  const parsed = Number(text);
  if (!Number.isFinite(parsed)) return undefined;
  return unit === 'kg' ? text : String(round1(parsed * KG_PER_LB));
}

function UnitDropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  return <>
      <Pressable onPress={() => setOpen(true)} style={styles.unitButton}>
        <ThemedText type="small" color={LoginButtonGreen} style={styles.modalOptionActiveText}>{value}</ThemedText>
        <SymbolView name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }} size={10} tintColor={LoginButtonGreen} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)}>
          <View style={styles.modalCard}>
            {options.map(option => <Pressable key={option} onPress={() => {
            onChange(option);
            setOpen(false);
          }} style={styles.modalOption}>
                <ThemedText type="default" color={option === value ? LoginButtonGreen : theme.text} style={option === value ? styles.modalOptionActiveText : undefined}>
                  {option}
                </ThemedText>
                {option === value && <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={16} tintColor={LoginButtonGreen} />}
              </Pressable>)}
          </View>
        </Pressable>
      </Modal>
    </>;
}

export function PersonalInfoStep({
  value,
  onChange,
  showValidation
}) {
  const { t } = useTranslation();
  const [heightUnit, setHeightUnit] = useState('in');
  const [weightUnit, setWeightUnit] = useState('lb');
  const [heightText, setHeightText] = useState(() => cmToDisplay(value.heightCm, 'in'));
  const [weightText, setWeightText] = useState(() => kgToDisplay(value.weightKg, 'lb'));
  const [targetWeightText, setTargetWeightText] = useState(() => kgToDisplay(value.targetWeightKg, 'lb'));

  function fieldStyle(invalid) {
    return [styles.input, {
      backgroundColor: theme.background,
      borderColor: invalid ? theme.error : theme.border,
      color: theme.text
    }];
  }
  const nameInvalid = showValidation && value.name.trim().length === 0;
  const ageInvalid = showValidation && !(Number(value.age) > 0);
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

  function handleHeightUnitChange(newUnit) {
    setHeightUnit(newUnit);
    setHeightText(cmToDisplay(value.heightCm, newUnit));
  }

  function handleWeightUnitChange(newUnit) {
    setWeightUnit(newUnit);
    setWeightText(kgToDisplay(value.weightKg, newUnit));
    setTargetWeightText(kgToDisplay(value.targetWeightKg, newUnit));
  }
  return <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title} color={theme.text}>
          {t('onboarding.personalInfo.title')}
        </ThemedText>
        <ThemedText type="default" color={theme.textSecondary}>
          {t('onboarding.personalInfo.subtitle')}
        </ThemedText>
      </View>

      <View style={styles.field}>
        <ThemedText type="small" color={theme.text}>{t('onboarding.personalInfo.name')}</ThemedText>
        <TextInput value={value.name} onChangeText={name => onChange({
        name
      })} placeholder={t('onboarding.personalInfo.namePlaceholder')} placeholderTextColor={theme.textSecondary} style={fieldStyle(nameInvalid)} />
      </View>

      <View style={styles.field}>
        <ThemedText type="small" color={theme.text}>{t('onboarding.personalInfo.sex')}</ThemedText>
        <View style={styles.segmented}>
          {['female', 'male'].map(sex => <Pressable key={sex} onPress={() => onChange({
          sex
        })} style={[styles.segment, {
          backgroundColor: value.sex === sex ? LoginButtonGreen : theme.background,
          borderColor: value.sex === sex ? LoginButtonGreen : theme.border
        }]}>
              <ThemedText type="smallBold" color={value.sex === sex ? '#ffffff' : theme.text}>
                {sex === 'female' ? t('onboarding.personalInfo.female') : t('onboarding.personalInfo.male')}
              </ThemedText>
            </Pressable>)}
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.field, styles.flex1]}>
          <View style={styles.labelRow}>
            <ThemedText type="small" color={theme.text}>{t('onboarding.personalInfo.age')}</ThemedText>
          </View>
          <TextInput value={value.age} onChangeText={age => onChange({
          age
        })} keyboardType="number-pad" placeholder={t('onboarding.personalInfo.agePlaceholder')} placeholderTextColor={theme.textSecondary} style={fieldStyle(ageInvalid)} />
        </View>
        <View style={[styles.field, styles.flex1]}>
          <View style={styles.labelRow}>
            <ThemedText type="small" color={theme.text}>{t('onboarding.personalInfo.height')}</ThemedText>
            <UnitDropdown value={heightUnit} options={['cm', 'in']} onChange={handleHeightUnitChange} />
          </View>
          <TextInput value={heightText} onChangeText={handleHeightChange} keyboardType="decimal-pad" placeholder={heightUnit === 'cm' ? '170' : '67'} placeholderTextColor={theme.textSecondary} style={fieldStyle(heightInvalid)} />
        </View>
        <View style={[styles.field, styles.flex1]}>
          <View style={styles.labelRow}>
            <ThemedText type="small" color={theme.text}>{t('onboarding.personalInfo.weight')}</ThemedText>
            <UnitDropdown value={weightUnit} options={['kg', 'lb']} onChange={handleWeightUnitChange} />
          </View>
          <TextInput value={weightText} onChangeText={handleWeightChange} keyboardType="decimal-pad" placeholder={weightUnit === 'kg' ? '68' : '150'} placeholderTextColor={theme.textSecondary} style={fieldStyle(weightInvalid)} />
        </View>
      </View>

      <View style={styles.field}>
        <ThemedText type="small" color={theme.text}>{t('onboarding.personalInfo.targetWeight')} ({weightUnit})</ThemedText>
        <TextInput value={targetWeightText} onChangeText={handleTargetWeightChange} keyboardType="decimal-pad" placeholder={weightUnit === 'kg' ? '65' : '145'} placeholderTextColor={theme.textSecondary} style={fieldStyle(false)} />
      </View>
    </View>;
}
const styles = StyleSheet.create({
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
  row: {
    flexDirection: 'row',
    gap: Spacing.two
  },
  flex1: {
    flex: 1
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    fontSize: 16
  },
  segmented: {
    flexDirection: 'row',
    gap: Spacing.two
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: 12,
    borderWidth: 1
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    minHeight: 26
  },
  unitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalCard: {
    width: 200,
    backgroundColor: theme.background,
    borderRadius: 16,
    paddingVertical: Spacing.one,
    overflow: 'hidden'
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three
  },
  modalOptionActiveText: {
    fontWeight: '700'
  }
});
