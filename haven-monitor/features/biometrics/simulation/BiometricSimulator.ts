import type { BiometricReading, BiometricStatus } from '../../../types';

interface SimulatorConfig {
  mode: BiometricStatus;
  updateIntervalMs: number;
}

interface SimulatedReading extends BiometricReading {
  batteryLevel: number;
  connectionQuality: number;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function jitter(base: number, range: number): number {
  return base + (Math.random() - 0.5) * 2 * range;
}

const MODE_PARAMS: Record<BiometricStatus, { hr: [number, number]; spo2: [number, number]; rr: [number, number] }> = {
  normal:   { hr: [65, 80],    spo2: [96, 100], rr: [12, 16] },
  elevated: { hr: [110, 130],  spo2: [93, 96],  rr: [20, 26] },
  critical: { hr: [30, 50],    spo2: [74, 82],  rr: [4, 8]   },
};

export class BiometricSimulator {
  private mode: BiometricStatus = 'normal';
  private currentHr = 72;
  private currentSpo2 = 98;
  private currentRr = 14;
  private batteryLevel = 87;
  private listeners: Array<(reading: SimulatedReading) => void> = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;

  setMode(mode: BiometricStatus): void {
    this.mode = mode;
    const params = MODE_PARAMS[mode];
    this.currentHr = (params.hr[0] + params.hr[1]) / 2;
    this.currentSpo2 = (params.spo2[0] + params.spo2[1]) / 2;
    this.currentRr = (params.rr[0] + params.rr[1]) / 2;
  }

  start(config: SimulatorConfig): void {
    this.mode = config.mode;
    this.stop();
    this.intervalId = setInterval(() => {
      this.tick();
    }, config.updateIntervalMs);
    this.tick();
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  subscribe(listener: (reading: SimulatedReading) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private tick(): void {
    const params = MODE_PARAMS[this.mode];
    const alpha = 0.3;

    const targetHr = jitter((params.hr[0] + params.hr[1]) / 2, (params.hr[1] - params.hr[0]) / 2);
    const targetSpo2 = jitter((params.spo2[0] + params.spo2[1]) / 2, (params.spo2[1] - params.spo2[0]) / 2);
    const targetRr = jitter((params.rr[0] + params.rr[1]) / 2, (params.rr[1] - params.rr[0]) / 2);

    this.currentHr = clamp(Math.round(alpha * targetHr + (1 - alpha) * this.currentHr), params.hr[0], params.hr[1]);
    this.currentSpo2 = clamp(Math.round(alpha * targetSpo2 + (1 - alpha) * this.currentSpo2), params.spo2[0], params.spo2[1]);
    this.currentRr = clamp(Math.round(alpha * targetRr + (1 - alpha) * this.currentRr), params.rr[0], params.rr[1]);

    const reading: SimulatedReading = {
      heartRate: this.currentHr,
      spo2: this.currentSpo2,
      respiratoryRate: this.currentRr,
      movement: Math.random() * 10,
      batteryLevel: this.batteryLevel,
      connectionQuality: 95 + Math.random() * 5,
      timestamp: new Date(),
    };

    this.listeners.forEach(l => l(reading));
  }
}

export const biometricSimulator = new BiometricSimulator();
