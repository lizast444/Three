import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  BarChart2,
  BookOpen,
  CalendarDays,
  SlidersHorizontal,
  Sun,
} from 'lucide-react';
import './_group.css';
import CheckinScreen from './_source/CheckinScreen';

const tabs = [
  { label: 'Сегодня', Icon: Sun },
  { label: 'Библиотека', Icon: BookOpen },
  { label: 'Аналитика', Icon: BarChart2 },
  { label: 'Журнал', Icon: CalendarDays },
  { label: 'Настройки', Icon: SlidersHorizontal },
];

export function Current() {
  return (
    <SafeAreaProvider>
      <View style={styles.frame}>
        <CheckinScreen />
        <View style={styles.tabBar}>
          {tabs.map(({ label, Icon }, index) => (
            <Pressable key={label} style={styles.tab}>
              <Icon
                size={20}
                strokeWidth={1.7}
                color={index === 0 ? '#bd8352' : '#91877a'}
              />
              <Text style={[styles.tabLabel, index === 0 && styles.activeLabel]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    minHeight: '100%',
    maxWidth: 402,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#fcfaf8',
    overflow: 'hidden',
  },
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 84,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 6,
    backgroundColor: '#fcfaf8',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e2dc',
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  tabLabel: {
    color: '#91877a',
    fontFamily: 'DM Sans',
    fontSize: 10,
    lineHeight: 14,
  },
  activeLabel: { color: '#bd8352', fontWeight: '600' },
});
