import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { ScoreSlider } from '@/components/ScoreSlider';
import { NEEDS, NeedId } from '@/constants/needs';
import {
  DailyEntry,
  localDateKey,
  shiftDateKey,
  useOfflineStore,
} from '@/context/offline-store';
import {
  INSPIRATION_IDEAS_I18N,
  SOCRATIC_POOL_I18N,
  UI,
} from '@/data/translations';
import {
  AppButton,
  AppInput,
  BodyText,
  Card,
  Screen,
  SectionTitle,
  StorageBanner,
} from '@/components/primitives';
import { useAppColors } from '@/hooks/useAppColors';
import { notifySuccess } from '@/utils/haptics';

const formatDate = (date: string, language: 'ru' | 'en') => {
  const parsed = new Date(`${date}T12:00:00`);
  if (language === 'ru') {
    const day = parsed.toLocaleDateString('ru-RU', { day: 'numeric' });
    const month = parsed.toLocaleDateString('ru-RU', { month: 'long' });
    const weekday = parsed.toLocaleDateString('ru-RU', { weekday: 'long' });
    return `${day} ${month}, ${weekday}`.replace(
      /(^|\s|,\s)(\p{L})/gu,
      (_, prefix: string, letter: string) => `${prefix}${letter.toLocaleUpperCase('ru-RU')}`,
    );
  }
  return parsed.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

const needIcons = {
  autonomy: 'wind',
  competence: 'anchor',
  relatedness: 'users',
} as const;

export default function CheckinScreen() {
  const { data, saveError, updateDay, updateSettings } = useOfflineStore();
  const palette = useAppColors();
  const language = data.settings.language;
  const t = UI[language];
  const today = localDateKey();
  const yesterday = shiftDateKey(today, -1);
  const entry = data.days[today] ?? {
    date: today,
    scores: { autonomy: 5, competence: 5, relatedness: 5 },
    answers: {},
    note: '',
    noteTags: [],
    microActions: [],
    yesterdayReview: '',
  };
  const [savedLabel, setSavedLabel] = useState(false);
  const [customActionFor, setCustomActionFor] = useState<NeedId | null>(null);
  const [customActionDraft, setCustomActionDraft] = useState('');

  const copy = useMemo(
    () =>
      language === 'ru'
        ? {
            today: 'Сегодня',
            scale: 'От совсем не ощущаю до полностью',
            earlierAnswers: 'Ранее записанные ответы',
            yesterday: 'Что сработало вчера?',
            planned: 'Вчера вы выбрали:',
            tags: 'Что было важным?',
            actions: 'Что я могу изменить завтра?',
            addAction: 'Добавить идею',
            removeAction: 'Убрать',
            ownAction: 'Своё действие',
            ownActionPlaceholder: 'Напишите небольшой шаг на завтра...',
            saveOwnAction: 'Добавить действие',
            otherIdea: 'Другая идея',
            saved: 'Запись сохранена на этом устройстве',
            saving: 'Ответы сохраняются локально при вводе',
          }
        : {
            today: 'Today',
            scale: 'From not at all to fully',
            earlierAnswers: 'Earlier answers',
            yesterday: 'What worked yesterday?',
            planned: 'Yesterday you chose:',
            tags: 'What mattered today?',
            actions: 'What can I change tomorrow?',
            addAction: 'Add this idea',
            removeAction: 'Remove',
            ownAction: 'Write your own',
            ownActionPlaceholder: 'Write one small step for tomorrow...',
            saveOwnAction: 'Add action',
            otherIdea: 'Another idea',
            saved: 'Entry saved on this device',
            saving: 'Answers save locally as you type',
          },
    [language],
  );

  const update = (change: (current: DailyEntry) => DailyEntry) =>
    updateDay(today, change);

  const toggleTag = (need: NeedId) =>
    update((current) => ({
      ...current,
      noteTags: current.noteTags.includes(need)
        ? current.noteTags.filter((tag) => tag !== need)
        : [...current.noteTags, need],
    }));

  const rotateQuestion = (need: NeedId) => {
    updateSettings((settings) => ({
      ...settings,
      questionIndexes: {
        ...settings.questionIndexes,
        [need]: (settings.questionIndexes[need] + 1) % SOCRATIC_POOL_I18N[language][need].length,
      },
    }));
  };

  const setAnswer = (need: NeedId, question: string, answer: string) =>
    update((current) => {
      const previous = current.answers[need] ?? [];
      const withoutCurrent = previous.filter((item) => item.question !== question);
      return {
        ...current,
        answers: {
          ...current.answers,
          [need]: [...withoutCurrent, { question, answer }],
        },
      };
    });

  const addCustomAction = (need: NeedId) => {
    const action = customActionDraft.trim();
    if (!action) return;
    update((current) => ({
      ...current,
      microActions: [
        ...current.microActions.filter((item) => item.sphere !== need),
        { sphere: need, action },
      ],
    }));
    setCustomActionDraft('');
    setCustomActionFor(null);
    notifySuccess();
  };

  const addIdea = (need: NeedId) => {
    const ideas = INSPIRATION_IDEAS_I18N[language][need];
    const nextIndex = data.settings.ideaIndexes[need] % ideas.length;
    const action = ideas[nextIndex];
    update((current) => ({
      ...current,
      microActions: [
        ...current.microActions.filter((item) => item.sphere !== need),
        { sphere: need, action },
      ],
    }));
    updateSettings((settings) => ({
      ...settings,
      ideaIndexes: {
        ...settings.ideaIndexes,
        [need]: (settings.ideaIndexes[need] + 1) % ideas.length,
      },
    }));
  };

  const removeAction = (need: NeedId) => {
    update((current) => ({
      ...current,
      microActions: current.microActions.filter((item) => item.sphere !== need),
    }));
    if (customActionFor === need) {
      setCustomActionFor(null);
      setCustomActionDraft('');
    }
  };

  const replaceWithNextIdea = (need: NeedId) => {
    const ideas = INSPIRATION_IDEAS_I18N[language][need];
    const nextIndex = data.settings.ideaIndexes[need] % ideas.length;
    update((current) => ({
      ...current,
      microActions: current.microActions.map((item) =>
        item.sphere === need ? { ...item, action: ideas[nextIndex] } : item,
      ),
    }));
    updateSettings((settings) => ({
      ...settings,
      ideaIndexes: {
        ...settings.ideaIndexes,
        [need]: (settings.ideaIndexes[need] + 1) % ideas.length,
      },
    }));
    if (customActionFor === need) {
      setCustomActionFor(null);
      setCustomActionDraft('');
    }
  };

  const priorEntry = data.days[yesterday];
  const dateLabel = formatDate(today, language);

  return (
    <Screen
      title={dateLabel}
      subtitle={t.checkin_subtitle}
    >
      <StorageBanner message={saveError ? (language === 'ru' ? 'Не удалось сохранить изменения на устройстве. Проверьте свободное место и повторите.' : 'Could not save changes on this device. Check storage space and try again.') : null} />

      {NEEDS.map((need, needIndex) => {
        const tint = palette[need];
        const questions = SOCRATIC_POOL_I18N[language][need];
        const currentIndex = data.settings.questionIndexes[need] % questions.length;
        const question = questions[currentIndex];
        const savedAnswers = entry.answers[need] ?? [];
        const currentAnswer =
          savedAnswers.find((answer) => answer.question === question)?.answer ?? '';
        const previousAnswers = savedAnswers.filter(
          (answer) => answer.question !== question && answer.answer.trim(),
        );
        const action = entry.microActions.find((item) => item.sphere === need);
        return (
          <Animated.View
            key={need}
            entering={FadeInDown.duration(280).delay(needIndex * 60)}
          >
            <Card style={[styles.needCard, { borderLeftColor: tint }]}>
            <View style={styles.needHeading}>
              <View style={[styles.needIcon, { backgroundColor: palette[`${need}Soft`] }]}>
                <Feather name={needIcons[need]} size={18} color={tint} />
              </View>
              <SectionTitle>{t[`sphere_${need}`]}</SectionTitle>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t.checkin_other_question}
                testID={`other-question-${need}`}
                onPress={() => rotateQuestion(need)}
                style={({ pressed }) => [
                  styles.rotateQuestion,
                  pressed && styles.iconButtonPressed,
                ]}
              >
                <Feather name="refresh-cw" size={16} color={tint} />
              </Pressable>
            </View>
            <Animated.Text
              key={question}
              entering={FadeInDown.duration(220)}
              style={[styles.question, { color: palette.foreground }]}
            >
              “{question}”
            </Animated.Text>
            <View style={styles.questionBox}>
              <AppInput
                testID={`answer-${need}`}
                multiline
                value={currentAnswer}
                onChangeText={(value) => setAnswer(need, question, value)}
                placeholder={t.checkin_answer_placeholder}
                style={[styles.answerInput, { backgroundColor: palette.card }]}
              />
              {previousAnswers.length > 0 ? (
                <View style={styles.previousAnswers}>
                  <Text style={[styles.smallLabel, { color: palette.mutedForeground }]}>
                    {copy.earlierAnswers}
                  </Text>
                  {previousAnswers.map((answer) => (
                    <Text
                      key={answer.question}
                      style={[styles.previousAnswerText, { color: palette.mutedForeground }]}
                    >
                      {answer.question}{'\n'}{answer.answer}
                    </Text>
                  ))}
                </View>
              ) : null}
            </View>
            <View style={styles.scoreBlock}>
              <View style={styles.scoreLabels}>
                <Text style={[styles.scoreEndLabel, { color: palette.mutedForeground }]}>
                  {language === 'ru' ? 'СОВСЕМ НЕТ' : 'NOT AT ALL'}
                </Text>
                <Animated.Text
                  key={entry.scores[need]}
                  entering={FadeInDown.duration(140)}
                  exiting={FadeOutUp.duration(100)}
                  style={[styles.scoreValue, { color: tint }]}
                >
                  {entry.scores[need]}
                </Animated.Text>
                <Text style={[styles.scoreEndLabel, { color: palette.mutedForeground }]}>
                  {language === 'ru' ? 'ПОЛНОСТЬЮ' : 'FULLY'}
                </Text>
              </View>
              <ScoreSlider
                value={entry.scores[need]}
                label={t[`sphere_${need}`]}
                incrementLabel={language === 'ru' ? 'Увеличить' : 'Increase'}
                decrementLabel={language === 'ru' ? 'Уменьшить' : 'Decrease'}
                accentColor={tint}
                trackColor={palette.secondary}
                thumbColor={palette.card}
                shadowColor={palette.foreground}
                testID={`score-slider-${need}`}
                onValueChange={(score) =>
                  update((current) =>
                    current.scores[need] === score
                      ? current
                      : { ...current, scores: { ...current.scores, [need]: score } },
                  )
                }
              />
            </View>
            </Card>
          </Animated.View>
        );
      })}

      <Card>
        <SectionTitle>{copy.yesterday}</SectionTitle>
        {priorEntry?.microActions.length ? (
          <View style={styles.plannedList}>
            <Text style={[styles.smallLabel, { color: palette.mutedForeground }]}>
              {copy.planned}
            </Text>
            {priorEntry.microActions.map((item) => (
              <Text key={item.sphere} style={[styles.plannedItem, { color: palette.foreground }]}>
                · {t[`sphere_${item.sphere}`]} — {item.action}
              </Text>
            ))}
          </View>
        ) : null}
        <AppInput
          testID="yesterday-review"
          multiline
          value={entry.yesterdayReview}
          onChangeText={(value) =>
            update((current) => ({ ...current, yesterdayReview: value }))
          }
          placeholder={t.checkin_yesterday_placeholder}
          style={[styles.noteInput, { backgroundColor: palette.card }]}
        />
      </Card>

      <Card>
        <SectionTitle>{t.checkin_note_title}</SectionTitle>
        <AppInput
          testID="day-note"
          multiline
          value={entry.note}
          onChangeText={(value) => update((current) => ({ ...current, note: value }))}
          placeholder={t.checkin_note_placeholder}
          style={[styles.noteInput, { backgroundColor: palette.card }]}
        />
        <View style={styles.tagBlock}>
          <Text style={[styles.smallLabel, { color: palette.mutedForeground }]}>
            {copy.tags}
          </Text>
            <View style={styles.wrapRow}>
              {NEEDS.map((need) => {
                const selected = entry.noteTags.includes(need);
                return (
                  <Pressable
                    key={need}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={t[`sphere_${need}`]}
                    testID={`note-tag-${need}`}
                    onPress={() => toggleTag(need)}
                    style={({ pressed }) => [
                      styles.noteTag,
                      {
                        backgroundColor: selected ? palette[need] : palette[`${need}Soft`],
                        borderColor: selected ? palette[need] : `${palette[need]}66`,
                        opacity: pressed ? 0.76 : 1,
                      },
                    ]}
                  >
                    <Feather
                      name={needIcons[need]}
                      size={14}
                      color={selected ? palette.primaryForeground : palette[need]}
                    />
                    <Text
                      style={[
                        styles.noteTagText,
                        { color: selected ? palette.primaryForeground : palette[need] },
                      ]}
                    >
                      {t[`sphere_${need}`]}
                    </Text>
                  </Pressable>
                );
              })}
          </View>
        </View>
      </Card>

      <Card>
        <SectionTitle>{t.checkin_micro_title}</SectionTitle>
        <BodyText muted>{t.checkin_micro_subtitle}</BodyText>
        <View style={styles.tomorrowPicker}>
          {NEEDS.map((need) => {
            const selected = entry.microActions.some((item) => item.sphere === need);
            return (
              <Pressable
                key={need}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={t[`sphere_${need}`]}
                testID={`tomorrow-focus-${need}`}
                onPress={() => (selected ? removeAction(need) : addIdea(need))}
                style={({ pressed }) => [
                  styles.tomorrowPill,
                  {
                    backgroundColor: selected ? palette.warmSurface : 'transparent',
                    borderColor: selected ? palette[need] : palette.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Feather
                  name={selected ? 'check' : 'plus'}
                  size={16}
                  color={selected ? palette[need] : palette.mutedForeground}
                />
                <Feather name={needIcons[need]} size={16} color={palette[need]} />
                <Text
                  style={[
                    styles.tomorrowPillText,
                    { color: selected ? palette[need] : palette.mutedForeground },
                  ]}
                >
                  {t[`sphere_${need}`]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {entry.microActions.length ? (
          <View style={styles.selectedActions}>
            {NEEDS.map((need, needIndex) => {
              const selectedAction = entry.microActions.find((item) => item.sphere === need);
              if (!selectedAction) return null;
              return (
                <Animated.View
                  key={need}
                  entering={FadeInDown.duration(220).delay(needIndex * 45)}
                  style={[
                    styles.selectedActionCard,
                    { backgroundColor: palette.warmSurface, borderColor: palette.border },
                  ]}
                >
                  <View style={styles.selectedActionHeader}>
                    <View style={[styles.selectedActionIcon, { backgroundColor: palette[`${need}Soft`] }]}>
                      <Feather name={needIcons[need]} size={15} color={palette[need]} />
                    </View>
                    <Text style={[styles.selectedActionSphere, { color: palette[need] }]}>
                      {t[`sphere_${need}`]}
                    </Text>
                    <View style={styles.selectedActionControls}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={copy.otherIdea}
                        testID={`other-action-idea-${need}`}
                        onPress={() => replaceWithNextIdea(need)}
                        style={({ pressed }) => [
                          styles.actionIconButton,
                          pressed && styles.iconButtonPressed,
                        ]}
                      >
                        <Feather name="refresh-cw" size={15} color={palette.mutedForeground} />
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={copy.ownAction}
                        testID={`write-own-action-${need}`}
                        onPress={() => {
                          setCustomActionDraft(selectedAction.action);
                          setCustomActionFor(need);
                        }}
                        style={({ pressed }) => [
                          styles.actionIconButton,
                          pressed && styles.iconButtonPressed,
                        ]}
                      >
                        <Feather name="edit-3" size={15} color={palette.mutedForeground} />
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={copy.removeAction}
                        testID={`remove-action-${need}`}
                        onPress={() => removeAction(need)}
                        style={({ pressed }) => [
                          styles.actionIconButton,
                          pressed && styles.iconButtonPressed,
                        ]}
                      >
                        <Feather name="x" size={16} color={palette.mutedForeground} />
                      </Pressable>
                    </View>
                  </View>
                  {customActionFor === need ? (
                    <Animated.View entering={FadeInDown.duration(200)} style={styles.customActionForm}>
                      <AppInput
                        value={customActionDraft}
                        onChangeText={setCustomActionDraft}
                        placeholder={copy.ownActionPlaceholder}
                        returnKeyType="done"
                        testID={`custom-action-${need}`}
                        style={[styles.customActionInput, { backgroundColor: palette.card }]}
                      />
                      <AppButton
                        compact
                        variant="primary"
                        label={copy.saveOwnAction}
                        disabled={!customActionDraft.trim()}
                        testID={`save-custom-action-${need}`}
                        onPress={() => addCustomAction(need)}
                      />
                    </Animated.View>
                  ) : (
                    <Animated.Text
                      key={selectedAction.action}
                      entering={FadeInDown.duration(180)}
                      style={[styles.selectedActionText, { color: palette.foreground }]}
                    >
                      {selectedAction.action}
                    </Animated.Text>
                  )}
                </Animated.View>
              );
            })}
          </View>
        ) : null}
      </Card>

      <View style={styles.saveBlock}>
        <AppButton
          variant="primary"
          label={savedLabel ? copy.saved : t.checkin_save}
          testID="save-checkin"
          onPress={() => {
            update((current) => ({ ...current }));
            setSavedLabel(true);
            notifySuccess();
            setTimeout(() => setSavedLabel(false), 2400);
          }}
        />
        <Text style={[styles.autosave, { color: palette.mutedForeground }]}>
          {copy.saving}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  needCard: { borderLeftWidth: 3, paddingLeft: 15, gap: 17 },
  needHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  needIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  rotateQuestion: { marginLeft: 'auto', width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  iconButtonPressed: { opacity: 0.55, transform: [{ scale: 0.94 }] },
  scoreValue: { fontFamily: 'Lora_600SemiBold', fontSize: 17, minWidth: 20, textAlign: 'center' },
  scoreBlock: { gap: 12, paddingTop: 1 },
  scoreLabels: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scoreEndLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.65 },
  questionBox: { gap: 9 },
  smallLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase' },
  question: { fontFamily: 'Lora_400Regular_Italic', fontSize: 17, lineHeight: 26 },
  answerInput: { minHeight: 96 },
  previousAnswers: { gap: 8, paddingTop: 4 },
  previousAnswerText: { fontSize: 12, lineHeight: 18 },
  plannedList: { gap: 4 },
  plannedItem: { fontSize: 13, lineHeight: 20 },
  noteInput: { minHeight: 110 },
  tagBlock: { gap: 9 },
  noteTag: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderRadius: 15,
  },
  noteTagText: { fontFamily: 'DMSans_600SemiBold', fontSize: 12 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tomorrowPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, paddingTop: 3 },
  tomorrowPill: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 24,
  },
  tomorrowPillText: { fontFamily: 'DMSans_600SemiBold', fontSize: 13 },
  selectedActions: { gap: 10, paddingTop: 3 },
  selectedActionCard: { borderWidth: 1, borderRadius: 18, padding: 13, gap: 10 },
  selectedActionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selectedActionIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  selectedActionSphere: { fontFamily: 'DMSans_600SemiBold', fontSize: 12, flex: 1 },
  selectedActionControls: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  actionIconButton: { width: 34, height: 36, alignItems: 'center', justifyContent: 'center' },
  selectedActionText: { fontFamily: 'Lora_400Regular', fontSize: 15, lineHeight: 22 },
  customActionForm: { gap: 9 },
  customActionInput: { minHeight: 48 },
  saveBlock: { gap: 9, paddingTop: 42, paddingBottom: 8 },
  autosave: { textAlign: 'center', fontSize: 12 },
});
