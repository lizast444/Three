import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Lang, UI } from '@/data/translations';
import { ThemeMode, useOfflineStore } from '@/context/offline-store';
import {
  AppButton,
  BodyText,
  Card,
  Screen,
  SectionTitle,
  StorageBanner,
} from '@/components/primitives';
import { useAppColors } from '@/hooks/useAppColors';

export default function SettingsScreen() {
  const {
    data,
    saveError,
    updateSettings,
    resetAll,
  } = useOfflineStore();
  const palette = useAppColors();
  const language = data.settings.language;
  const t = UI[language];
  const copy =
    language === 'ru'
      ? {
          privacy: 'Работает без интернета. Дневник, ответы, теги, заметки и настройки хранятся только в памяти приложения на этом телефоне.',
          cache: 'Очистка кэша Android не удаляет эти записи. Но «Очистить данные» или удаление приложения стирает их.',
          localOnly: 'Только на этом устройстве',
          language: 'Язык',
          theme: 'Тема',
          system: 'Как в системе',
          storage: 'Локальное хранилище',
          recordCount: 'Дней в журнале',
          noteCount: 'Заметок в библиотеке',
          resetMessage: 'Будут удалены все локальные записи, ответы, заметки и настройки. Это действие нельзя отменить.',
          reset: 'Удалить все записи',
          cancel: 'Отмена',
          resetTitle: 'Очистить локальные данные?',
          saved: 'Настройки сохраняются на телефоне.',
          noCloud: 'Без аккаунта, синхронизации и серверной базы.',
        }
      : {
          privacy: 'Works without internet. Your journal, answers, tags, notes, and settings stay in this app on this phone.',
          cache: 'Android cache cleanup does not remove these entries. Clearing app data or uninstalling the app will.',
          localOnly: 'This device only',
          language: 'Language',
          theme: 'Theme',
          system: 'System',
          storage: 'Local storage',
          recordCount: 'Days in journal',
          noteCount: 'Library notes',
          resetMessage: 'This deletes all local entries, answers, notes, and settings. This cannot be undone.',
          reset: 'Delete all entries',
          cancel: 'Cancel',
          resetTitle: 'Clear local data?',
          saved: 'Settings are saved on this phone.',
          noCloud: 'No account, sync, or server database.',
        };

  const confirmReset = () =>
    Alert.alert(copy.resetTitle, copy.resetMessage, [
      { text: copy.cancel, style: 'cancel' },
      {
        text: copy.reset,
        style: 'destructive',
        onPress: resetAll,
      },
    ]);

  const chooseTheme = (theme: ThemeMode) =>
    updateSettings((settings) => ({ ...settings, theme }));

  const changeLanguage = (value: Lang) =>
    updateSettings((settings) => ({ ...settings, language: value }));

  return (
    <Screen title={t.settings_title} subtitle={t.settings_subtitle}>
      <StorageBanner message={saveError ? (language === 'ru' ? 'Не удалось сохранить настройки. Проверьте свободное место.' : 'Could not save settings. Check storage space.') : null} />
      <Card style={styles.privacyCard}>
        <View style={styles.privacyHeading}>
          <View style={[styles.offlineDot, { backgroundColor: palette.autonomy }]} />
          <Text style={[styles.privacyTitle, { color: palette.foreground }]}>{copy.localOnly}</Text>
        </View>
        <BodyText>{copy.privacy}</BodyText>
        <Text style={[styles.cacheNote, { color: palette.mutedForeground }]}>{copy.cache}</Text>
        <Text style={[styles.noCloud, { color: palette.autonomy }]}>{copy.noCloud}</Text>
      </Card>

      <Card>
        <SectionTitle>{copy.language}</SectionTitle>
        <View style={styles.optionRow}>
          <AppButton
            compact
            selected={language === 'ru'}
            label="Русский"
            onPress={() => changeLanguage('ru')}
          />
          <AppButton
            compact
            selected={language === 'en'}
            label="English"
            onPress={() => changeLanguage('en')}
          />
        </View>
      </Card>

      <Card>
        <SectionTitle>{copy.theme}</SectionTitle>
        <View style={styles.optionRow}>
          {(['system', 'light', 'dark'] as ThemeMode[]).map((theme) => {
            const label =
              theme === 'system'
                ? copy.system
                : theme === 'light'
                  ? t.settings_theme_light
                  : t.settings_theme_dark;
            return (
              <AppButton
                key={theme}
                compact
                selected={data.settings.theme === theme}
                label={label}
                onPress={() => chooseTheme(theme)}
              />
            );
          })}
        </View>
        <BodyText muted>{copy.saved}</BodyText>
      </Card>

      <Card>
        <SectionTitle>{copy.storage}</SectionTitle>
        <View style={styles.countRow}>
          <BodyText muted>{copy.recordCount}</BodyText>
          <Text style={[styles.countValue, { color: palette.foreground }]}>
            {Object.keys(data.days).length}
          </Text>
        </View>
        <View style={styles.countRow}>
          <BodyText muted>{copy.noteCount}</BodyText>
          <Text style={[styles.countValue, { color: palette.foreground }]}>
            {data.libraryNotes.length}
          </Text>
        </View>
        <AppButton
          variant="danger"
          label={copy.reset}
          testID="reset-local-data"
          onPress={confirmReset}
        />
      </Card>

      <Text style={[styles.version, { color: palette.mutedForeground }]}>
        Three Bearings · Offline
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  privacyCard: { gap: 10 },
  privacyHeading: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  offlineDot: { width: 9, height: 9, borderRadius: 5 },
  privacyTitle: { fontSize: 15, fontWeight: '700' },
  cacheNote: { fontSize: 12, lineHeight: 19 },
  noCloud: { fontSize: 12, fontWeight: '600' },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  countRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  countValue: { fontSize: 14, fontWeight: '700' },
  version: { textAlign: 'center', fontSize: 11, paddingTop: 2 },
});
