export const KG_PER_LB = 0.453592;

export function kgToLb(kg) {
  return kg / KG_PER_LB;
}

export function lbToKg(lb) {
  return lb * KG_PER_LB;
}

export function weightUnitLabel(units) {
  return units === 'imperial' ? 'lb' : 'kg';
}

/** Converts a stored (always-kg) weight into the unit the profile was set up with. */
export function displayWeight(weightKg, units) {
  const value = units === 'imperial' ? kgToLb(weightKg) : weightKg;
  return Math.round(value * 10) / 10;
}
