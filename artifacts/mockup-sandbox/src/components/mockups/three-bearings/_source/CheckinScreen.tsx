import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from './haptics';
import { NEEDS, type NeedId } from './needs';
import {
  type DailyEntry,
  localDateKey,
  shiftDateKey,
  useOfflineStore,
} from './offline-store';
import {
  INSPIRATION_IDEAS_I18N,
  SOCRATIC_POOL_I18N,
  UI,
} from './translations';
import {
  AppButton,
  AppInput,
  BodyText,
  Card,
  Screen,
  SectionTitle,
  StorageBanner,
} from './primitives';
import { useAppColors } from './useAppColors';

const formatDate = (date: string, language: 'ru' | 'en') =>
  new Date(`${date}T12:00:00`).toLocaleDateString(
    language === 'ru' ? 'ru-RU' : 'en-US',
    { weekday: 'long', day: 'numeric', month: 'long' },
  );

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

  const copy = useMemo(
    () =>
      language === 'ru'
        ? {
            today: 'Сегодня',
            scale: 'От совсем не ощущаю до полностью',
            question: 'Вопрос дня',
            yourAnswer: 'Ваш ответ',
            earlierAnswers: 'Ранее записанные ответы',
            yesterday: 'Что сработало вчера?',
            planned: 'Вчера вы выбрали:',
            tags: 'Что было важным?',
            actions: 'Что я могу изменить завтра?',
            addAction: 'Добавить идею',
            removeAction: 'Убрать',
            saved: 'Запись сохранена на этом устройстве',
            saving: 'Ответы сохраняются локально при вводе',
            note: 'Заметка дня',
            scores: 'Три потребности',
          }
        : {
            today: 'Today',
            scale: 'From not at all to fully',
            question: 'Today’s question',
            yourAnswer: 'Your answer',
            earlierAnswers: 'Earlier answers',
            yesterday: 'What worked yesterday?',
            planned: 'Yesterday you chose:',
            tags: 'What mattered today?',
            actions: 'What can I change tomorrow?',
            addAction: 'Add this idea',
            removeAction: 'Remove',
            saved: 'Entry saved on this device',
            saving: 'Answers save locally as you type',
            note: 'Day note',
            scores: 'Three needs',
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
      title={t.nav_today}
      subtitle={`${dateLabel} · ${t.checkin_subtitle}`}
    >
      <StorageBanner message={saveError ? (language === 'ru' ? 'Не удалось сохранить изменения на устройстве. Проверьте свободное место и повторите.' : 'Could not save changes on this device. Check storage space and try again.') : null} />

      <Card style={styles.introCard}>
        <Text style={[styles.introTitle, { color: palette.foreground }]}>
          {copy.scores}
        </Text>
        <Text style={[styles.introText, { color: palette.mutedForeground }]}>
          {copy.scale}
        </Text>
      </Card>

      {NEEDS.map((need) => {
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
          <Card
            key={need}
            style={[styles.needCard, { borderLeftColor: tint }]}
          >
            <View style={styles.needHeading}>
              <View style={[styles.needDot, { backgroundColor: tint }]} />
              <SectionTitle>{t[`sphere_${need}`]}</SectionTitle>
              <Text style={[styles.scoreValue, { color: tint }]}>
                {entry.scores[need]}/10
              </Text>
            </View>
            <View style={styles.scoreControl}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={language === 'ru' ? 'Уменьшить оценку' : 'Lower score'}
                testID={`score-minus-${need}`}
                onPress={() =>
                  update((current) => ({
                    ...current,
                    scores: {
                      ...current.scores,
                      [need]: Math.max(0, current.scores[need] - 1),
                    },
                  }))
                }
                style={[styles.stepper, { backgroundColor: palette.secondary }]}
              >
                <Text style={[styles.stepperLabel, { color: palette.foreground }]}>−</Text>
              </Pressable>
              <View style={[styles.scoreTrack, { backgroundColor: palette.secondary }]}>
                <View
                  style={[
                    styles.scoreFill,
                    { width: `${entry.scores[need] * 10}%`, backgroundColor: tint },
                  ]}
                />
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={language === 'ru' ? 'Увеличить оценку' : 'Raise score'}
                testID={`score-plus-${need}`}
                onPress={() =>
                  update((current) => ({
                    ...current,
                    scores: {
                      ...current.scores,
                      [need]: Math.min(10, current.scores[need] + 1),
                    },
                  }))
                }
                style={[styles.stepper, { backgroundColor: palette.secondary }]}
              >
                <Text style={[styles.stepperLabel, { color: palette.foreground }]}>+</Text>
              </Pressable>
            </View>
            <View style={[styles.questionBox, { backgroundColor: palette.muted }]}>
              <Text style={[styles.smallLabel, { color: tint }]}>{copy.question}</Text>
              <Text style={[styles.question, { color: palette.foreground }]}>
                {question}
              </Text>
              <AppButton
                compact
                label={t.checkin_other_question}
                onPress={() => rotateQuestion(need)}
              />
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
          </Card>
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
            {NEEDS.map((need) => (
              <AppButton
                key={need}
                compact
                selected={entry.noteTags.includes(need)}
                label={t[`sphere_${need}`]}
                onPress={() => toggleTag(need)}
              />
            ))}
          </View>
        </View>
      </Card>

      <Card>
        <SectionTitle>{t.checkin_micro_title}</SectionTitle>
        <BodyText muted>{t.checkin_micro_subtitle}</BodyText>
        {NEEDS.map((need) => {
          const ideas = INSPIRATION_IDEAS_I18N[language][need];
          const index = data.settings.ideaIndexes[need] % ideas.length;
          const selected = entry.microActions.find((item) => item.sphere === need);
          return (
            <View key={need} style={[styles.ideaBlock, { borderColor: palette.border }]}>
              <Text style={[styles.smallLabel, { color: palette[need] }]}>
                {t[`sphere_${need}`]}
              </Text>
              {selected ? (
                <>
                  <BodyText>{selected.action}</BodyText>
                  <AppButton
                    compact
                    label={copy.removeAction}
                    onPress={() =>
                      update((current) => ({
                        ...current,
                        microActions: current.microActions.filter((item) => item.sphere !== need),
                      }))
                    }
                  />
                </>
              ) : (
                <>
                  <BodyText>{ideas[index]}</BodyText>
                  <AppButton
                    compact
                    label={copy.addAction}
                    onPress={() => addIdea(need)}
                  />
                </>
              )}
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  updateSettings((settings) => ({
                    ...settings,
                    ideaIndexes: {
                      ...settings.ideaIndexes,
                      [need]: (settings.ideaIndexes[need] + 1) % ideas.length,
                    },
                  }))
                }
              >
                <Text style={[styles.linkText, { color: palette.primary }]}>
                  {t.checkin_ideas_other}
                </Text>
              </Pressable>
            </View>
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
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
  introCard: { gap: 5, paddingVertical: 15 },
  introTitle: { fontSize: 15, fontWeight: '600' },
  introText: { fontSize: 13 },
  needCard: { borderLeftWidth: 3, paddingLeft: 15 },
  needHeading: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  needDot: { width: 9, height: 9, borderRadius: 5 },
  scoreValue: { marginLeft: 'auto', fontSize: 18, fontWeight: '700' },
  scoreControl: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepper: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepperLabel: { fontSize: 21, lineHeight: 24, fontWeight: '500' },
  scoreTrack: { height: 7, borderRadius: 6, flex: 1, overflow: 'hidden' },
  scoreFill: { height: '100%', borderRadius: 6 },
  questionBox: { gap: 10, padding: 14, borderRadius: 16 },
  smallLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase' },
  question: { fontFamily: 'Lora_400Regular', fontSize: 16, lineHeight: 24 },
  answerInput: { minHeight: 96 },
  previousAnswers: { gap: 8, paddingTop: 4 },
  previousAnswerText: { fontSize: 12, lineHeight: 18 },
  plannedList: { gap: 4 },
  plannedItem: { fontSize: 13, lineHeight: 20 },
  noteInput: { minHeight: 110 },
  tagBlock: { gap: 9 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ideaBlock: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12, gap: 9 },
  linkText: { fontSize: 13, fontWeight: '600' },
  saveBlock: { gap: 9, paddingBottom: 8 },
  autosave: { textAlign: 'center', fontSize: 12 },
});
