import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
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
  const [scoreTrackWidth, setScoreTrackWidth] = useState(1);
  const [customActionFor, setCustomActionFor] = useState<NeedId | null>(null);
  const [customActionDraft, setCustomActionDraft] = useState('');

  const copy = useMemo(
    () =>
      language === 'ru'
        ? {
            today: 'Сегодня',
            scale: 'От совсем не ощущаю до полностью',
            yourAnswer: 'Ваш ответ',
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
            yourAnswer: 'Your answer',
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

  const setScoreFromTrack = (need: NeedId, locationX: number) => {
    const score = Math.max(0, Math.min(10, Math.round((locationX / scoreTrackWidth) * 10)));
    update((current) =>
      current.scores[need] === score
        ? current
        : { ...current, scores: { ...current.scores, [need]: score } },
    );
  };

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
            <View style={[styles.questionBox, { backgroundColor: palette.warmSurface }]}>
              <Text style={[styles.smallLabel, { color: palette.mutedForeground }]}>
                {copy.yourAnswer}
              </Text>
              <AppInput
                testID={`answer-${need}`}
                multiline
                value={currentAnswer}
                onChangeText={(value) => setAnswer(need, question, value)}
                placeholder={t.checkin_answer_placeholder}
                style={styles.answerInput}
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
                <Text style={[styles.scoreValue, { color: tint }]}>
                  {entry.scores[need]}
                </Text>
                <Text style={[styles.scoreEndLabel, { color: palette.mutedForeground }]}>
                  {language === 'ru' ? 'ПОЛНОСТЬЮ' : 'FULLY'}
                </Text>
              </View>
              <View
                accessibilityRole="adjustable"
                accessibilityLabel={t[`sphere_${need}`]}
                accessibilityValue={{ min: 0, max: 10, now: entry.scores[need] }}
                accessibilityActions={[
                  { name: 'increment', label: language === 'ru' ? 'Увеличить' : 'Increase' },
                  { name: 'decrement', label: language === 'ru' ? 'Уменьшить' : 'Decrease' },
                ]}
                onAccessibilityAction={(event) => {
                  const delta = event.nativeEvent.actionName === 'increment' ? 1 : -1;
                  update((current) => ({
                    ...current,
                    scores: {
                      ...current.scores,
                      [need]: Math.max(0, Math.min(10, current.scores[need] + delta)),
                    },
                  }));
                }}
                onLayout={(event) => setScoreTrackWidth(Math.max(1, event.nativeEvent.layout.width))}
                onStartShouldSetResponder={() => true}
                onMoveShouldSetResponder={() => true}
                onResponderGrant={(event) => setScoreFromTrack(need, event.nativeEvent.locationX)}
                onResponderMove={(event) => setScoreFromTrack(need, event.nativeEvent.locationX)}
                style={styles.scoreTouchTarget}
              >
                <View
                  pointerEvents="none"
                  style={[styles.scoreTrack, { backgroundColor: palette.secondary }]}
                >
                  <View
                    style={[
                      styles.scoreFill,
                      { width: `${entry.scores[need] * 10}%`, backgroundColor: tint },
                    ]}
                  />
                  <View
                    style={[
                      styles.scoreThumb,
                      {
                        left: `${entry.scores[need] * 10}%`,
                        borderColor: tint,
                        backgroundColor: palette.card,
                        shadowColor: palette.foreground,
                      },
                    ]}
                  />
                </View>
              </View>
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
          style={styles.noteInput}
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
          style={styles.noteInput}
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
        {NEEDS.map((need, needIndex) => {
          const ideas = INSPIRATION_IDEAS_I18N[language][need];
          const index = data.settings.ideaIndexes[need] % ideas.length;
          const selected = entry.microActions.find((item) => item.sphere === need);
          return (
            <Animated.View
              key={need}
              entering={FadeInDown.duration(240).delay(needIndex * 55)}
              style={[
                styles.ideaBlock,
                {
                    backgroundColor: palette.card,
                  borderColor: palette.border,
                },
              ]}
            >
              <View style={styles.ideaHeading}>
                <View style={[styles.ideaIcon, { backgroundColor: palette.card }]}>
                  <Feather name={needIcons[need]} size={15} color={palette[need]} />
                </View>
                <Text style={[styles.ideaSphere, { color: palette[need] }]}>
                  {t[`sphere_${need}`]}
                </Text>
                {!selected ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={copy.otherIdea}
                    testID={`other-action-idea-${need}`}
                    onPress={() =>
                      updateSettings((settings) => ({
                        ...settings,
                        ideaIndexes: {
                          ...settings.ideaIndexes,
                          [need]: (settings.ideaIndexes[need] + 1) % ideas.length,
                        },
                      }))
                    }
                    style={({ pressed }) => [
                      styles.rotateIdea,
                      pressed && styles.iconButtonPressed,
                    ]}
                  >
                    <Feather name="refresh-cw" size={16} color={palette[need]} />
                  </Pressable>
                ) : null}
              </View>
              {selected ? (
                <View style={styles.selectedAction}>
                  <Feather name="check-circle" size={17} color={palette[need]} />
                  <BodyText style={styles.selectedActionText}>{selected.action}</BodyText>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={copy.removeAction}
                    testID={`remove-action-${need}`}
                    onPress={() =>
                      update((current) => ({
                        ...current,
                        microActions: current.microActions.filter((item) => item.sphere !== need),
                      }))
                    }
                    style={({ pressed }) => [
                      styles.removeActionButton,
                      pressed && styles.iconButtonPressed,
                    ]}
                  >
                    <Feather name="x" size={16} color={palette.mutedForeground} />
                  </Pressable>
                </View>
              ) : (
                <>
                  <Animated.Text
                    key={`${need}-${index}`}
                    entering={FadeInDown.duration(220)}
                    style={[styles.ideaText, { color: palette.foreground }]}
                  >
                    {ideas[index]}
                  </Animated.Text>
                  <AppButton
                    compact
                    label={copy.addAction}
                    testID={`add-suggested-action-${need}`}
                    onPress={() => addIdea(need)}
                  />
                </>
              )}
              {customActionFor === need ? (
                <Animated.View entering={FadeInDown.duration(220)} style={styles.customActionForm}>
                  <AppInput
                    value={customActionDraft}
                    onChangeText={setCustomActionDraft}
                    placeholder={copy.ownActionPlaceholder}
                    returnKeyType="done"
                    testID={`custom-action-${need}`}
                    style={styles.customActionInput}
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
                <Pressable
                  accessibilityRole="button"
                  testID={`write-own-action-${need}`}
                  onPress={() => {
                    setCustomActionDraft('');
                    setCustomActionFor(need);
                  }}
                  style={({ pressed }) => [
                    styles.ownActionButton,
                    pressed && styles.iconButtonPressed,
                  ]}
                >
                  <Feather name="edit-3" size={14} color={palette.mutedForeground} />
                  <Text style={[styles.ownActionText, { color: palette.mutedForeground }]}>
                    {copy.ownAction}
                  </Text>
                </Pressable>
              )}
            </Animated.View>
          );
        })}
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
  scoreTouchTarget: { height: 34, justifyContent: 'center', position: 'relative' },
  scoreTrack: { height: 5, borderRadius: 6, position: 'absolute', left: 0, right: 0, overflow: 'visible' as const },
  scoreFill: { height: '100%', borderRadius: 6, position: 'absolute', top: 0 },
  scoreThumb: {
    position: 'absolute',
    top: -6,
    marginLeft: -9,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  questionBox: { gap: 9, padding: 14, borderRadius: 16 },
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
  ideaBlock: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 20, padding: 14, gap: 10 },
  ideaHeading: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  ideaIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  ideaSphere: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, letterSpacing: 0.25 },
  ideaText: { fontFamily: 'Lora_400Regular', fontSize: 15, lineHeight: 22 },
  rotateIdea: { marginLeft: 'auto', width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  selectedAction: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  selectedActionText: { flex: 1, fontFamily: 'Lora_400Regular', fontSize: 15, lineHeight: 22 },
  removeActionButton: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  ownActionButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 7 },
  ownActionText: { fontFamily: 'DMSans_500Medium', fontSize: 12 },
  customActionForm: { gap: 9 },
  customActionInput: { minHeight: 48 },
  saveBlock: { gap: 9, paddingBottom: 8 },
  autosave: { textAlign: 'center', fontSize: 12 },
});
