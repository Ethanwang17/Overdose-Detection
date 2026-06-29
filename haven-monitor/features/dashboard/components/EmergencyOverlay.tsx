import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';

interface EmergencyOverlayProps {
  visible: boolean;
  countdown: number;
  calling: boolean;
  onImOk: () => void;
  onCallHelp: () => void;
}

const TOTAL_SECONDS = 30;

export default function EmergencyOverlay({
  visible,
  countdown,
  calling,
  onImOk,
  onCallHelp,
}: EmergencyOverlayProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (calling && visible) {
      pulseRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulseRef.current.start();
    } else {
      pulseRef.current?.stop();
      pulseAnim.setValue(1);
    }
  }, [calling, visible, pulseAnim]);

  const progress = countdown / TOTAL_SECONDS;
  const ringOpacity = 0.15 + progress * 0.85;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {!calling ? (
            <>
              <Text style={styles.emergencyLabel}>EMERGENCY</Text>
              <Text style={styles.title}>Possible Overdose Detected</Text>
              <Text style={styles.body}>
                Haven is preparing to call for help. Tap{' '}
                <Text style={styles.bodyBold}>I'm OK</Text> to cancel within the
                countdown.
              </Text>

              {/* Countdown ring */}
              <View style={styles.ringWrapper}>
                <View
                  style={[
                    styles.ring,
                    {
                      borderColor: `rgba(229, 72, 77, ${ringOpacity})`,
                      borderWidth: 8,
                    },
                  ]}
                >
                  <View style={styles.ringInner}>
                    <Text style={styles.countdownNumber}>{countdown}</Text>
                    <Text style={styles.secondsLabel}>SECONDS</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.callButton} onPress={onCallHelp} activeOpacity={0.85}>
                <Text style={styles.callButtonText}>Call for Help</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.okButton} onPress={onImOk} activeOpacity={0.85}>
                <Text style={styles.okButtonText}>I'm OK</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Animated.View
                style={[styles.callingDot, { opacity: pulseAnim }]}
              />
              <Text style={styles.callingTitle}>Calling for Help</Text>
              <Text style={styles.callingBody}>
                Emergency services and your contacts are being notified of your
                location. Stay as calm as possible.
              </Text>
              <TouchableOpacity style={styles.cancelButton} onPress={onImOk} activeOpacity={0.85}>
                <Text style={styles.cancelButtonText}>I'm OK — Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(18, 18, 22, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 30,
    paddingTop: 34,
    paddingHorizontal: 26,
    paddingBottom: 26,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.32,
    shadowRadius: 70,
    elevation: 24,
  },
  emergencyLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#E5484D',
    textAlign: 'center',
  },
  title: {
    fontSize: 25,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: '#15151A',
    textAlign: 'center',
    marginTop: 12,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6A6A70',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  bodyBold: {
    fontWeight: '600',
    color: '#15151A',
  },
  ringWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  ring: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'solid',
  },
  ringInner: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownNumber: {
    fontSize: 44,
    fontWeight: '700',
    color: '#E5484D',
    lineHeight: 48,
  },
  secondsLabel: {
    fontSize: 11,
    color: '#A8A8AE',
    letterSpacing: 0.5,
  },
  callButton: {
    width: '100%',
    height: 58,
    borderRadius: 18,
    backgroundColor: '#E5484D',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  callButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  okButton: {
    width: '100%',
    height: 58,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  okButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#15151A',
  },
  // Calling state
  callingDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E5484D',
    marginTop: 6,
    marginBottom: 0,
  },
  callingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#15151A',
    marginTop: 22,
    textAlign: 'center',
  },
  callingBody: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6A6A70',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 26,
  },
  cancelButton: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#15151A',
  },
});
