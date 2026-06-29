import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { Colors, Radius } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  padding?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Card({
  children,
  padding = 16,
  borderRadius = Radius.md,
  style,
}: CardProps) {
  return (
    <View
      style={[
        styles.card,
        { padding, borderRadius },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderCard,
  },
});

export default Card;
