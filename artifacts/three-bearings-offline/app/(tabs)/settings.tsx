import React, { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import type { DocumentPickerAsset } from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { Lang } from '@/data/translations';
import { UI } from '@/data/translations';
import {
  parseBackupFile,
  useOfflineStore,
  type OfflineState,
  type ThemeMode,
} from '@/context/offline-store';
import { NEEDS, type NeedId } from '@/constants/needs';
import {
  AppButton,
  BodyText,
  Card,
  Screen,
  SectionTitle,
  StorageBanner,
} from '@/components/primitives';
import { useAppColors } from '@/hooks/useAppColors';

type SettingsIcon =
  | 'shield'
  | 'globe'
  | 'moon'
  | 'info'
  | 'check-circle'
  | 'book-open'
  | 'bar-chart-2'
  | 'database'
  | 'download'
  | 'upload';

const aboutNeedIcons = {
  autonomy: 'wind',
  competence: 'anchor',
  relatedness: 'users',
} as const;

async function readPickedBackup(asset: DocumentPickerAsset): Promise<string> {
  if (Platform.OS === 'web') {
    if (asset.file) return asset.file.text();
    const response = await fetch(asset.uri);
    if (!response.ok) throw new Error('Could not read the selected file.');
    return response.text();
  }

  try {
    return await FileSystem.readAsStringAsync(asset.uri, { encoding: 'utf8' });
  } catch (readError) {
    if (!FileSystem.cacheDirectory || asset.uri.startsWith('file://')) throw readError;
    const cachedUri = `${FileSystem.cacheDirectory}three-bearings-import-${Date.now()}.json`;
    await FileSystem.copyAsync({ from: asset.uri, to: cachedUri });
    try {
      return await FileSystem.readAsStringAsync(cachedUri, { encoding: 'utf8' });
    } finally {
      await FileSystem.deleteAsync(cachedUri, { idempotent: true }).catch(() => undefined);
    }
  }
}

function SettingsHeading({ icon, title }: { icon: SettingsIcon; title: string }) {
  const palette = useAppColors();
  return (
    <View style={styles.sectionHeading}>
      <View style={[styles.sectionIcon, { backgroundColor: palette.warmSurface }]}>
        <Feather name={icon} size={16} color={palette.primary} />
      </View>
      <SectionTitle>{title}</SectionTitle>
    </View>
  );
}

function DataActionButton({
  icon,
  label,
  onPress,
  disabled,
  testID,
}: {
  icon: 'download' | 'upload';
  label: string;
  onPress: () => void;
  disabled?: boolean;
  testID: string;
}) {
  const palette = useAppColors();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.dataAction,
        {
          backgroundColor: palette.secondary,
          borderColor: palette.border,
          opacity: disabled ? 0.5 : pressed ? 0.75 : 1,
        },
      ]}
    >
      <Feather name={icon} size={16} color={palette.primary} />
      <Text style={[styles.dataActionText, { color: palette.foreground }]}>{label}</Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const {
    data,
    saveError,
    updateSettings,
    resetAll,
    replaceData,
  } = useOfflineStore();
  const palette = useAppColors();
  const language = data.settings.language;
  const t = UI[language];
  const [busy, setBusy] = useState(false);
  const [pendingImport, setPendingImport] = useState<OfflineState | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const copy =
    language === 'ru'
      ? {
          privacy: 'Работает без интернета. Дневник, ответы, теги, заметки и настройки хранятся только в памяти приложения на этом телефоне.',
          cache: 'Очистка кэша Android не удаляет эти записи. Но «Очистить данные» или удаление приложения стирает их.',
          localOnly: 'Только на этом устройстве',
          language: 'Язык',
          theme: 'Тема',
          system: 'Как в системе',
          about: 'Как пользоваться',
          aboutDescription: 'Three Bearings помогает замечать, что поддерживает автономию, развитие и близость к людям.',
          backup: 'Резервная копия',
          backupDescription: 'Сохраните записи в JSON-файл или восстановите их из ранее созданной копии.',
          exportData: 'Экспортировать',
          importData: 'Импортировать',
          working: 'Подождите…',
          exportComplete: 'Файл резервной копии готов.',
          exportError: 'Не удалось создать файл резервной копии.',
          importReady: 'Файл проверен. Просмотрите данные перед восстановлением.',
          importError: 'Не удалось прочитать файл. Выберите сохранённую JSON-копию Three Bearings.',
          importWarning: 'Восстановление полностью заменит текущие записи, ответы, заметки и настройки.',
          replace: 'Заменить данные',
          importComplete: 'Резервная копия восстановлена на этом устройстве.',
          importSaveError: 'Не удалось сохранить восстановленные данные на устройстве.',
          onboardingSteps: [
            {
              icon: 'check-circle' as const,
              title: 'Сегодня',
              description: 'Оцените три сферы, ответьте на вопросы и выберите шаг на завтра.',
            },
            {
              icon: 'book-open' as const,
              title: 'Библиотека',
              description: 'Ищите вопросы для размышления, сохраняйте подсказки и ответы.',
            },
            {
              icon: 'bar-chart-2' as const,
              title: 'Журнал и аналитика',
              description: 'Возвращайтесь к прошлым дням и замечайте изменения со временем.',
            },
          ],
          storage: 'Локальное хранилище',
          recordCount: 'Дней в журнале',
          noteCount: 'Заметок в библиотеке',
          resetMessage: 'Будут удалены все локальные записи, ответы, заметки и настройки. Это действие нельзя отменить.',
          reset: 'Удалить все записи',
          cancel: 'Отмена',
          resetTitle: 'Очистить локальные данные?',
          saved: 'Настройки сохраняются на телефоне.',
          noCloud: 'Без аккаунта, синхронизации и серверной базы.',
          aboutEyebrow: 'О ПРИЛОЖЕНИИ',
          appName: 'Three Bearings',
          appMeta: 'SDT SOCRATIC TRACKER · V1.0.0',
          theoryTitle: 'Теория самодетерминации (SDT)',
          theoryDescription: 'SDT — психологическая теория, утверждающая, что благополучие и внутренняя мотивация человека зависят от удовлетворения трёх базовых потребностей:',
          needDescriptions: {
            autonomy: 'Ощущение, что ты действуешь из собственных ценностей, а не под внешним давлением.',
            competence: 'Уверенность в своих силах, рост и преодоление вызовов.',
            relatedness: 'Подлинные, тёплые отношения с людьми, ощущение принятия.',
          } satisfies Record<NeedId, string>,
          methodTitle: 'Сократовский метод',
          methodDescription: 'Метод исследования через вопросы, который помогает осознать скрытые убеждения, противоречия и новые перспективы. Вместо готовых ответов — уточняющие вопросы, которые ведут к собственному пониманию.',
        }
      : {
          privacy: 'Works without internet. Your journal, answers, tags, notes, and settings stay in this app on this phone.',
          cache: 'Android cache cleanup does not remove these entries. Clearing app data or uninstalling the app will.',
          localOnly: 'This device only',
          language: 'Language',
          theme: 'Theme',
          system: 'System',
          about: 'How to use the app',
          aboutDescription: 'Three Bearings helps you notice what supports autonomy, growth, and connection.',
          backup: 'Backup',
          backupDescription: 'Save your entries to a JSON file or restore an earlier backup.',
          exportData: 'Export data',
          importData: 'Import data',
          working: 'Please wait…',
          exportComplete: 'Backup file is ready.',
          exportError: 'Could not create a backup file.',
          importReady: 'The file is valid. Review it before restoring.',
          importError: 'Could not read the file. Choose a saved Three Bearings JSON backup.',
          importWarning: 'Restoring will replace current entries, answers, notes, and settings.',
          replace: 'Replace data',
          importComplete: 'Backup restored on this device.',
          importSaveError: 'Could not save the restored data to this device.',
          onboardingSteps: [
            {
              icon: 'check-circle' as const,
              title: 'Today',
              description: 'Rate three needs, reflect with a question, and choose a step for tomorrow.',
            },
            {
              icon: 'book-open' as const,
              title: 'Library',
              description: 'Browse reflection prompts, hints, and saved answers.',
            },
            {
              icon: 'bar-chart-2' as const,
              title: 'Journal and analytics',
              description: 'Review past days and notice patterns over time.',
            },
          ],
          storage: 'Local storage',
          recordCount: 'Days in journal',
          noteCount: 'Library notes',
          resetMessage: 'This deletes all local entries, answers, notes, and settings. This cannot be undone.',
          reset: 'Delete all entries',
          cancel: 'Cancel',
          resetTitle: 'Clear local data?',
          saved: 'Settings are saved on this phone.',
          noCloud: 'No account, sync, or server database.',
          aboutEyebrow: 'ABOUT THE APP',
          appName: 'Three Bearings',
          appMeta: 'SDT SOCRATIC TRACKER · V1.0.0',
          theoryTitle: 'Self-Determination Theory (SDT)',
          theoryDescription: 'SDT is a psychological theory that suggests well-being and inner motivation depend on satisfying three basic needs:',
          needDescriptions: {
            autonomy: 'Feeling that you act from your own values, not under external pressure.',
            competence: 'Confidence in your abilities, growth, and meeting challenges.',
            relatedness: 'Genuine, warm relationships with others and a sense of acceptance.',
          } satisfies Record<NeedId, string>,
          methodTitle: 'The Socratic method',
          methodDescription: 'A way of exploring through questions that helps uncover hidden beliefs, contradictions, and new perspectives. Instead of ready-made answers, clarifying questions lead you to your own understanding.',
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

  const exportBackup = async () => {
    setBusy(true);
    setNotice(null);
    try {
      const backup = {
        app: 'three-bearings-offline',
        backupVersion: 1,
        exportedAt: new Date().toISOString(),
        data,
      };
      const contents = JSON.stringify(backup, null, 2);
      parseBackupFile(contents);
      const fileName = `three-bearings-backup-${new Date().toISOString().slice(0, 10)}.json`;
      if (Platform.OS === 'web') {
        const blob = new Blob([contents], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        const exportDirectory = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
        if (!exportDirectory) throw new Error('App storage is unavailable.');
        const uri = `${exportDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(uri, contents, { encoding: 'utf8' });
        if (!(await Sharing.isAvailableAsync())) throw new Error('File sharing is unavailable.');
        await Sharing.shareAsync(uri, {
          mimeType: 'application/json',
          dialogTitle: copy.exportData,
        });
      }
      setNotice(copy.exportComplete);
    } catch {
      setNotice(copy.exportError);
    } finally {
      setBusy(false);
    }
  };

  const chooseBackup = async () => {
    setBusy(true);
    setNotice(null);
    setPendingImport(null);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset) throw new Error('No file was selected.');
      const contents = await readPickedBackup(asset);
      setPendingImport(parseBackupFile(contents));
      setNotice(copy.importReady);
    } catch {
      setNotice(copy.importError);
    } finally {
      setBusy(false);
    }
  };

  const confirmImport = async () => {
    if (!pendingImport) return;
    setBusy(true);
    setNotice(null);
    try {
      await replaceData(pendingImport);
      setPendingImport(null);
      setNotice(copy.importComplete);
    } catch {
      setNotice(copy.importSaveError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen title={t.settings_title} subtitle={t.settings_subtitle}>
      <StorageBanner message={saveError ? (language === 'ru' ? 'Не удалось сохранить настройки. Проверьте свободное место.' : 'Could not save settings. Check storage space.') : null} />
      <Card style={styles.privacyCard}>
        <SettingsHeading icon="shield" title={copy.localOnly} />
        <BodyText>{copy.privacy}</BodyText>
        <Text style={[styles.cacheNote, { color: palette.mutedForeground }]}>{copy.cache}</Text>
        <Text style={[styles.noCloud, { color: palette.autonomy }]}>{copy.noCloud}</Text>
      </Card>

      <Card style={styles.aboutCard}>
        <View style={styles.aboutEyebrowRow}>
          <Feather name="info" size={15} color={palette.mutedForeground} />
          <Text style={[styles.aboutEyebrow, { color: palette.mutedForeground }]}>
            {copy.aboutEyebrow}
          </Text>
        </View>
        <View style={[styles.aboutDivider, { backgroundColor: palette.border }]} />
        <View style={styles.aboutContent}>
          <Text style={[styles.aboutAppName, { color: palette.foreground }]}>
            {copy.appName}
          </Text>
          <Text style={[styles.aboutMeta, { color: palette.mutedForeground }]}>
            {copy.appMeta}
          </Text>
          <Text style={[styles.aboutSubheading, { color: palette.foreground }]}>
            {copy.theoryTitle}
          </Text>
          <Text style={[styles.aboutBody, { color: palette.mutedForeground }]}>
            {copy.theoryDescription}
          </Text>
          <View style={styles.aboutNeedList}>
            {NEEDS.map((need) => (
              <View
                key={need}
                style={[
                  styles.aboutNeedCard,
                  { backgroundColor: palette[`${need}Soft`] },
                ]}
              >
                <Feather
                  name={aboutNeedIcons[need]}
                  size={17}
                  color={palette[need]}
                  style={styles.aboutNeedIcon}
                />
                <View style={styles.aboutNeedCopy}>
                  <Text style={[styles.aboutNeedTitle, { color: palette[need] }]}>
                    {t[`sphere_${need}`]}
                  </Text>
                  <Text style={[styles.aboutNeedDescription, { color: palette.mutedForeground }]}>
                    {copy.needDescriptions[need]}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          <Text style={[styles.aboutSubheading, { color: palette.foreground }]}>
            {copy.methodTitle}
          </Text>
          <Text style={[styles.aboutBody, { color: palette.mutedForeground }]}>
            {copy.methodDescription}
          </Text>
        </View>
      </Card>

      <Card>
        <SettingsHeading icon="globe" title={copy.language} />
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
        <SettingsHeading icon="moon" title={copy.theme} />
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
        <SettingsHeading icon="database" title={copy.backup} />
        <BodyText muted>{copy.backupDescription}</BodyText>
        <View style={styles.dataActionRow}>
          <DataActionButton
            icon="download"
            label={busy ? copy.working : copy.exportData}
            onPress={exportBackup}
            disabled={busy}
            testID="export-backup"
          />
          <DataActionButton
            icon="upload"
            label={busy ? copy.working : copy.importData}
            onPress={chooseBackup}
            disabled={busy}
            testID="import-backup"
          />
        </View>
        {notice ? (
          <Text
            accessibilityRole="alert"
            style={[
              styles.feedback,
              { color: notice === copy.exportComplete || notice === copy.importComplete ? palette.autonomy : palette.mutedForeground },
            ]}
          >
            {notice}
          </Text>
        ) : null}
        {pendingImport ? (
          <View style={[styles.importConfirmation, { borderColor: palette.border }]}>
            <Text style={[styles.importWarning, { color: palette.foreground }]}>
              {copy.importWarning}
            </Text>
            <Text style={[styles.importCounts, { color: palette.mutedForeground }]}>
              {copy.recordCount}: {Object.keys(pendingImport.days).length} · {copy.noteCount}:{' '}
              {pendingImport.libraryNotes.length}
            </Text>
            <View style={styles.confirmActions}>
              <AppButton
                compact
                variant="danger"
                label={busy ? copy.working : copy.replace}
                onPress={confirmImport}
                disabled={busy}
                testID="confirm-import-backup"
              />
              <AppButton
                compact
                label={copy.cancel}
                onPress={() => setPendingImport(null)}
                disabled={busy}
                testID="cancel-import-backup"
              />
            </View>
          </View>
        ) : null}
      </Card>

      <Card>
        <SettingsHeading icon="database" title={copy.storage} />
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
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cacheNote: { fontSize: 12, lineHeight: 19 },
  noCloud: { fontSize: 12, fontWeight: '600' },
  aboutCard: { padding: 0, overflow: 'hidden' },
  aboutEyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 18, paddingVertical: 14 },
  aboutEyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 1.35 },
  aboutDivider: { height: StyleSheet.hairlineWidth, width: '100%' },
  aboutContent: { padding: 18, gap: 12 },
  aboutAppName: { fontFamily: 'Lora_500Medium', fontSize: 21 },
  aboutMeta: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginTop: -7 },
  aboutSubheading: { fontSize: 14, fontWeight: '700', marginTop: 9 },
  aboutBody: { fontSize: 15, lineHeight: 24, marginTop: -3 },
  aboutNeedList: { gap: 10, marginTop: 1, marginBottom: 1 },
  aboutNeedCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 13, borderRadius: 19 },
  aboutNeedIcon: { marginTop: 2, width: 18 },
  aboutNeedCopy: { flex: 1, gap: 3 },
  aboutNeedTitle: { fontSize: 13, fontWeight: '700' },
  aboutNeedDescription: { fontSize: 13, lineHeight: 20 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  countRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  countValue: { fontSize: 14, fontWeight: '700' },
  dataActionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  dataAction: { flex: 1, minWidth: '44%', minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 10, borderWidth: 1, borderRadius: 14 },
  dataActionText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  feedback: { fontSize: 12, lineHeight: 18 },
  importConfirmation: { gap: 9, borderWidth: 1, borderRadius: 15, padding: 12 },
  importWarning: { fontSize: 13, lineHeight: 19, fontWeight: '600' },
  importCounts: { fontSize: 12, lineHeight: 18 },
  confirmActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  version: { textAlign: 'center', fontSize: 11, paddingTop: 2 },
});
