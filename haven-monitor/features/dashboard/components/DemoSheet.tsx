import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface DemoSheetProps {
  visible: boolean;
  onClose: () => void;
  onSetNormal: () => void;
  onSetElevated: () => void;
  onSetOverdose: () => void;
  onTriggerEmergency: () => void;
  onRestartOnboarding: () => void;
}

export default function DemoSheet({
  visible,
  onClose,
  onSetNormal,
  onSetElevated,
  onSetOverdose,
  onTriggerEmergency,
  onRestartOnboarding,
}: DemoSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.sheet}
          activeOpacity={1}
          onPress={() => {
            // Prevent backdrop press from propagating
          }}
        >
          {/* Drag handle */}
          <View style={styles.handle} />

          <Text style={styles.sheetLabel}>DEMO — SIMULATE STATUS</Text>

          {/* Status buttons row */}
          <View style={styles.statusRow}>
            <TouchableOpacity
              style={[styles.statusButton, styles.normalButton]}
              onPress={onSetNormal}
              activeOpacity={0.8}
            >
              <Text style={[styles.statusButtonText, styles.normalText]}>Normal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statusButton, styles.elevatedButton]}
              onPress={onSetElevated}
              activeOpacity={0.8}
            >
              <Text style={[styles.statusButtonText, styles.elevatedText]}>Elevated</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statusButton, styles.overdoseButton]}
              onPress={onSetOverdose}
              activeOpacity={0.8}
            >
              <Text style={[styles.statusButtonText, styles.overdoseText]}>Overdose</Text>
            </TouchableOpacity>
          </View>

          {/* Trigger Emergency */}
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={onTriggerEmergency}
            activeOpacity={0.85}
          >
            <Text style={styles.emergencyButtonText}>Trigger Emergency Alert</Text>
          </TouchableOpacity>

          {/* Restart Onboarding */}
          <TouchableOpacity
            style={styles.restartButton}
            onPress={onRestartOnboarding}
            activeOpacity={0.7}
          >
            <Text style={styles.restartButtonText}>Restart Onboarding</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(18, 18, 22, 0.28)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    paddingTop: 14,
    paddingHorizontal: 22,
    paddingBottom: 36,
  },
  handle: {
    width: 38,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.14)',
    alignSelf: 'center',
    marginBottom: 18,
  },
  sheetLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#86868B',
    paddingHorizontal: 2,
    paddingBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  normalButton: {
    backgroundColor: 'rgba(48, 161, 92, 0.1)',
  },
  normalText: {
    color: '#268C4E',
  },
  elevatedButton: {
    backgroundColor: 'rgba(224, 152, 10, 0.12)',
  },
  elevatedText: {
    color: '#B5790A',
  },
  overdoseButton: {
    backgroundColor: 'rgba(229, 72, 77, 0.11)',
  },
  overdoseText: {
    color: '#D4333A',
  },
  emergencyButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#15151A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  restartButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  restartButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#86868B',
  },
});
