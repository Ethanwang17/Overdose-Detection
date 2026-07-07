import type { BiometricStatus } from '../../types';

// Thresholds mirror the demo simulator's ranges (BiometricSimulator
// MODE_PARAMS): opioid overdose presents as low heart rate, low SpO2, and
// depressed breathing. Metrics with no data (null) are skipped rather than
// treated as abnormal.
export function classifyVitals(
  heartRate: number | null,
  spo2: number | null,
  respiratoryRate: number | null
): BiometricStatus {
  if (
    (heartRate !== null && heartRate < 50) ||
    (spo2 !== null && spo2 < 85) ||
    (respiratoryRate !== null && respiratoryRate < 9)
  ) {
    return 'critical';
  }
  if (
    (heartRate !== null && heartRate > 100) ||
    (spo2 !== null && spo2 < 94) ||
    (respiratoryRate !== null && respiratoryRate > 20)
  ) {
    return 'elevated';
  }
  return 'normal';
}
