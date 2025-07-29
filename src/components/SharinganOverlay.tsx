import React from 'react';
import { Image, StyleSheet, Animated } from 'react-native';

type Props = {
  source: any;
  x?: number;
  y?: number;
  size?: number;
  opacity?: number;
};

export default function SharinganOverlay({ source, x = 0, y = 0, size = 60, opacity = 0.85 }: Props) {
  return (
    <Animated.Image
      source={source}
      style={[
        styles.sharingan,
        { left: x, top: y, width: size, height: size, opacity }
      ]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  sharingan: {
    position: 'absolute',
  }
});