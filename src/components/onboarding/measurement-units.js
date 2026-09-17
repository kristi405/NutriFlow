import { KG_PER_LB } from '@/lib/units';

export const CM_PER_INCH = 2.54;

export const HEIGHT_RANGES = {
  cm: { min: 100, max: 220, majorStep: 10 },
  in: { min: 39, max: 87, majorStep: 5 }
};
export const WEIGHT_RANGES = {
  kg: { min: 30, max: 200, majorStep: 10 },
  lb: { min: 66, max: 440, majorStep: 20 }
};

export function unitsForSystem(system) {
  return system === 'metric' ? { heightUnit: 'cm', weightUnit: 'kg' } : { heightUnit: 'in', weightUnit: 'lb' };
}

export function round1(number) {
  return Math.round(number * 10) / 10;
}

export function cmToDisplay(heightCm, unit) {
  if (heightCm === '') return '';
  const cm = Number(heightCm);
  if (!Number.isFinite(cm)) return '';
  return unit === 'cm' ? heightCm : String(round1(cm / CM_PER_INCH));
}

export function displayToCm(text, unit) {
  if (text === '') return '';
  const parsed = Number(text);
  if (!Number.isFinite(parsed)) return undefined;
  return unit === 'cm' ? text : String(round1(parsed * CM_PER_INCH));
}

export function kgToDisplay(weightKg, unit) {
  if (weightKg === '') return '';
  const kg = Number(weightKg);
  if (!Number.isFinite(kg)) return '';
  return unit === 'kg' ? weightKg : String(round1(kg / KG_PER_LB));
}

export function displayToKg(text, unit) {
  if (text === '') return '';
  const parsed = Number(text);
  if (!Number.isFinite(parsed)) return undefined;
  return unit === 'kg' ? text : String(round1(parsed * KG_PER_LB));
}
