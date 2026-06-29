import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardTypeOptions,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Colors, Radius, FontSize, FontWeight } from '../../theme';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  label?: string;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  label,
  editable = true,
  multiline = false,
  numberOfLines,
  maxLength,
  returnKeyType,
  onSubmitEditing,
  autoFocus = false,
  style,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      {label ? (
        <Text style={styles.label}>{label}</Text>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        autoFocus={autoFocus}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          isFocused && styles.inputFocused,
          !editable && styles.inputDisabled,
        ]}
        selectionColor={Colors.ink}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    paddingHorizontal: 16,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.medium,
    color: Colors.ink,
    // No visible border by default; subtle focus ring
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputMultiline: {
    height: undefined,
    minHeight: 56,
    paddingTop: 16,
    paddingBottom: 16,
    textAlignVertical: 'top',
  },
  inputFocused: {
    borderColor: 'rgba(21, 21, 26, 0.18)',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  inputDisabled: {
    opacity: 0.5,
  },
});

export default Input;
