import { useEffect, useRef } from 'react';
import { biometricSimulator } from '../simulation/BiometricSimulator';
import { useBiometricStore } from '../store/biometricStore';
import { BIOMETRIC_UPDATE_INTERVAL_MS } from '../../../constants';
import type { BiometricStatus } from '../../../types';

export function useBiometrics() {
  const { status, reading, batteryLevel, connectionQuality, isConnected, setReading, setStatus } = useBiometricStore();
  const emergencyTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { emergency, countdown, setEmergency, setCalling, setCountdown } = useBiometricStore();

  useEffect(() => {
    biometricSimulator.setMode(status);
    biometricSimulator.start({ mode: status, updateIntervalMs: BIOMETRIC_UPDATE_INTERVAL_MS });
    const unsub = biometricSimulator.subscribe((r) => setReading(r));
    return () => {
      biometricSimulator.stop();
      unsub();
    };
  }, []);

  const changeMode = (mode: BiometricStatus) => {
    setStatus(mode);
    biometricSimulator.setMode(mode);
    if (mode === 'critical') {
      setTimeout(() => startEmergency(), 650);
    }
  };

  const startEmergency = () => {
    clearInterval(emergencyTimerRef.current ?? undefined);
    setEmergency(true);
    setCalling(false);
    setCountdown(30);
    let c = 30;
    emergencyTimerRef.current = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(emergencyTimerRef.current ?? undefined);
        setCalling(true);
      }
    }, 1000);
  };

  const stopEmergency = () => {
    clearInterval(emergencyTimerRef.current ?? undefined);
    setEmergency(false);
    setCalling(false);
    setCountdown(30);
    setStatus('normal');
  };

  useEffect(() => {
    return () => { clearInterval(emergencyTimerRef.current ?? undefined); };
  }, []);

  return { status, reading, batteryLevel, connectionQuality, isConnected, emergency, countdown, changeMode, startEmergency, stopEmergency };
}
