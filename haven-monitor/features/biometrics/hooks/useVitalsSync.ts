import { useEffect, useRef } from 'react';
import { useBiometricStore } from '../store/biometricStore';
import { useAuthStore } from '../../authentication/store/authStore';
import { VitalsService } from '../../../services/VitalsService';

const PUSH_INTERVAL_MS = 3000;

export function useVitalsSync() {
  const userId = useAuthStore((s) => s.session?.user.id);
  const userIdRef = useRef<string | undefined>(undefined);
  userIdRef.current = userId;

  useEffect(() => {
    if (!userId) return;

    const push = () => {
      const { reading, status } = useBiometricStore.getState();
      if (!reading) return;
      VitalsService.push(userId, reading.heartRate, reading.spo2, reading.respiratoryRate, status).catch(() => {});
    };

    // Push immediately on mount so officer sees current state right away
    push();

    // Keep pushing every 3s so officer gets a live feed
    const timer = setInterval(push, PUSH_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [userId]);
}
