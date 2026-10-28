import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UI } from '@/data/translations';
import { useOfflineStore } from '@/context/offline-store';
import { useAppColors } from '@/hooks/useAppColors';

const tabs = [
  { name: 'index', key: 'nav_today', icon: 'sun' },
  { name: 'library', key: 'nav_library', icon: 'book-open' },
  { name: 'analytics', key: 'nav_analytics', icon: 'bar-chart-2' },
  { name: 'journal', key: 'nav_journal', icon: 'calendar' },
  { name: 'settings', key: 'nav_settings', icon: 'sliders' },
] as const;

export default function TabLayout() {
  const palette = useAppColors();
  const insets = useSafeAreaInsets();
  const { data } = useOfflineStore();
  const isIOS = Platform.OS === 'ios';
  const isWeb = Platform.OS === 'web';
  const labels = UI[data.settings.language];
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.mutedForeground,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: isIOS ? 'transparent' : palette.background,
          borderTopWidth: isWeb ? 1 : StyleSheet.hairlineWidth,
          borderTopColor: palette.border,
          elevation: 0,
          paddingBottom: isWeb ? 0 : insets.bottom,
          height: isWeb ? 84 : 58 + insets.bottom,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={85}
              tint={data.settings.theme === 'dark' ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: palette.background },
              ]}
            />
          ) : null,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500', marginBottom: 2 },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: labels[tab.key],
            tabBarIcon: ({ focused, size }) => (
              <Feather
                name={tab.icon}
                color={focused ? palette.primary : palette.mutedForeground}
                size={size ?? 20}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
