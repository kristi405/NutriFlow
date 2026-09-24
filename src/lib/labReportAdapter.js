/**
 * Maps /app/lab-reports responses onto what the analysis screens render.
 * All knowledge of the backend's field names lives here.
 */

const ABNORMAL_FLAGS = new Set(['low', 'high']);

function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function adaptLabResult(raw) {
  const flag = typeof raw.flag === 'string' ? raw.flag.toLowerCase() : null;
  return {
    name: raw.name,
    value: raw.value,
    valueNumeric: toNumber(raw.value_numeric),
    unit: raw.unit || null,
    refRange: raw.ref_range || null,
    refMin: toNumber(raw.ref_min),
    refMax: toNumber(raw.ref_max),
    flag: ABNORMAL_FLAGS.has(flag) ? flag : null
  };
}

export function adaptLabReport(raw) {
  return {
    id: raw.id,
    isFailed: raw.status === 'failed',
    errorMessage: raw.error_message || null,
    labName: raw.lab_name || raw.laboratory || null,
    // DATE column, serialized as "YYYY-MM-DD" (see formatReportDate).
    takenAt: raw.taken_at || null,
    createdAt: raw.ctime || raw.created_at || null,
    fileUrl: raw.file_url || null,
    results: (raw.results ?? []).map(adaptLabResult)
  };
}

export function adaptHistoryPoint(raw) {
  return {
    reportId: raw.report_id ?? null,
    takenAt: raw.taken_at,
    valueNumeric: toNumber(raw.value_numeric),
    value: raw.value,
    unit: raw.unit || null,
    refMin: toNumber(raw.ref_min),
    refMax: toNumber(raw.ref_max),
    flag: ABNORMAL_FLAGS.has(String(raw.flag).toLowerCase()) ? String(raw.flag).toLowerCase() : null
  };
}

// "YYYY-MM-DD" must be read as a calendar date, not a UTC instant — parsing
// it with new Date(string) shifts it by a day in negative-offset timezones.
export function formatReportDate(dateString, locale) {
  if (!dateString) return '';
  const [year, month, day] = dateString.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatShortDate(dateString, locale) {
  if (!dateString) return '';
  const [year, month, day] = dateString.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}

// Abnormal results first (in report order), then the rest.
export function sortResultsAbnormalFirst(results) {
  return [...results].sort((a, b) => Number(Boolean(b.flag)) - Number(Boolean(a.flag)));
}
