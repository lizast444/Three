import React from 'react';
import { Platform, View, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UI } from '@/data/translations';
import { useOfflineStore } from '@/context/offline-store';
import { useAppColors } from '@/hooks/useAppColors';

const tabs = [
  { name: 'index', key: 'nav_today', icon: 'checkmark-circle-outline', activeIcon: 'checkmark-circle' },
  { name: 'library', key: 'nav_library', icon: 'book-outline', activeIcon: 'book' },
  { name: 'journal', key: 'nav_journal', icon: 'calendar-outline', activeIcon: 'calendar' },
  { name: 'analytics', key: 'nav_analytics', icon: 'stats-chart-outline', activeIcon: 'stats-chart' },
  { name: 'settings', key: 'nav_settings', icon: 'options-outline', activeIcon: 'options' },
] as const;

export default function TabLayout() {
  const palette = useAppColors();
  const insets = useSafeAreaInsets();
  const systemScheme = useColorScheme();
  const { data } = useOfflineStore();
  const isIOS = Platform.OS === 'ios';
  const isWeb = Platform.OS === 'web';
  const isDark =
    data.settings.theme === 'dark' ||
    (data.settings.theme === 'system' && systemScheme === 'dark');
  const labels = UI[data.settings.language];
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.mutedForeground,
        tabBarStyle: {
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: Math.max(8, insets.bottom + 8),
          height: 68,
          paddingTop: 5,
          paddingBottom: 1,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          borderRadius: 25,
          elevation: 9,
          shadowColor: palette.foreground,
          shadowOffset: { width: 0, height: 7 },
          shadowOpacity: 0.12,
          shadowRadius: 18,
        },
        tabBarBackground: () => (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              styles.glassSurface,
              {
                backgroundColor: `${palette.card}F4`,
                borderColor: palette.border,
              },
            ]}
          >
            {isIOS ? (
              <BlurView
                intensity={42}
                tint={isDark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <LinearGradient
              colors={[
                `${palette.card}FC`,
                `${palette.card}EC`,
                `${palette.card}F9`,
              ]}
              locations={[0, 0.52, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
        ),
        tabBarItemStyle: styles.tabItem,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: labels[tab.key],
            tabBarIcon: ({ focused, color }) => (
              <View style={styles.tabIconWrap}>
                <View
                  style={[
                    styles.activeMarker,
                    { backgroundColor: focused ? palette.primary : 'transparent' },
                  ]}
                />
                <Ionicons
                  name={focused ? tab.activeIcon : tab.icon}
                  color={focused ? palette.primary : palette.mutedForeground}
                  size={20}
                />
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  glassSurface: {
    borderRadius: 25,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  tabItem: { paddingTop: 0, paddingBottom: 0 },
  tabLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 10,
    lineHeight: 13,
    marginTop: 1,
    marginBottom: 0,
  },
  tabIconWrap: {
    height: 27,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 4,
  },
  activeMarker: {
    position: 'absolute',
    top: 0,
    width: 15,
    height: 2,
    borderRadius: 1,
  },
});
