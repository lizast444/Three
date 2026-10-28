import React, { useMemo, useRef } from 'react';
import {
  PanResponder,
  StyleSheet,
  View,
  type NativeSyntheticEvent,
  type NativeTouchEvent,
} from 'react-native';

type ScoreSliderProps = {
  value: number;
  label: string;
  incrementLabel: string;
  decrementLabel: string;
  accentColor: string;
  trackColor: string;
  thumbColor: string;
  shadowColor: string;
  testID: string;
  onValueChange: (value: number) => void;
};

export function ScoreSlider({
  value,
  label,
  incrementLabel,
  decrementLabel,
  accentColor,
  trackColor,
  thumbColor,
  shadowColor,
  testID,
  onValueChange,
}: ScoreSliderProps) {
  const sliderRef = useRef<React.ElementRef<typeof View>>(null);
  const bounds = useRef({ left: 0, width: 1 });
  const touchStart = useRef({ x: 0, y: 0 });
  const didDrag = useRef(false);
  const onValueChangeRef = useRef(onValueChange);
  onValueChangeRef.current = onValueChange;

  const measureSlider = () => {
    sliderRef.current?.measureInWindow((x, _y, width) => {
      bounds.current = { left: x + 10, width: Math.max(width - 20, 1) };
    });
  };

  const updateFromPageX = (pageX: number) => {
    const { left, width } = bounds.current;
    const nextValue = Math.max(0, Math.min(10, Math.round(((pageX - left) / width) * 10)));
    onValueChangeRef.current(nextValue);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_event, gesture) =>
          Math.abs(gesture.dx) > 3 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2,
        onPanResponderGrant: (_event, gesture) => {
          didDrag.current = true;
          updateFromPageX(gesture.x0);
        },
        onPanResponderMove: (_event, gesture) => updateFromPageX(gesture.moveX),
        onPanResponderRelease: (_event, gesture) => updateFromPageX(gesture.moveX),
        onPanResponderTerminationRequest: () => false,
      }),
    [],
  );

  const onTouchStart = (event: NativeSyntheticEvent<NativeTouchEvent>) => {
    touchStart.current = {
      x: event.nativeEvent.pageX,
      y: event.nativeEvent.pageY,
    };
    didDrag.current = false;
  };

  const onTouchEnd = (event: NativeSyntheticEvent<NativeTouchEvent>) => {
    const { pageX, pageY } = event.nativeEvent;
    if (!didDrag.current && Math.abs(pageY - touchStart.current.y) < 10) {
      updateFromPageX(pageX);
    }
  };

  return (
    <View
      ref={sliderRef}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 10, now: value }}
      accessibilityActions={[
        { name: 'increment', label: incrementLabel },
        { name: 'decrement', label: decrementLabel },
      ]}
      onAccessibilityAction={(event) => {
        const delta = event.nativeEvent.actionName === 'increment' ? 1 : -1;
        onValueChangeRef.current(Math.max(0, Math.min(10, value + delta)));
      }}
      onLayout={measureSlider}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      testID={testID}
      style={styles.touchTarget}
      {...panResponder.panHandlers}
    >
      <View pointerEvents="none" style={[styles.track, { backgroundColor: trackColor }]}>
        <View
          style={[
            styles.fill,
            { width: `${value * 10}%`, backgroundColor: accentColor },
          ]}
        />
        <View
          style={[
            styles.thumb,
            {
              left: `${value * 10}%`,
              borderColor: accentColor,
              backgroundColor: thumbColor,
              shadowColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  touchTarget: { height: 48, justifyContent: 'center', position: 'relative' },
  track: {
    height: 5,
    borderRadius: 6,
    position: 'absolute',
    left: 10,
    right: 10,
    overflow: 'visible',
  },
  fill: { height: '100%', borderRadius: 6, position: 'absolute', top: 0 },
  thumb: {
    position: 'absolute',
    top: -8,
    marginLeft: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
});
