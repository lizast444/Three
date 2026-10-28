import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  useFonts,
} from '@expo-google-fonts/dm-sans';
import {
  Lora_400Regular,
  Lora_400Regular_Italic,
  Lora_500Medium,
  Lora_600SemiBold,
} from '@expo-google-fonts/lora';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { OfflineStoreProvider, useOfflineStore } from '@/context/offline-store';
import { useAppColors } from '@/hooks/useAppColors';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isHydrated, loadError, retryHydration } = useOfflineStore();
  const palette = useAppColors();
  if (!isHydrated) {
    return (
      <SafeAreaView style={[styles.loading, { backgroundColor: palette.background }]}>
        {loadError ? (
          <>
            <Text style={[styles.loadTitle, { color: palette.foreground }]}>
              Не удалось открыть локальные данные
            </Text>
            <Text style={[styles.loadMessage, { color: palette.mutedForeground }]}>
              {loadError}
            </Text>
            <Pressable
              onPress={retryHydration}
              accessibilityRole="button"
              style={[styles.retry, { backgroundColor: palette.primary }]}
            >
              <Text style={{ color: palette.primaryForeground, fontWeight: '600' }}>
                Повторить
              </Text>
            </Pressable>
          </>
        ) : (
          <ActivityIndicator color={palette.primary} />
        )}
      </SafeAreaView>
    );
  }
  return (
    <>
      <StatusBar style={palette.background === '#221f1b' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    Lora_400Regular,
    Lora_400Regular_Italic,
    Lora_500Medium,
    Lora_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <OfflineStoreProvider>
            <ErrorBoundary>
              <RootLayoutNav />
            </ErrorBoundary>
          </OfflineStoreProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 14 },
  loadTitle: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  loadMessage: { fontSize: 13, lineHeight: 20, textAlign: 'center' },
  retry: { paddingHorizontal: 20, paddingVertical: 13, borderRadius: 14, marginTop: 4 },
});
